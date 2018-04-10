from transactional_data_structures.transactional import Transactional
from transactional_data_structures.dictionary_dictionary_array_version import DictionaryDictionaryArrayVersion
from models.models.order import Order

class UserOrders(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

        self.orders = DictionaryDictionaryArrayVersion(
            {},
            Order.effective_price_comparer_dec,
            "user_id",
            "equity_id",
            is_in_list=Order.is_opened,
            model_name="orders",
            events=self.trade_engine.events
        )

    def subscribe_to_events(self, events):
        events.subscribe("get_place_order_amount", self.get_place_order_amount)

    def get_place_order_amount(self, order, amount):
        contract = self.trade_engine.user_list.get_contract(order)

        orders = self.orders.get_list(order)

        is_looking_at_contract = False

        for i in range(0, orders.get_length()):
            user_order = orders.get_index(i)

        user = self.trade_engine.user_list.get_user(order)
