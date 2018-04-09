from transactional_data_structures.transactional import Transactional

from transactional_data_structures.events import Events
from contract_list.contract_list import ContractList
from equity_list.equity_list import EquityList
from order_book.order_book import OrderBook
from trading_fees.trading_fees import TradingFees
from transaction_list.transaction_list import TransactionList
from user_list.user_list import UserList


class TradeEngine(Transactional):
    def __init__(self):
        self.events = Events()

        self.contract_list = ContractList(self)
        self.equity_list = EquityList(self)
        self.order_book = OrderBook(self)
        self.trading_fees = TradingFees(self)
        self.transaction_list = TransactionList(self)
        self.user_list = UserList(self)


trade_engine = TradeEngine()
