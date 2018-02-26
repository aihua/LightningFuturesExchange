from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from trade_engine.trade_engine import TradeEngine

app = Flask(__name__)
app.config['SECRET_KEY'] = 'c1df2c23-ebb6-48d7-8e54-512c864f0dac'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:baseball@localhost/lfe'
app.config['SALT'] = '2197d259-a40e-444c-89bf-ad0faf552696'
app.config['SAVE_EMAILS'] = True
app.config['FRONT_END_ADDRESS'] = "http://localhost:8080/index.html"
db = SQLAlchemy(app)

tradeEngine = TradeEngine()
