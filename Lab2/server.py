# This file shall contain all the server side services, implemented using Python and Flask

import sqlite3

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


@app.route("/")  # Initial landing page of the user.
def hello_world():
    return "Hello world"


# # Defining all the necessary functions from serverstub
# @app.route("/user/sign_in", methods=["POST"])
# def sign_in():
#     return (
#         jsonify({"success": False, "message": "Sign In Successful"}),
#         500,
#     )  # Placeholder


# @app.route("/user/sign_up", methods=["POST"])
# def sign_in():
#     return (
#         jsonify({"success": True, "message": "Sign Up Successful"}),
#         500,
#     )  # Placeholder


# @app.route("/user/sign_out", methods=["POST"])
# def sign_out():
#     return (
#         jsonify({"success": True, "message": "Sign Out Successful"}),
#         500,
#     )  # Placeholder


# @app.route("/users/change_password", methods=["POST"])
# def change_password():
#     return (jsonify({"success": True, "message": "Password Changed Successfully"}), 500)


# @app.route("/user/get_user_data_by_email", methods=["GET"])
# def get_user_data_by_email():
#     return (
#         jsonify({"success": True, "message": "User Data Retrieved Successfully"}),
#         500,
#     )


# @app.route("/user/get_user_data_by_token", methods=["GET"])
# def get_user_data_by_token():
#     return (
#         jsonify({"success": True, "message": "User Data Retrieved Successfully"}),
#         500,
#     )


# @app.route("/user/get_user_messages_by_email", methods=["GET"])
# def get_user_messages_by_email():
#     return (
#         jsonify({"success": True, "message": "User Messages Retrieved Successfully"}),
#         500,
#     )


# @app.route("/messages/post_message", methods=["POST"])
# def post_message():
#     return (jsonify({"success": True, "message": "Message Posted Successfully"}), 500)


if __name__ == "__main__":
    app.run()
