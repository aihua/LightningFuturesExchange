from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from trade_engine.trade_engine import TradeEngine
import json

app = Flask(__name__)

temp_config = json.load(open('json/config.json'))

for prop in temp_config:
    app.config[prop] = temp_config[prop]

db = SQLAlchemy(app)

tradeEngine = TradeEngine()
