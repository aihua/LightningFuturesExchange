from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.dictionary_auto_incrementer_version import DictionaryAutoIncrementerVersion
from indices.open_contracts import OpenContracts
from indices.contracts_modified import ContractsModified
from models.models.contract import Contract
from models.models.user import User
from models.models.contract_id import ContractId
import random


class ContractList(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.contracts = DictionaryArrayVersion(
            {},
            Contract.id_comparer,
            "equity_id",
            model_name="contracts",
            events=self.trade_engine.events
        )

        self.contracts_id = DictionaryAutoIncrementerVersion(
            {},
            "equity_id",
            "contract_id",
            ContractId
        )

        self.open_contracts = OpenContracts(self.trade_engine)
        self.contracts_modified = ContractsModified(self.trade_engine)

        self.subscribe_to_events(trade_engine.events)

    def get_contract(self, contract):
        return self.contracts.get_item(contract)

    def get_contracts(self, contract):
        return self.contracts.get_list(contract)

    def subscribe_to_events(self, events):
        events.subscribe("match_orders", self.match_orders)
        events.subscribe("insolvent_margin_call", self.insolvent_margin_call)

    def initialize(self):
        return

    def get_next_id(self, contract):
        self.transactions_id.get_next_id(contract)

    def match_orders(self, order, matched_order):
        quantity = min(order.remaining_quantity(), matched_order.remaining_quantity())
        price = matched_order.price

        new_order = order.clone()
        new_matched_order = matched_order.clone()

        new_order.quantity = quantity
        new_order.price = price

        new_matched_order.quantity = quantity
        new_matched_order.price = price

        self.trade_engine.trigger("make_contract", new_order, False)
        self.trade_engine.trigger("make_contract", new_matched_order, True)

    def insolvent_margin_call(self, equity, insolvent_contract, balance, user_balance_updates):
        contracts = self.get_contracts(equity)

        total_quantity = 0
        for contract in contracts:
            if contract.is_long != insolvent_contract.is_long:
                total_quantity += contract.quantity

        balance_num = balance // total_quantity
        balance_rem = balance % total_quantity

        for contract in contracts:
            if contract.user_id not in user_balance_updates:
                user_balance_updates[contract.user_id] = User(user_id=contract.user_id, balance=0)

            user_balance_updates[contract.user_id].balance += balance_num * contract.quantity

        for i in range(0, balance_rem):
            pick_random = random.randint(0, total_quantity - 1)
            temp_quantity = 0

            for contract in contracts:
                if temp_quantity <= pick_random < temp_quantity + contract.quantity:
                    user_balance_updates[contract.user_id].balance += 1