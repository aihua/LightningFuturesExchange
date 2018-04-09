from transactional_data_structures.transactional import Transactional


class UserOrders(Transactional):
    def __init__(self):
        pass

    def __init__(self, trade_engine):
        self.trade_engine = trade_engine

    def subscribe_to_events(self, events):
        pass
