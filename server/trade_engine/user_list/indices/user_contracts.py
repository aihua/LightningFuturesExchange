from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_version import DictionaryDictionaryVersion

from models.models.contract import Contract, ContractStatus
from models.models.order import Order, OrderType, OrderStatus
import datetime
import math


class UserContracts(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.contracts = DictionaryDictionaryVersion(
            {},
            Contract.id_comparer,
            "user_id",
            "equity_id",
            model_name="contracts",
            events=self.trade_engine.events
        )

    def subscribe_to_events(self, events):
        events.subscribe("make_contract", self.make_contract)
        events.subscribe("user_margin_call", self.user_margin_call)

    def get_next_id(self):
        return self.trade_engine.contract_list.get_next_id()

    def make_contract(self, order, is_maker):
        contract = self.contracts.get_item(order)

        new_contract_quantity = order.quantity

        if contract is not None:
            old_contract = contract
            new_contract = old_contract.clone()

            if new_contract.is_long == order.is_long:
                new_contract.quantity = order.quantity + old_contract.quantity

                price_num = ((old_contract.price * old_contract.quantity) + (order.quantity * order.price * Contract.PRICE_MULTIPLIER))
                price_float = price_num / (new_contract.quantity + 0.0)

                new_contract.price = math.floor(price_float) if new_contract.is_long else math.ceil(price_float)
                new_contract_quantity = 0
            else:
                new_contract.quantity = max(0, old_contract.quantity - order.quantity)
                new_contract_quantity = max(0, order.quantity - old_contract.quantity)

            new_contract.modified_id = self.get_next_id()

            if new_contract.quantity == 0:
                new_contract.status = ContractStatus.CLOSED
                new_contract.closed_date = datetime.datetime.utcnow()

            self.trade_engine.events.trigger("contracts_update_item", new_contract, old_contract, is_maker)

        if new_contract_quantity != 0:
            contract_id = self.get_next_id()

            new_contract = Contract(
                equity_id=order.equity_id,
                contract_id=contract_id,
                user_id=order.user_id,
                modified_id=contract_id,
                is_long=order.is_long,
                quantity=new_contract_quantity,
                price=order.price * Contract.PRICE_MULTIPLIER,
                status=ContractStatus.OPENED,
                created_date=datetime.datetime.utcnow(),
                closed_date=None
            )

            self.trade_engine.events.trigger("contracts_insert_item", new_contract, is_maker)

    def user_has_contracts(self, user):
        user_contracts = self.contract.dic[user.user_id]

        for key in user_contracts.keys():
            order = Order()
            order.equity_id = key
            order.user_id = user.user_id

            contract = self.contracts.get_item(order)

            if contract is None:
                continue

            return True
        return False

    def user_margin_call(self, user):
        user_contracts = self.contract.dic[user.user_id]

        for key in user_contracts.keys():
            order = Order()
            order.equity_id = key
            order.user_id = user.user_id

            contract = self.contracts.get_item(order)

            if contract is None:
                continue

            market_order = Order.new_market_order(
                order.equity_id,
                self.trade_engine.order_book.get_next_id(),
                user.user_id,
                not contract.is_long,
                contract.quantity,
            )
            market_order.is_margin_call = True

            if not user.is_margin_called:
                new_user = user.clone()
                new_user.is_margin_called = True
                self.trade_engine.events.trigger("users_update_item", new_user, user)

            if self.trade_engine.order_book.place_order(market_order, is_margin_call=True):
                self.trade_engine.events.trigger("cancel_order", market_order)

                user = self.trade_engine.user_list.get_user(user)

                if user.is_margin_called and not self.user_has_contracts(user):
                    new_user = user.clone()
                    new_user.margin_used = 0.0
                    new_user.margin_used_percent = 0.0
                    new_user.is_margin_called = False
                    self.trade_engine.events.trigger("users_update_item", new_user, user)

            return





