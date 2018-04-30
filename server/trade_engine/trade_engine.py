from transactional_data_structures.transactional import Transactional

from transactional_data_structures.events import Events
from contract_list.contract_list import ContractList
from equity_list.equity_list import EquityList
from order_book.order_book import OrderBook
from trading_fees.trading_fees import TradingFees
from transaction_list.transaction_list import TransactionList
from user_list.user_list import UserList
from locks.reader_writer.reader_writer_lock_dic import ReaderWriterLockDic
from locks.lock.lock_dic import LockDic
from app import db
from helpers.helper import quick_sort, comparer, comparer_dec


class TradeEngine(Transactional):
    def __init__(self):
        self.events = Events()

        self.contract_list = ContractList(self)
        self.equity_list = EquityList(self)
        self.order_book = OrderBook(self)
        self.trading_fees = TradingFees(self)
        self.transaction_list = TransactionList(self)
        self.user_list = UserList(self)
        self.reader_writer_lock_dic = ReaderWriterLockDic()
        self.lock_dic = LockDic()

        self.new_locks = None
        self.new_reader_locks = None
        self.new_writer_locks = None

    def get_bitcoin_price(self):
        pass

    def execute_func(self, quick_lock_func, func, *args, **kwargs):
        context = self.clone(root_name="trade_engine")

        locks = {}
        reader_locks = {}
        writer_locks = {}

        try:
            if quick_lock_func is not None:
                getattr(context, quick_lock_func)()

            (locks, reader_locks, writer_locks) = context.acquire_locks(locks, reader_locks, writer_locks)
            while True:
                getattr(context, func)(*args, **kwargs)
                if context.check_locks(locks, reader_locks, writer_locks):
                    try:
                        context.commit(db)
                    except Exception:
                        # TODO: Send email to admin letting him know of critical failure.
                        exit(-1)

                else:
                    context.roll_back()
                    (locks, reader_locks, writer_locks) = context.acquire_locks(locks, reader_locks, writer_locks)
        except Exception as e:
            context.release_locks(locks, reader_locks, writer_locks)
            raise e

        context.release_locks(locks, reader_locks, writer_locks)

    def place_order(self, order):
        self.execute_func(None, "_place_order", order)

    def cancel_order(self, order):
        self.execute_func(None, "_cancel_order", order)

    def deposit(self, user_id, amount):
        self.execute_func(None, "_deposit", user_id, amount)

    def withdrawal(self, user_id, amount):
        self.execute_func(None, "_withdrawal", user_id, amount)

    def update_bitcoin_price(self, new_bitcoin_price):
        self.execute_func(None, "_update_bitcoin_price", new_bitcoin_price)

    def pay_interest(self):
        self.execute_func(None, "_pay_interest")

    def _place_order(self, order):
        self.order_book.place_order(order)

    def _cancel_order(self, order):
        self.order_book.cancel_order(order)

    def _deposit(self, user_id, amount):
        pass

    def _withdrawal(self, user_id, amount):
        pass

    def _update_bitcoin_price(self, new_bitcoin_price):
        pass

    def acquire_locks(self, locks, reader_locks, writer_locks):
        last_lock_type = ""
        last_key = ""

        if self.new_locks is None:
            self.new_locks = {}

        if self.new_writer_locks is None:
            self.new_writer_locks = {}

        if self.new_reader_locks is None:
            self.new_reader_locks = {}

        # Find common lock point between new locks and old locks
        for key in quick_sort(self.new_writer_locks.keys(), comparer):
            if key not in writer_locks:
                last_lock_type = "writer_lock"
                last_key = key
                break

        for key in quick_sort(self.new_reader_locks.keys(), comparer):
            if key not in reader_locks:
                last_lock_type = "reader_lock"
                last_key = key
                break

        for key in quick_sort(self.new_locks.keys(), comparer):
            if key not in locks:
                last_lock_type = "lock"
                last_key = key
                break

        if last_lock_type == "":
            return

        # Release Locks
        if last_lock_type == "lock" or last_lock_type == "reader_lock" or last_lock_type == "writer_lock":
            for key in quick_sort(locks.keys(), comparer_dec):
                if last_lock_type == "lock" and last_key > key:
                    break
                self.lock_dic.release(key)

        if last_lock_type == "reader_lock" or last_lock_type == "writer_lock":
            for key in quick_sort(locks.keys(), comparer_dec):
                if last_lock_type == "reader_lock" and last_key > key:
                    break
                self.reader_writer_lock_dic.release_read(key)

        if last_lock_type == "writer_lock":
            for key in quick_sort(locks.keys(), comparer_dec):
                if last_lock_type == "writer_lock" and last_key > key:
                    break
                self.reader_writer_lock_dic.release_write(key)

        # Combine both locks
        new_locks = {}
        new_reader_locks = {}
        new_writer_locks = {}

        for key in self.new_locks:
            new_locks[key] = True

        for key in self.new_reader_locks:
            new_reader_locks[key] = True

        for key in self.new_writer_locks:
            new_writer_locks[key] = True

        for key in locks:
            if key not in new_locks:
                new_locks[key] = True

        for key in reader_locks:
            if key not in new_reader_locks:
                new_reader_locks[key] = True

        for key in writer_locks:
            if key not in new_writer_locks:
                new_writer_locks[key] = True

        # Acquire new locks
        if last_lock_type == "writer_lock":
            for key in quick_sort(new_writer_locks.keys(), comparer):
                if key >= last_key:
                    self.reader_writer_lock_dic.acquire_write(key)

        if last_lock_type == "writer_lock" or last_lock_type == "reader_lock":
            for key in quick_sort(new_reader_locks.keys(), comparer):
                if key >= last_key or last_lock_type == "writer_lock":
                    self.reader_writer_lock_dic.acquire_read(key)

        if last_lock_type == "writer_lock" or last_lock_type == "reader_lock" or last_lock_type == "lock":
            for key in quick_sort(new_reader_locks.keys(), comparer):
                if key >= last_key or last_lock_type == "writer_lock" or last_lock_type == "reader_lock":
                    self.locks.acquire(key)

        # Return Locks
        return new_locks, new_reader_locks, new_writer_locks

    def check_locks(self, locks, reader_locks, writer_locks):
        if len(writer_locks) != len(self.new_writer_locks):
            return False

        if len(reader_locks) != len(self.new_reader_locks):
            return False

        if len(locks) != len(self.new_locks):
            return False

        for key in self.new_locks.keys():
            if key not in locks[key]:
                return False

        for key in self.new_writer_locks.keys():
            if key not in writer_locks[key]:
                return False

        for key in self.new_reader_locks.keys():
            if key not in reader_locks[key]:
                return False

        return True

    def release_locks(self, locks, reader_locks, writer_locks):
        for key in quick_sort(locks.keys(), comparer_dec):
            self.lock_dic.release(key)

        for key in quick_sort(reader_locks.keys(), comparer_dec):
            self.reader_writer_lock_dic.release_read(key)

        for key in quick_sort(writer_locks.keys(), comparer_dec):
            self.reader_writer_lock_dic.release_write(key)


trade_engine = TradeEngine()
