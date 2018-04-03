from shared.shared import app, db
from trade_engine.trade_engine import trade_engine

import models.all_models
import routes.routes

if __name__ == '__main__':
    trade_engine.init()
    app.run(debug=True)
