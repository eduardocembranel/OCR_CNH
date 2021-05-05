from flask import Flask, Blueprint
from .views import main

def create_app():
    app = Flask(__name__)
    app.register_blueprint(main)
    return app