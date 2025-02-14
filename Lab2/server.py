# This file shall contain all the server side services, implemented using Python and Flask
import random
import re
from database_helper import *
from flask import Flask, json, jsonify, render_template, request

app = Flask(__name__)


@app.route("/")  # Initial landing page of the user.
def index():
    return "Hello world"
    # return render_template('client.html')  # Change to this when integrating with our lab 1, this will render the client.html file upon loading.


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


# Retrieves a specific user based on email - can use later
# @app.route("/retrieve_user", methods=["GET"])
# def retrieve_user():
#     query = """
#     SELECT * FROM user WHERE email = ?
#     """
#     params = ("Test@r.c",)  # Make sure this is a tuple, not a string
#     try:
#         result = execute_query(query, params)
#         if result:  # Check if the result is not empty
#             user = result[0]  # Assuming only one user matches
#             return (
#                 jsonify(
#                     {
#                         "success": True,
#                         "user": {
#                             "id": user[0],
#                             "email": user[1],
#                             "firstName": user[2],
#                             "familyName": user[3],
#                             "gender": user[4],
#                             "city": user[5],
#                             "country": user[6],
#                         },
#                     }
#                 ),
#                 200,
#             )
#         else:
#             return jsonify({"success": False, "message": "User not found"}), 404

#     except Exception as e:
#         return jsonify({"success": False, "message": str(e)}), 500


# Defining all the necessary functions from serverstub


# Sign in function -- tested
@app.route("/sign_in", methods=["POST"])
def sign_in():
    email = request.json["email"]
    password = request.json["password"]
    user = get_user(email)
    if user == 0:
        return (
            jsonify({"success": False, "message": "User not found"}),
            404,
        )
    elif user[1] != password:
        return (
            jsonify({"success": False, "message": "Wrong password"}),
            401,
        )
    else:
        token = token_generator()
        result = store_token(email, token)
        # set header token
        # response = request.headers.set("token", token)
        print(result)
        if result == True:
            return (
                jsonify(
                    {"success": True, "message": "Sign In Successful", "token": token}
                ),
                200,
            )
        else:
            return (
                jsonify(
                    {"success": False, "message": "Sign In Failed", "token": token}
                ),
                500,
            )

def valid_email(email):
    return bool (re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email))


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
                    # print("user created")
                    return (
                        jsonify({"success": True, "message": "Sign Up Successful"}),
                        500,
                    )
                else:
                    return (
                        jsonify({"success": False, "message": "Passwords do not match"}),
                        400,
                    )
            else:
                return (
                    jsonify({"success": False, "message": "All fields must be filled"}),
                    400,
                )
        else:
            # print("user exist")
            return (
                jsonify({"success": False, "message": "User already exist"}),
                400,
            )
    except:
         return (
                jsonify({"success": False, "message": "missing field"}),
                400,
            )



# Sign out function -- tested
@app.route("/sign_out", methods=["POST"])
def sign_out():
    # email = request.json["email"]
    try:
        token = request.json["token"]
        result = get_user_data_bytoken(token)
        print(result)
        print(result[0][0])
        if (result[0][0] == 0):
            return (
                jsonify({"success": False, "message": "Invalid Token"}),
                404,
            )
        # token = get_token_by_email(email)
        else:
            result = delete_token(token)
            # removed = request.headers.remove("token")
            if result == True:
                return jsonify({"success": True, "message": "Successfully signed out"}), 500

            else:
                return jsonify({"success": False, "message": "Sign out failed"}), 400
    except:
        return (
                jsonify({"success": False, "message": "Invalid Token"}),
                404,
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
    try:
    
        old_password = request.json["oldPassword"]
        new_password = request.json["newPassword"]
        check_new_password = request.json["checkNewPassword"]
        token = request.json["token"]
        result = get_user_data_bytoken(token)
        if (result[0][0] == 0):
            return (
                jsonify({"success": False, "message": "Invalid Token"}),
                404,
            )
        else:

            user = get_user(result[0][0])
            if user[1] != old_password:
                return (
                    jsonify({"success": False, "message": "Wrong password"}),
                    401,
                )
            elif len(new_password) < 4:
                return (
                    jsonify(
                        {"success": False, "message": "Password must be at least 4 characters"}
                    ),
                    400,
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

            else:
                update_password(result[0][0], new_password)
                return (
                    jsonify({"success": True, "message": "Password Changed Successfully"}),
                    500,
                )
    except:
        return (
            jsonify({"success": False, "message": "Invalid Token"}),
            400,
        )


# Get user data by email -- tested
@app.route("/get_userdata_by_email", methods=["GET"])
def get_userdata_by_email():
    
    try:
        email = request.json["email"]
        token = request.json["token"]
        result = get_user_data_bytoken(token)
        if (result[0][0] == 0):
            return (
                jsonify({"success": False, "message": "Invalid Token"}),
                404,
            )
        # searched_user = result[0][0]
        else:
            if user_exist(email) == True:
                print("check")
                userData = get_user_data_by_email(email)
                print(userData[0])
                return (
                    jsonify(
                        {
                            "success": True,
                            "message": "User Data Retrieved Successfully",
                            "data": [dict(row) for row in userData],
                        }
                    ),
                    500,
                )
            else:
                return (
                    jsonify({"success": False, "message": "Searched User does not exist"}),
                    404,
                )
    except:
        return (
                jsonify({"success": False, "message": "Invalid Token"}),
                404,
            )

# Get user data by token -- tested
@app.route("/get_user_data_by_token", methods=["GET"])
def get_user_data_by_token():
    # token = request.headers.get("token")
    try:
        token = request.json["token"]
        data = get_user_data_bytoken(token)
        # data = get_user_data_by_email(email)
        print(data[0][0])
        userData = get_user_data_by_email(data[0][0])
        if user_exist(data[0][0]) == True:
            # userData = get_user_data_bytoken(token)
            #  print(userData[0])
            return (
                jsonify(
                    {
                        "success": True,
                        "message": "User Data Retrieved Successfully",
                        "data": [dict(row) for row in userData],
                        
                    }
                ),
                500,
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
@app.route("/get_user_messages_by_email", methods=["GET"])
def get_user_messages_by_email():
    try:
        token = request.json["token"]
        email = request.json["email"]
        result = get_user_data_bytoken(token)
        current_user = result[0][0]
        # print(current_user)
        if (user_exist(email)== False):
            return (
                jsonify({"success": False, "message": "Email not found"}),
                400,
            )
        
        else:
            data = get_messages(email)
            if (current_user[0][0] == 0):
                return (
                    jsonify({"success": False, "message": "Invalid token"}),
                    400,
                )
            elif data != 0:
                # print("test")

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
                jsonify({"success": False, "message": "Invalid token"}),
                400,
            )

#get user messages by token    
@app.route("/get_user_messages_by_token", methods=["GET"])
def get_user_messages_by_token():
    try:
        token = request.json["token"]
        current_user = get_user_data_bytoken(token)
        # print("test")
        print(current_user[0][0])


        if (user_exist(current_user[0][0])== False):
            return (
                jsonify({"success": False, "message": "Invalid token"}),
                400,
            )
        
        else:
            data = get_messages(current_user[0][0]) # error
                                
            if data != 0:
                # print("test")

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
    try:
        # sender_email = request.json["sender_email"]
        receiver_email = request.json["email"]
        message = request.json["message"]
        token = request.json["token"]
        print(token)
        sender_email = get_user_data_bytoken(token)
        # print("test")
        # print(sender_email)
        receiver = user_exist(receiver_email)
        if receiver == False:
            return (
                jsonify({"success": False, "message": "Receiver does not exist"}),
                404,
            )
        # Pending add token verification
        elif (sender_email==0):
            return (
                jsonify({"success": False, "message": "Incorrect Token"}),
                404,
            )
        elif (message == ""):
            return (
            jsonify({"success": False, "message": "Message is empty."}),
                404, 
            )

        else:
            result = insert_messages(sender_email, receiver_email, message)
            if result == True:
                return (
                    jsonify({"success": True, "message": "Message Posted Successfully"}),
                    500,
                )

            else:
                return (
                    jsonify({"success": False, "message": "Message could not be posted"}),
                    400,
                )
    except: 
         return (
                jsonify({"success": False, "message": "Invalid token"}),
                400,
            )


# Defining base routes (users and messages)
@app.route("/user/<tokenID>")
def users(tokenID):
    return "User token: " + tokenID  # Placeholder


# @app.route("/messages")
# def messages():
#     return "Messages"  # Placeholder


# For token generation
def token_generator():
    LENGTH_TOKEN = 30
    STRING_TOKEN = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    token = ""
    for i in range(0, LENGTH_TOKEN):
        token += STRING_TOKEN[random.randint(0, len(STRING_TOKEN) - 1)]
    return token


if __name__ == "__main__":
    app.run(debug=True)


# For us to see the existing routes only, not to be used in the final implementation
@app.route("/routes", methods=["GET"])
def show_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append(
            {"endpoint": rule.endpoint, "methods": list(rule.methods), "url": str(rule)}
        )
    return jsonify(routes)
