from shared.shared import db
import copy


class Equity(db.Model):
    PERCENT_MULTIPLIER = 10000

    equity_id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    symbol = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    broker = db.Column(db.String(100), nullable=False)
    base_currency_index = db.Column(db.Integer, nullable=False)
    decimal_points_price = db.Column(db.Integer, nullable=False)
    decimal_points_quantity = db.Column(db.Integer, nullable=False)
    smallest_quantity = db.Column(db.Integer, nullable=False)
    api_index = db.Column(db.Integer, nullable=False)
    api_symbol = db.Column(db.String(100), nullable=False)
    tradable_requirement = db.Column(db.Integer, nullable=False)
    margin_requirement = db.Column(db.Integer, nullable=False)

    def __init__(self):
        self.current_price = -1
        return

    def __init__(self, dic):
        self.current_price = -1
        self.from_dic(dic)

    def clone(self):
        return copy.copy(self)

    def copy_values(self, item):
        self.__dict__.update(item.__dict__)

    def from_dic(self, dic):
        self.equity_id = dic.get("equityId", None)
        self.symbol = dic.get("symbol", "")
        self.name = dic.get("name", "")
        self.broker = dic.get("broker", "")
        self.base_currency_index = dic.get("baseCurrencyIndex", 0)
        self.decimal_points_price = dic.get("decimalPointsPrice", "")
        self.decimal_points_quantity = dic.get("decimalPointsQuantity", "")
        self.smallest_quantity = dic.get("smallestQuantity", "")
        self.api_index = dic.get("apiIndex", "")
        self.api_symbol = dic.get("apiSymbol", "")
        self.tradable_requirement = dic.get("tradableRequirement", "")
        self.margin_requirement = dic.get("marginRequirement", "")

    def to_dic(self):
        return {
            "equityId": self.equity_id,
            "symbol": self.symbol,
            "name": self.name,
            "broker": self.broker,
            "baseCurrencyIndex": self.base_currency_index,
            "decimalPointsPrice": self.decimal_points_price,
            "decimalPointsQuantity": self.decimal_points_quantity,
            "smallestQuantity": self.smallest_quantity,
            "apiIndex": self.api_index,
            "apiSymbol": self.api_symbol,
            "tradableRequirement": self.tradable_requirement,
            "marginRequirement": self.margin_requirement
        }
