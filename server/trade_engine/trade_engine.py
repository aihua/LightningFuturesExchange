from models.models.user import User
from models.models.equity import Equity
from models.models.contract import Contract, ContractStatus
from models.models.contract_id import ContractId
from models.models.order import Order, OrderStatus, OrderType
from models.models.order_id import OrderId
from models.models.transaction import Transaction
from models.models.transaction_id import TransactionId
from models.models.exchange_fee import ExchangeFee
from models.models.currency import Currency

import json
import urllib2
import datetime
import thread

from reader_writer_lock import ReaderWriterLockDic

from shared.shared import db

from dictionary_array_version import DictionaryArrayVersion, DictionaryDictionaryArrayVersion
from helpers.helper import quick_sort

class TradeEngine:
    def __init__(self):
        self.exchange_fee = None

        self.last_fetched_bitcoin_price = None
        self.bitcoin_price = None

        self.currencies = None

        self.users = None
        self.usernames = None
        self.user_emails = None

        self.equities = None

        self.contract_equities = None

        self.contract_open_long_equities = None
        self.contract_open_short_equities = None

        self.contract_open_long_users = None
        self.contract_open_short_users = None

        self.contract_users = None
        self.contract_ids = None

        self.order_equities = None
        self.order_users = None

        self.order_open_long_limit = None
        self.order_open_short_limit = None

        self.order_open_long_trigger = None
        self.order_open_short_trigger = None

        self.order_open_long_trailing = None
        self.order_open_short_trailing = None

        self.order_ids = None

        self.transaction_equities = None
        self.transaction_users = None
        self.transaction_ids = None

        self.reader_writer_lock_dic = ReaderWriterLockDic()

    def init(self):
        self.init_exchange_fee()
        self.init_currencies()
        self.init_users()
        self.init_equities()
        self.init_contracts()
        self.init_transactions()
        self.init_orders()
        self.init_user_margins()

    def init_exchange_fee(self):
        self.exchange_fee = ExchangeFee.quer.filter_by(exchange_id=1).first()

    def init_currencies(self):
        currencies = Currency.query.all()

        self.currencies = {}

        for currency in currencies:
            self.currencies[currency.id] = currency

    def init_users(self):
        users = User.query.order_by(User.user_id).all()

        self.users = {}
        self.usernames = {}
        self.user_emails = {}

        for user in users:
            self.users[user.user_id] = user
            self.usernames[user.username] = user
            self.user_emails[user.email] = user

    def init_equities(self):
        equities = Equity.query.order_by(Equity.equity_id).all()

        self.equities = {}

        for equity in equities:
            self.equities[equity.equity_id] = equity

    def init_contracts(self):
        contracts = Contract.query.order_by(Contract.equity_id, Contract.contract_id).all()
        contract_ids = ContractId.query.order_by(ContractId.equity_id).all()

        self.contract_equities = {}
        self.contract_users = {}

        self.contract_open_long_equities = {}
        self.contract_open_short_equities = {}

        self.contract_open_long_users = {}
        self.contract_open_short_users = {}

        self.contract_ids = {}

        for contract in contracts:
            if contract.equity_id not in self.contract_equities:
                self.contract_equities[contract.equity_id] = []

            if contract.user_id not in self.contract_users:
                self.contract_users[contract.user_id] = {}

            if contract.equity_id not in self.contract_users[contract.user_id]:
                self.contract_users[contract.user_id][contract.equity_id] = []

            self.contract_equities[contract.equity_id].append(contract)
            self.contract_users[contract.user_id][contract.equity_id].append(contract)

            # Init Long and Short contract indices
            if contract.status == ContractStatus.OPENED:
                if contract.is_buy:
                    if contract.equity_id not in self.contract_open_long_equities:
                        self.contract_open_long_equities[contract.equity_id] = []

                    if contract.user_id not in self.contract_open_long_users:
                        self.contract_open_long_users[contract.user_id] = {}

                    self.contract_open_long_equities[contract.equity_id].append(contract)
                    self.contract_open_long_users[contract.user_id][contract.equity_id] = contract
                else:
                    if contract.equity_id not in self.contract_open_short_equities:
                        self.contract_open_short_equities[contract.equity_id] = []

                    if contract.user_id not in self.contract_open_short_users:
                        self.contract_open_short_users[contract.user_id] = {}

                    self.contract_open_short_equities[contract.equity_id].append(contract)
                    self.contract_open_short_users[contract.user_id][contract.equity_id] = contract

        for contract_id in contract_ids:
            self.contract_ids[contract_id.equity_id] = contract_id

    def init_transactions(self):
        transactions = Transaction.query.order_by(Transaction.equity_id, Transaction.transaction_id).all()
        transaction_ids = TransactionId.query.order_by(TransactionId.equity_id).all()

        self.transaction_equities = {}
        self.transaction_users = {}
        self.transaction_ids = {}

        for transaction in transactions:
            if transaction.equity_id not in self.transaction_equities:
                self.transaction_equities[transaction.equity_id] = []

            if transaction.user_id_long not in self.transaction_users:
                self.transaction_users[transaction.user_id_long] = {}

            if transaction.user_id_long != transaction.user_id_short:
                if transaction.user_id_short not in self.transaction_users:
                    self.transaction_users[transaction.user_id_short] = {}

            if transaction.equity_id not in self.transaction_users[transaction.user_id_long]:
                self.transaction_users[transaction.user_id_long][transaction.equity_id] = []

            if transaction.user_id_long != transaction.user_id_short:
                if transaction.equity_id not in self.transaction_users[transaction.user_id_short]:
                    self.transaction_users[transaction.user_id_short][transaction.equity_id] = []

            self.transaction_equities[transaction.equity_id].append(transaction)
            self.transaction_users[transaction.user_id_long][transaction.equity_id] = transaction
            if transaction.user_id_long != transaction.user_id_short:
                self.transaction_users[transaction.user_id_short][transaction.user_id_short] = transaction

        for transaction_id in transaction_ids:
            self.transaction_ids[transaction_id.equity_id] = transaction_id

    def init_orders(self):
        orders = Order.query.order_by(Order.equity_id, Order.order_id).all()
        order_ids = OrderId.query.order_by(OrderId.equity_id).all()

        self.order_equities = {}
        self.order_users = {}

        self.order_open_long_limit = {}
        self.order_open_short_limit = {}

        self.order_open_long_trigger = {}
        self.order_open_short_trigger = {}

        self.order_open_long_trailing = {}
        self.order_open_short_trailing = {}

        self.order_ids = {}

        for order in orders:
            order.calculate_effective_price()

            if order.equity_id not in self.order_equities:
                self.order_equities[order.equity_id] = []

            if order.user_id not in self.order_users:
                self.order_users[order.user_id] = {}

            if order.equity_id not in self.order_users[order.user_id]:
                self.order_users[order.user_id][order.equity_id] = []

            self.order_equities[order.equity_id].append(order)
            self.order_users[order.user_id][order.equity_id].append(order)

            if order.status == OrderStatus.OPENED:
                if order.order_type == OrderType.LIMIT:
                    if order.is_buy:
                        if order.equity_id not in self.order_open_long_limit:
                            self.order_open_long_limit[order.equity_id] = []
                        self.order_open_long_limit[order.equity_id].append(order)
                    else:
                        if order.equity_id not in self.order_open_short_limit:
                            self.order_open_short_limit[order.equity_id] = []
                        self.order_open_short_limit[order.equity_id].append(order)
                if order.order_type == OrderType.TRIGGER:
                    if order.is_buy:
                        if order.equity_id not in self.order_open_long_trigger:
                            self.order_open_long_trigger[order.equity_id] = []
                        self.order_open_long_trigger[order.equity_id].append(order)
                    else:
                        if order.equity_id not in self.order_open_short_trigger:
                            self.order_open_short_trigger[order.equity_id] = []
                        self.order_open_short_trigger[order.equity_id].append(order)
                if order.order_type == OrderType.TRAILING_STOP:
                    if order.is_buy:
                        if order.equity_id not in self.order_open_long_trailing:
                            self.order_open_long_trailing[order.equity_id] = []
                        self.order_open_long_trailing[order.equity_id].append(order)
                    else:
                        if order.equity_id not in self.order_open_short_trailing:
                            self.order_open_short_trailing[order.equity_id] = []
                        self.order_open_short_trailing[order.equity_id].append(order)
                if order.order_type == OrderType.RANGE:
                    if order.price != 0:
                        if order.is_buy:
                            if order.equity_id not in self.order_open_long_limit:
                                self.order_open_long_limit[order.equity_id] = []
                            self.order_open_long_limit[order.equity_id].append(order)
                        else:
                            if order.equity_id not in self.order_open_short_limit:
                                self.order_open_short_limit[order.equity_id] = []
                            self.order_open_short_limit[order.equity_id].append(order)
                    else:
                        if order.is_buy:
                            if order.equity_id not in self.order_open_long_trailing:
                                self.order_open_long_trailing[order.equity_id] = []
                            self.order_open_long_trailing[order.equity_id].append(order)
                        else:
                            if order.equity_id not in self.order_open_short_trailing:
                                self.order_open_short_trailing[order.equity_id] = []
                            self.order_open_short_trailing[order.equity_id].append(order)

                    if order.is_buy:
                        if order.equity_id not in self.order_open_long_trigger:
                            self.order_open_long_trigger[order.equity_id] = []
                        self.order_open_long_trigger[order.equity_id].append(order)
                    else:
                        if order.equity_id not in self.order_open_short_trigger:
                            self.order_open_short_trigger[order.equity_id] = []
                        self.order_open_short_trigger[order.equity_id].append(order)

        for orders in self.order_open_long_limit:
            quick_sort(orders, Order.price_comparer_dec)

        for orders in self.order_open_short_limit:
            quick_sort(orders, Order.price_comparer)

        for orders in self.order_open_long_trigger:
            quick_sort(orders, Order.trigger_price_dec)

        for orders in self.order_open_short_trigger:
            quick_sort(orders, Order.trigger_price_dec)

        for equity_id in self.order_open_long_trailing.keys():
            orders = self.order_open_long_trailing[equity_id]

            transactions = self.transaction_equities[equity_id]

            for order in orders:
                temp_max = transactions[-1].price
                for transaction in reversed(transactions):
                    if transaction.created_date < order.created_date:
                        break

                    if transaction.price > temp_max:
                        temp_max = transaction.price

                order.trailing_price_max = temp_max
                order.trailing_price = temp_max * ((10000.0 - order.trailing_stop_percent) / 10000.0)
                order.calculate_effective_price()

        for equity_id in self.order_open_short_trailing.keys():
            orders = self.order_open_long_trailing[equity_id]

            transactions = self.transaction_equities[equity_id]

            for order in orders:
                temp_min = transactions[-1].price
                for transaction in reversed(transactions):
                    if transaction.created_date < order.created_date:
                        break

                    if transaction.price < temp_min:
                        temp_min = transaction.price

                order.trailing_price_max = temp_min
                order.trailing_price = temp_min * ((10000.0 + order.trailing_stop_percent) / 10000.0)
                order.calculate_effective_price()

        for orders in self.order_open_long_trailing:
            quick_sort(orders, Order.effective_price_comparer_dec)

        for orders in self.order_open_short_trailing:
            quick_sort(orders, Order.effective_price_comparer)

        for order_id in order_ids:
            self.order_book_ids[order_id.equity_id] = order_id

    def get_bitcoin_price(self):
        if self.bitcoin_price is None:
            try:
                return self.get_bitcoin_price_helper()
            except:
                print "Can't fetch bitcoin price"
                exit()
        else:
            now = datetime.datetime.utcnow()

            do_api_request = False

            if self.last_fetched_bitcoin_price + datetime.timedelta(seconds=60) < now:
                with self.reader_writer_lock_dic.write_enter('b'):
                    if self.last_fetched_bitcoin_price + datetime.timedelta(seconds=60) < now:
                        self.last_fetched_bitcoin_price = now
                        do_api_request = True

                if do_api_request:
                    thread.start_new_thread(self.get_bitcoin_price(), ())

            return self.bitcoin_price['last']

    def get_bitcoin_price_helper(self):
        new_bitcoin_price = json.load(urllib2.urlopen("https://www.bitstamp.net/api/ticker/"))
        self.bitcoin_price = new_bitcoin_price
        self.bitcoin_price['last'] = int(float(self.bitcoin_price['last']) * 100.0)
        return self.bitcoin_price['last']

    def get_currency_price(self, base_index):
        if base_index == 0:
            return 1.0

    def init_user_margins(self):
        self.users_margin_used = []
        self.users_margin_used_orders = []

        fee = self.exchange_fee.taker_fee / 100000.0

        for user in self.users:
            user.margin_used = 0.0
            user.margin_used_orders = 0.0
            self.users_margin_used.append(user)
            self.users_margin_used_orders.append(user)

        for equity in self.equities:
            equity.current_price = self.transaction_equities[equity.equity_id][-1].price

        for equity_id in self.contract_open_long_equities.keys():
            equity = self.equities[equity_id]
            last_price = (equity.current_price + 0.0) / (1 << equity.decimal_points_price)

            contracts = self.contract_open_long_equities[equity_id]
            for contract in contracts:
                user = self.users[contract.user_id]

                contract_price = (contract.price + 0.0) / (1 << equity.decimal_points_price)

                mr = last_price*contract.quantity * fee
                gl = (contract_price - last_price) * contract.quantity * fee

                user.margin_used += mr*(equity.margin_requirement / 10000.0)
                user.margin_used += gl

                user.margin_used_orders += mr*(equity.tradable_requirement / 10000.0)
                user.margin_used_orders += gl

        for equity_id in self.contract_open_short_equities.keys():
            equity = self.equities[equity_id]
            last_price = (self.transaction_equities[equity_id][-1].price + 0.0) / (1 << equity.decimal_points_price)

            cr = self.get_currency_price(equity.base_currency_index)

            contracts = self.contract_open_short_equities[equity_id]
            for contract in contracts:
                user = self.users[contract.user_id]

                contract_price = (contract.price + 0.0) / (1 << equity.decimal_points_price)

                mr = (last_price*contract.quantity * fee) / cr
                gl = ((last_price - contract_price) * contract.quantity * fee) / cr

                user.margin_used += mr*(equity.margin_requirement / 10000.0)
                user.margin_used += gl

                user.margin_used_orders += mr*(equity.tradable_requirement / 10000.0)
                user.margin_used_orders += gl

        for user_id in self.order_users.keys():

            user = self.users[user_id]

            order_equities = self.order_users[user_id]

            for equity_id in order_equities.keys():
                equity = self.equities[equity_id]

                cr = self.get_currency_price(equity.base_currency_index)

                tr = ((equity.tradable_requirement / 10000.0) * fee) / cr

                orders = self.order_equities[equity_id]

                user_orders = []

                contracts_open = 0

                if equity_id in self.contract_users[equity_id]:
                    for contract in self.contract_users[equity_id]:
                        if contract.status == ContractStatus.OPENED:
                            if contract.is_buy:
                                contracts_open += contract.quantity
                            else:
                                contracts_open -= contract.quantity

                for order in orders:
                    if order.status != OrderStatus.OPENED:
                        break

                    user_orders.append(order)

                quick_sort(user_orders, Order.effective_price)

                contracts_remaining = contracts_open

                mr_buy = 0
                mr_sell = 0

                for order in user_orders:
                    if order.is_buy:
                        if contracts_remaining >= 0:
                            quantity = order.quantity
                        elif -contracts_remaining > order.quantity:
                            contracts_remaining += order.quantity
                            continue
                        else:
                            quantity = order.quantity + contracts_remaining
                            contracts_remaining = 0

                        mr_buy += order.effective_price * tr * quantity / cr
                    else:
                        if contracts_remaining <= 0:
                            quantity = order.quantity
                        elif contracts_remaining > order.quantity:
                            contracts_remaining -= order.quantity
                            continue
                        else:
                            quantity = order.quantity - contracts_remaining
                            contracts_remaining = 0

                        mr_sell += order.effective_price * tr * quantity / cr

                user.margin_used_orders += max(mr_buy, mr_sell)

        bitcoin_price = self.get_bitcoin_price() / 100.0

        for user in self.users:
            user.margin_used_percent = (user.margin_used / bitcoin_price) / user.balance
            user.margin_used_orders_percent = (user.margin_used_orders / bitcoin_price) / user.balance


    def perform_trade_operation(self, func, args):
        while True:
            trading_engine_context = TradingEngineContext(self)

            try:
                result = getattr(trading_engine_context, func)(*args)

                if trading_engine_context.contains_necessary_locks(
                        previous_equity_locks,
                        previous_user_locks):

                    trading_engine_context.commit_changes()
                    return result
                else:
                    trading_engine_context.acquire_locks(previous_equity_locks, previous_user_locks)

                    previous_equity_locks = trading_engine_context.equity_locks
                    previous_user_locks = trading_engine_context.user_locks
            except Exception as E:
                trading_engine_context.release_previous_locks(previous_equity_locks, previous_user_locks)
                raise E

    def place_limit_buy(self, order):
        temp_margin_used = self.user[order.user_id].margin_used
        temp_margin_used_orders = self.user[order.user_id].margin_used_orders

        order_index = 0

        current_price = self.transaction_equities[order.equity_id][-1].price
        remaining_quantity = order.quantity

        while True:
            is_buy = True
            if order.is_buy:
                if order_index >= len(self.order_open_long_limit):
                    quantity = remaining_quantity
                    if order.price == -1:
                        price = current_price
                    else:
                        price = order.price
                    is_buy = False
                else:
                    if order.price >= self.order_open_long_limit[order_index].price:
                        price = self.order_open_long_limit[order_index].price
                    else: # order.price < self.order_open_long_limit[order_index].price:
                        price = order.price
                        is_buy = False

                    if remaining_quantity > self.order_open_long_limit[order_index].quantity:
                        quantity = self.order_open_long_limit[order_index].quantity
                    else:
                        quantity = remaining_quantity
            else:
                if order_index >= len(self.order_open_short_limit):
                    quantity = remaining_quantity
                    if order.price == -1:
                        price = current_price
                    else:
                        price = order.price
                    is_buy = False
                else:
                    if order.price >= self.order_open_short_limit[-1 - order_index].price:
                        price = self.order_open_short_limit[-1 - order_index].price
                        is_buy = True
                    else: # order.price < self.order_open_long_limit[order_index].price:
                        price = order.price
                        is_buy = False

                    if remaining_quantity > self.order_open_short_limit[-1 - order_index].quantity:
                        quantity = self.order_open_short_limit[-1 - order_index].quantity
                    else:
                        quantity = remaining_quantity

            remaining_quantity -= quantity

            if is_buy:
                temp_margin_used += 0
            else:
                temp_margin_used_orders += 0

            if remaining_quantity == 0:
                break
            order_index += 1

    def place_trigger_buy(self, order):
        self.perform_trade_operation("place_trigger", order)

    def place_trailing_buy(self, order):
        self.perform_trade_operation("place_trailing_buy", order)

    def place_range_buy(self, order):
        self.perform_trade_operation("place_range_limit_buy", order)

    def update_margins_and_triggers(self):
        for user in self.users:
            self.perform_trade_operation("update_margin_orders", user)

        for user in self.users:
            self.perform_trade_operation("update_margins", user)

        for user in self.users:
            self.perform_trade_operation("update_trailing", user)

        for user in self.users:
            self.perform_trade_operation("update_triggers", user)


class TradingEngineContext:

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine
        self.user_locks = []
        self.equity_locks = []
        self.bitcoin_price = trade_engine.get_bitcoin_price()
        self.temp_users = {}
        self.temp_equities = {}

        self.order_equities_modified = DictionaryArrayVersion(trade_engine.order_equities_modified, Order.modified_id_comparer)
        self.order_users_modified = DictionaryDictionaryArrayVersion(trade_engine.order_users_modified, Order.modified_id_comparer)

        self.order_equities = DictionaryArrayVersion(trade_engine.order_equities, Order.id_comparer)
        self.order_users = DictionaryDictionaryArrayVersion(trade_engine.order_users, Order.id_comparer)

        self.order_ids = {}

        self.order_open_long_limit = DictionaryArrayVersion(trade_engine.order_open_long_limit, Order.price_comparer_dec)
        self.order_open_short_limit = DictionaryArrayVersion(trade_engine.order_open_short_limit, Order.price_comparer)

        self.order_open_long_trigger = DictionaryArrayVersion(trade_engine.order_open_long_trigger, Order.trigger_price_comparer_dec)
        self.order_open_short_trigger = DictionaryArrayVersion(trade_engine.order_open_short_trigger, Order.trigger_price_comparer)

        self.order_open_long_trailing = DictionaryArrayVersion(trade_engine.order_open_long_trailing, Order.effective_price_comparer_dec)
        self.order_open_short_trailing = DictionaryArrayVersion(trade_engine.order_open_short_trailing, Order.effective_price_comparer)

        self.contract_open_long_equities = DictionaryArrayVersion(trade_engine.contract_open_long_equities, Contract.id_comparer)
        self.contract_open_short_equities = DictionaryArrayVersion(trade_engine.contract_open_short_equities, Contract.id_comparer)

        self.contract_open_long_users = DictionaryDictionaryArrayVersion(trade_engine.contract_open_long_users, Contract.id_comparer)
        self.contract_open_short_users = DictionaryDictionaryArrayVersion(trade_engine.contract_open_short_users, Contract.id_comparer)

        self.transaction_equities = DictionaryArrayVersion(trade_engine.transaction_equities, Transaction.id_comparer)
        self.transaction_users = DictionaryDictionaryArrayVersion(trade_engine.transaction_users, Transaction.id_comparer)

    def place_limit_buy(self, order):
        result = []

        order.order_id = self.get_next_order_id(order.equity_id)
        order.modification_id = order.order_id

        while True:
            if not self.user_can_place_limit_order(order):
                raise Exception("InsufficientFunds")

            next_price = self.get_next_equity_price(order)

            if next_price == -1 or (order.limit_price != -1 and (order.is_buy and next_price > order.limit_price) or (not order.is_buy and next_price < order.limit_price)):
                result.append(self.place_limit_buy_simple(order))
                break

            if not self.user_can_execute_limit_order(order):
                raise Exception("InsufficientFunds")

            (margin_call_orders, margin_call) = self.set_next_equity_price(order)

            if len(margin_call_orders) > 0:
                for margin_call_order in  margin_call_orders:
                    self.execute_margin_call_order(margin_call_order)
                continue

            if margin_call is not None:
                self.execute_margin_call(margin_call)

            result.append(self.execute_buy_simple(order))

            if order.quantity == order.filledQuantity:
                break

        return result

    def place_trigger_buy(self, order):
        order.order_id = self.get_next_order_id(order.equity_id)
        order.modification_id = order.order_id

        if not self.user_can_place_trigger_order(order):
            raise Exception("InsufficientFunds")

        current_price = self.get_current_equity_price(order.equity_id)
        if (order.is_buy and current_price > order.trigger_price) or (not order.is_buy and current_price < order.trigger_price):
            result = self.place_limit_buy(order)
            return result
        else:
            return [self.place_trigger_buy_simple(order)]

    def place_trailing_buy(self, order):
        order.order_id = self.get_next_order_id(order.equity_id)
        order.modification_id = order.order_id

        equity = self.get_equity(order.order_id)

        order.trailing_price_max = equity.current_price
        order.update_trailing_price()

        if not self.user_can_place_trailing_order(order):
            raise Exception("InsufficientFunds")

        return [self.place_trailing_buy_simple(order)]

    def place_range_buy(self, order):
        order.order_id = self.get_next_order_id(order.equity_id)
        order.modification_id = order.order_id

        if order.price == -1:
            return self.place_limit_buy(order).extend(self.place_trigger_buy(order))
        else:
            return self.place_trailing_buy(order).extend(self.place_trigger_buy(order))

    def get_equity(self, equity_id):
        if equity_id not in self.equity_locks:
            self.equity_locks.append(equity_id)

        temp_equity = self.temp_equities.get(equity_id, None)
        if temp_equity is not None:
            return temp_equity

            temp_equity = self.trade_engine.entities.get(equity_id, None)
        if temp_equity is None:
            raise Exception("UserDoesNotExist")

        return temp_equity

    def get_user(self, user_id):
        if user_id not in self.user_locks:
            self.user_locks.append(user_id)
        temp_user = self.temp_users.get(user_id, None)
        if temp_user is not None:
            return temp_user

        temp_user = self.trade_engine.users.get(user_id, None)
        if temp_user is None:
            raise Exception("UserDoesNotExist")

        return temp_user

    def get_mr(self, equity):
        fee = self.trade_engine.exchange_fee.taker_fee / 100000.0

        cr = self.trade_engine.get_currency_price(equity.base_currency_index)

        tr = ((equity.margin_requirement / 10000.0) * fee) / cr

        return tr / self.bitcoin_price

    def get_tr(self, equity, is_take_fee=True):
        fee = (self.trade_engine.exchange_fee.taker_fee if is_take_fee else self.trade_engine.exchange_fee.maker_fee) / 100000.0

        cr = self.trade_engine.get_currency_price(equity.base_currency_index)

        tr = ((equity.tradable_requirement / 10000.0) * fee) / cr

        return tr / self.bitcoin_price

    def user_can_place_limit_order(self, order):
        equity = self.get_equity(order.equity_id)
        user = self.get_user(order.user_id)

        next_price = self.get_next_equity_price(order)

        price = next_price

        if order.is_buy:
            if next_price > order.price:
                price = order.price
        else:
            if next_price < order.price:
                price = order.price

        return user.balance <= user.margin_used_orders + (order.quantity * price * self.get_tr(equity, False))

    def user_can_place_trigger_order(self, order):
        equity = self.get_equity(order.equity_id)
        user = self.get_user(order.user_id)

        price = self.get_current_equity_price(order)

        if order.is_buy:
            if price < order.trigger_price:
                price = order.trigger_price
        else:
            if price > order.trigger_price:
                price = order.trigger_price

        return user.balance <= user.margin_used_orders + (order.quantity * price * self.get_tr(equity))

    def user_can_place_trailing_order(self, order):
        equity = self.get_equity(order.equity_id)
        user = self.get_user(order.user_id)

        price = equity.current_price

        if order.is_buy:
            price = price * ((10000.0 + order.trailing_stop_percent) / 10000.0)
        else:
            price = price * ((10000.0 - order.trailing_stop_percent) / 10000.0)

        return user.balance <= user.margin_used_orders + (order.quantity * price * self.get_tr(equity))

    def user_can_execute_limit_order(self, order):
        equity = self.get_equity(order.equity_id)
        user = self.get_user(order.user_id)

        next_price = self.get_next_equity_price(order)

        if order.is_buy:
            if next_price > order.price:
                price = order.price
        else:
            if next_price < order.price:
                price = order.price

        return user.balance <= user.margin_used + (order.quantity * price * self.get_mr(equity))

    def get_current_equity_price(self, order):
        return self.get_equity(order.equity_id).current_price

    def get_next_equity_price(self, order):
        if order.is_buy:
            if len(self.trade_engine.order_open_long_limit):
                return -1
            else:
                return self.trade_engine.order_open_long_limit[0]
        else:
            if len(self.trade_engine.order_open_short_limit):
                return -1
            else:
                return self.trade_engine.order_open_short_limit[0]

    def set_next_equity_price_helper(self, equity_id, next_price):
        temp_equity = self.temp_equities.get(equity_id, None)

        if temp_equity is None:
            new_equity = Equity()
            new_equity.current_price = next_price
            self.temp_equities.append(new_equity)
        else:
            temp_equity.price = next_price

    def get_next_order_id(self, equity_id):
        if equity_id not in self.order_ids:
            self.order_ids[equity_id] = trade_engine.order_ids[equity_id]

        result = self.order_ids[equity_id]
        self.order_ids[equity_id] += 1
        return result

    def set_new_user_if_not_exist(self, user_id):
        if user_id not in self.temp_users:
            temp_user = User()
            actual_user = trade_engine.users[user_id]

            temp_user.margin_used_orders = actual_user.margin_used_orders
            temp_user.margin_used = actual_user.margin_used
            temp_user.margin_used_orders_percent = actual_user.margin_used_orders_percent
            temp_user.margin_used_percent = actual_user.margin_used_percent

            self.temp_users[user_id] = actual_user

        return self.temp_users[user_id]

    def place_limit_buy_simple(self, order):
        equity = self.get_equity_write(order.equity_id)

        if order.is_buy:
            self.order_open_long_limit.insert_item(order.equity_id, order)
        else:
            self.order_open_short_limit.insert_item(order.equity_id, order)

        self.order_equities.insert_item(order.equity_id, order)
        self.order_users.insert_item(order.equity_id, order.user_id, order)

        order_margin_cost = (order.quantity * order.price * self.get_tr(equity, False))

        self.users.increase_margin_used_orders(order.user_id, order_margin_cost)

        return order

    def place_trigger_buy_simple(self, order):
        equity = self.get_equity_write(order.equity_id)

        if order.is_buy:
            self.order_open_long_trigger.insert_item(order.equity_id, order)
        else:
            self.order_open_short_trigger.insert_item(order.equity_id, order)

        self.order_equities.insert_item(order.equity_id, order)
        self.order_users.insert_item(order.equity_id, order.user_id, order)

        order_margin_cost = (order.quantity * order.effective_price * self.get_tr(equity, False))

        self.users.increase_margin_used_orders(order.user_id, order_margin_cost)

        return order

    def place_trailing_buy_simple(self, order):
        equity = self.get_equity_write(order.equity_id)

        if order.is_buy:
            self.order_open_long_trailing.insert_item(order.equity_id, order)
        else:
            self.order_open_short_trailing.insert_item(order.equity_id, order)

        self.order_equities.insert_item(order.equity_id, order)
        self.order_users.insert_item(order.equity_id, order.user_id, order)

        order_margin_cost = (order.quantity * order.effective_price * self.get_tr(equity, False))

        self.users.increase_margin_used_orders(order.user_id, order_margin_cost)

        return order

    def execute_buy_simple(self, order):
        if order.is_buy:
            matching_order = self.order_open_short_limit.get_item(order.equity_id, 0)
            user_id_long = order.user_id
            user_id_short = matching_order.user_id
        else:
            matching_order = self.order_open_long_limit.get_item(order.equity_id, 0)
            user_id_long = matching_order.user_id
            user_id_short = order.user_id

        self.order_users.delete_item(order.equity_id, matching_order.user_id, matching_order)
        self.order_equities_modified_id.delete_item(order.equity_id, matching_order)

        matching_order.modification_id = self.get_next_order_id(order.equity_id)

        equity = self.get_equity_read(order.equity_id)
        user = self.get_user_write(order.user_id)
        matching_user = self.get_user_write(matching_order.user_id)

        if order.remaining_quantity() >= matching_order.remaining_quantity():
            quantity = matching_order.remaining_quantity()
            order.filled_quantity += matching_order.remaining_quantity()

            matching_order.filled_quantity = matching_order.quantity
            matching_order.closed_date = datetime.datetime.utcnow()
            matching_order.status = OrderStatus.CLOSED

            if order.is_buy:
                self.order_open_short_limit.delete_item(order.equity_id, matching_order)
            else:
                self.order_open_long_limit.delete_item(order.equity_id, matching_order)

            long_opened = self.get_open_contract_count(order.equity_id, user_id_long)
            short_opened = self.get_open_contract_count(order.equity_id, user_id_long)

            contract_long = Contract(
                equity_id=order.equity_id,
                contract_id=self.next_contract_id(order.equity_id),
                user_id=user_id_long,
                is_buy=True,
                quantity=quantity,
                price=equity.current_price,
                status=ContractStatus.OPENED,
                created_date=datetime.datetime.utcnow(),
                closed_date=None
            )

        else:
            quantity = order.remaining_quantity()
            matching_order.filled_quantity += order.remaining_quantity()

            order.filled_quantity = order.quantity
            order.stats = OrderStatus.CLOSED
            order.closed_date = datetime.datetime.utcnow()

            if order.is_buy:
                self.order_open_short_limit.update_item(order.equity_id, matching_order)
            else:
                self.order_open_long_limit.update_item(order.equity_id, matching_order)

        self.order_equities.update_item(order.equity_id, matching_order)
        self.order_users.insert_item(order.equity_id, matching_order.user_id, matching_order)
        self.order_equities_modified_id.insert_item(order.equity_id, matching_order)

        transaction = Transaction(
            equity_id=order.equity_id,
            transaction_id=self.get_next_transaction_id(order.equity_id),
            user_id_long=user_id_long,
            user_id_short=user_id_short,
        )


        return

    def update_margin_orders(self, user):
        return

    def update_margins(self, user):
        return

    def update_trailing(self, user):
        return

    def update_triggers(self, user):
        return

    def contains_necessary_locks(self, previous_equity_locks, previous_user_locks):
        return

    def acquire_locks(self, previous_equity_locks, previous_user_locks):
        return

    def release_previous_locks(self, previous_equity_locks, previous_user_locks):
        return

    def release_locks(self):
        return

    def commit_changes(self):
        self.release_locks()
        return


trade_engine = TradeEngine()
