from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_array_version import DictionaryArrayVersion
from transactional_data_structures.dictionary_auto_incrementer_version import DictionaryAutoIncrementerVersion
from indices.open_contracts import OpenContracts
from indices.contracts_modified import ContractsModified
from models.models.contract import Contract
from models.models.contract_id import ContractId


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
