# This file shall contain all the server side services, implemented using Python and Flask
import random
import re

from database_helper import *
from flask import Flask, json, jsonify, render_template, request
from flask_sock import Sock
from gevent import pywsgi

# from gevent.pywsgi import WSGIServer
# from flask_sockets import Sockets
from geventwebsocket import WebSocketError
from geventwebsocket.handler import WebSocketHandler

app = Flask(__name__)
sock = Sock(app)
active_sockets = {}
# active_sockets = dict()


@app.route("/")  # Initial landing page of the user.
def index():
    return render_template("client.html")


# Retrieves all the existing user - for testing
@app.route("/retrieve_all")
def retrieve_all():
    query = """
    SELECT * FROM user
    """
    users = execute_query(query)
    return jsonify([dict(row) for row in users])


# Retrieves all the existing messages - for testing
@app.route("/retrieve_all_messages")
def retrieve_all_messages():
    query = """
    SELECT * FROM messages
    """
    users = execute_query(query)
    return jsonify([dict(row) for row in users])


# Retrieves all the existing tokens - for testing
@app.route("/retrieve_all_tokens", methods=["GET"])
def retrieve_all_tokens():
    result = get_all_tokens()
    return jsonify([dict(row) for row in result])


# Sign in function -- tested
@app.route("/sign_in", methods=["POST"])
def sign_in():
    email = request.json["username"]
    password = request.json["password"]
    user = get_user(email)
    if user == 0:
        return (
            jsonify({"success": False, "message": "User not found"}),
            401,
        )
    elif user[1] != password:
        return (
            jsonify({"success": False, "message": "Wrong password"}),
            401,
        )
    else:
        # ws = active_sockets.pop(email, None)
        print(email)
        token = token_generator()

        if is_logged_in(email):
            ws = active_sockets.get(email)
            print("active")
            if ws:
                print("logout dump")
                # ws.send(json.dumps("logout"))
                ws.send("logout")
                
            print(ws)
            update_token(email, token)
            return (
                jsonify(
                    {"success": True, "message": "You successfully signed in (and your other logged in session was logged out)", "token": token}
                ),
                200,
            )
        
        else:
            print("no multiple user")
            result = store_token(email, token)
            if result == False:
                return (
                    jsonify(
                        {"success": False, "message": "Sign In Failed", "token": token}
                    ),
                    500,
                )
            else:
                return (
                    jsonify(
                        {"success": True, "message": "Sign In successful", "token": token}
                    ),
                    200,
                )



def valid_email(email):
    return bool(re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email))


# Sign up function -- tested
@app.route("/sign_up", methods=["POST"])
def sign_up():
    email = request.json["email"]
    try:
        if not valid_email(email):
            return jsonify({"success": False, "message": "Invalid email format"}), 400

        if (user_exist(email)) == False:
            first_name = request.json["firstName"]
            last_name = request.json["familyName"]
            gender = request.json["gender"]
            city = request.json["city"]
            country = request.json["country"]
            password = request.json["password"]
            password_confirmation = request.json["password_confirmation"]
            if (
                (email != "")
                and (len(password) > 4)
                and (first_name != "")
                and (last_name != "")
                and (gender != "")
                and (city != "")
                and (country != "")
            ):
                if password == password_confirmation:
                    insert_user(
                        email, password, first_name, last_name, gender, city, country
                    )

                    return (
                        jsonify(
                            {
                                "success": True,
                                "message": "Sign Up Successful, please enter login credentials above.",
                            }
                        ),
                        200,
                    )
                else:
                    return (
                        jsonify(
                            {"success": False, "message": "Passwords do not match"}
                        ),
                        400,
                    )
            else:
                return (
                    jsonify({"success": False, "message": "All fields must be filled"}),
                    400,
                )
        else:

            return (
                jsonify({"success": False, "message": "User already exist"}),
                400,
            )
    except:
        return (
            jsonify({"success": False, "message": "Invalid data field"}),
            400,
        )


# Sign out function -- tested
@app.route("/sign_out", methods=["POST"])
def sign_out():
    # email = request.json["email"]
    try:
        token = request.json["token"]
        result = get_user_data_bytoken(token)
        email = get_email_by_token(token)
        if result[0][0] == 0:
            return (
                jsonify({"success": False, "message": "Invalid Token"}),
                400,
            )
        # token = get_token_by_email(email)
        else:
            active_sockets[email].send(json.dumps("close"))
            result = delete_token(token)
            # removed = request.headers.remove("token")
            if result == True:
                return (
                    jsonify({"success": True, "message": "Successfully signed out"}),
                    200,
                )

            else:
                return jsonify({"success": False, "message": "Sign out failed"}), 400
    except:
        return (
            jsonify({"success": False, "message": "Invalid Token"}),
            400,
        )


# Check whether user exist -- tested
def user_exist(email):
    exist = get_user(email)
    if exist == 0 or exist[0] != email:  # if not exist
        result = False
    else:
        result = True

    return result


# Change password function -- tested
@app.route("/change_password", methods=["POST"])
def change_password():
    old_password = request.json["oldPassword"]
    new_password = request.json["newPassword"]
    check_new_password = request.json["checkNewPassword"]
    token = request.json["token"]
    try:
        # token = request.headers.get("token")
        result = get_user_data_bytoken(token)
        if result[0][0] == 0:
            return (
                jsonify({"success": False, "message": "Invalid Token"}),
                400,
            )
        else:

            user = get_user(result[0][0])
            if len(new_password) < 4:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Password must be at least 4 characters",
                        }
                    ),
                    400,
                )
            elif user[1] != old_password:  # user[0] is username, user[1] is password
                return (
                    jsonify({"success": False, "message": "Wrong password"}),
                    403,
                )
            elif new_password != check_new_password:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "New password not matching with the reconfirm password",
                        }
                    ),
                    400,
                )
            elif old_password == new_password:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "New password is the same as the old password",
                        }
                    ),
                    400,
                )
            else:
                update_password(result[0][0], new_password)
                return (
                    jsonify(
                        {"success": True, "message": "Password Changed Successfully"}
                    ),
                    200,
                )
    except:
        return (
            jsonify({"success": False, "message": "Invalid Token"}),
            400,
        )


# Get user data by email -- tested
@app.route("/get_user_data_by_email", methods=["POST"])
def get_user_data_by_email():
    # token = request.headers.get("token")
    email = request.json["email"]
    token = request.json["token"]
    try:
        result = get_user_data_bytoken(token)
        if result[0][0] == 0:
            return (
                jsonify({"success": False, "message": "Invalid Token"}),
                400,
            )
        # searched_user = result[0][0]
        else:
            if user_exist(email) == True:

                userData = get_user_data_byemail(email)
                data = [dict(row) for row in userData]

                return (
                    jsonify(
                        {
                            "success": True,
                            "message": "User Data Retrieved Successfully",
                            "data": data[0],
                        }
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {"success": False, "message": "Searched User does not exist"}
                    ),
                    404,
                )
    except:
        return (
            jsonify({"success": False, "message": "Invalid Token"}),
            400,
        )


# Get user data by token -- tested
@app.route("/get_user_data_by_token", methods=["POST"])
def get_user_data_by_token():
    token = request.json["token"]
    try:
        result = get_user_data_bytoken(token)
        userData = get_user_data_byemail(result[0][0])
        user = [dict(row) for row in userData]
        if user_exist(result[0][0]) == True:
            return (
                jsonify(
                    {
                        "success": True,
                        "message": "User Data Retrieved Successfully",
                        "data": user[0],
                    }
                ),
                200,
            )
        else:
            return (
                jsonify({"success": False, "message": "User does not exist"}),
                404,
            )
    except:
        return (
            jsonify({"success": False, "message": "Invalid token"}),
            400,
        )


# Get user messages by email -- tested
@app.route("/get_user_messages_by_email", methods=["POST"])
def get_user_messages_by_email():
    token = request.json["token"]
    # token = request.headers.get('token')
    email = request.json["email"]
    try:
        if user_exist(email) == False:
            return (
                jsonify({"success": False, "message": "Email not found"}),
                400,
            )

        else:
            data = get_messages(email)
            # if (current_user[0][0] == 0):
            #     return (
            #         jsonify({"success": False, "message": "Invalid token"}),
            #         400,
            #     )
            if data != 0:

                return (
                    jsonify(
                        {
                            "success": True,
                            "message": "User Messages Retrieved Successfully",
                            "data": [dict(row) for row in data],
                        }
                    ),
                    200,
                )
            else:

                return (
                    jsonify({"success": False, "message": "No messages found"}),
                    404,
                )
    except:
        return (
            jsonify({"success": False, "message": "Invalid token"}),
            400,
        )


# get user messages by token
@app.route("/get_user_messages_by_token", methods=["POST"])
def get_user_messages_by_token():
    token = request.json["token"]
    try:
        # token = request.headers.get("token")
        current_user = get_user_data_bytoken(token)

        if user_exist(current_user[0][0]) == False:
            return (
                jsonify({"success": False, "message": "Invalid token"}),
                400,
            )

        else:
            data = get_messages(current_user[0][0])  # error

            if data != 0:

                return (
                    jsonify(
                        {
                            "success": True,
                            "message": "User Messages Retrieved Successfully",
                            "data": [dict(row) for row in data],
                        }
                    ),
                    500,
                )
            else:

                return (
                    jsonify({"success": False, "message": "No messages found"}),
                    404,
                )
    except:
        return (
            jsonify({"success": False, "message": "Invalid Token"}),
            400,
        )


# Post messages function -- tested
@app.route("/post_message", methods=["POST"])
def post_message():
    receiver_email = request.json["email"]
    message = request.json["message"]
    token = request.json["token"]
    try:
        # sender_email = request.json["sender_email"]
        # token = request.headers.get("token")
        sender_email = get_user_data_bytoken(token)
        receiver = user_exist(receiver_email)
        if receiver == False:
            return (
                jsonify({"success": False, "message": "Receiver does not exist"}),
                404,
            )

        elif not message.strip():
            return (
                jsonify({"success": False, "message": "Message is empty."}),
                404,
            )

        else:
            result = insert_messages(sender_email[0][0], receiver_email, message)
            if result == True:
                return (
                    jsonify(
                        {"success": True, "message": "Message Posted Successfully"}
                    ),
                    200,
                )

            else:
                return (
                    jsonify(
                        {"success": False, "message": "Message could not be posted"}
                    ),
                    400,
                )
    except:
        return (
            jsonify({"success": False, "message": "Invalid token"}),
            400,
        )


def token_generator():
    LENGTH_TOKEN = 30
    STRING_TOKEN = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(0, LENGTH_TOKEN):
        token += STRING_TOKEN[random.randint(0, len(STRING_TOKEN) - 1)]
    return token


# For us to see the existing routes only, not to be used in the final implementation
@app.route("/routes", methods=["GET"])
def show_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append(
            {"endpoint": rule.endpoint, "methods": list(rule.methods), "url": str(rule)}
        )
    return jsonify(routes)


@app.route("/deletealltoken", methods=["POST"])
def deletealltoken():
    delete_all_token()
    return True


@sock.route("/echo")
def echo_socket(ws):
    print("WebSocket connection established")  # Debugging print
    token = None
    # try:
    while True:  # Keep listening for messages
        token = ws.receive()
        print(f"Received message: {token}")  # Debugging print
        ws.send(f"{token}")  # Echo back to client
        email = get_email_by_token(token)  # current line of error
        if email:
            print("if email")
        # in active_sockets:
            # try:
            #     active_sockets[email].send(json.dumps("logout"))
            #     print("Active Websocket deleted: " + email)

            # except:
            #     print("Active Websocket deleted (due to reload): " + email)

            # del active_sockets[email]
            active_sockets[email] = ws
        #     print("New Active Websocket added: " + email)
        # else:
        #     active_sockets[email] = ws
        #     print("New Active Websocket added: " + email)

        # try:
        #     while True:
        #         message = ws.receive()
        #         if message == "close":
        #             print("closing websocket")
        #             delete_token(token)
        #             break

        # except WebSocketError as e:
        #     print("Client Disconnected Websocket")

    # except WebSocketError as e:
    #     print("WebSocketError:", e)

    # except Exception as e:
    #     print("Unexpected error:", e)

    # finally:
    #     print(f"Closing connection. Last received message: {token}")
    #     ws.close()


@app.route("/deleteall", methods=["POST"])
def deleteall():
    deleteAllData()
    return True

if __name__ == "__main__":
    # Start the server with gevent-websocket handler
    server = pywsgi.WSGIServer(("0.0.0.0", 5000), app, handler_class=WebSocketHandler)
    print("WebSocket server running on ws://0.0.0.0:5000/echo")
    server.serve_forever()
