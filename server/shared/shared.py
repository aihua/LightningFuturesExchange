from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)

temp_config = json.load(open('json/config.json'))

for prop in temp_config:
    app.config[prop] = temp_config[prop]

db = SQLAlchemy(app)
