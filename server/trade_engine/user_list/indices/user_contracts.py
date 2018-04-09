from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_version import DictionaryDictionaryVersion

from models.models.contract import Contract, ContractStatus
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
            "equity_id",
            "user_id",
            model_name="contracts",
            events=self.trade_engine.events
        )

    def subscribe_to_events(self, events):
        events.subscribe("make_contract", self.make_contract)

    def get_next_id(self):
        return self.trade_engine.contract_list.get_next_id()

    def make_contract(self, order, price, quantity, is_maker):
        contract = self.contracts.get_item(order)

        new_contract_quantity = quantity

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
                new_contract.quantity = max(0, old_contract.quantity - quantity)
                new_contract_quantity = max(0, quantity - old_contract.quantity)

            new_contract.modified_id = self.get_next_id()

            if new_contract.quantity == 0:
                new_contract.status = ContractStatus.CLOSED
                new_contract.closed_date = datetime.datetime.utcnow()

            self.trade_engine.events.trigger(
                "contracts_update_item",
                new_contract,
                old_contract,
                is_maker
            )

        if new_contract_quantity != 0:
            contract_id = self.get_next_id()
            self.trade_engine.events.trigger(
                "contracts_insert_item",
                Contract(
                    equity_id=order.equity_id,
                    contract_id=contract_id,
                    user_id=order.user_id,
                    modified_id=contract_id,
                    is_long=order.is_long,
                    quantity=new_contract_quantity,
                    price=price * Contract.PRICE_MULTIPLIER,
                    status=ContractStatus.OPENED,
                    created_date=datetime.datetime.utcnow(),
                    closed_date=None
                ),
                is_maker
            )




