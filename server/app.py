from shared.shared import app, db

import models.all_models
import routes.routes

if __name__ == '__main__':
    app.run(debug=True)
