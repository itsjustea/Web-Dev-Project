# This file shall contain all the server side services, implemented using Python and Flask

from database_helper import *
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


@app.route("/")  # Initial landing page of the user.
def hello_world():
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


# Inserts a dummy user - for testing
# @app.route("/insert_user", methods=["POST"])
# def insert_user():
#     query = """
#     INSERT INTO user (email, password, firstName, familyName, gender, city, country)
#     VALUES (?, ?, ?, ?, ?, ?, ?)
#     """
#     params = (
#         "Test@r.c",
#         "password123",
#         "test first name",
#         "test last name",
#         "test gender",
#         "test city",
#         "test country",
#     )

#     try:
#         execute_query(query, params)
#         return jsonify({"success": True, "message": "User inserted successfully"}), 201
#     except Exception as e:
#         return jsonify({"success": False, "message": str(e)}), 500


# Retrieves a specific user based on email - can use later
@app.route("/retrieve_user", methods=["GET"])
def retrieve_user():
    query = """
    SELECT * FROM user WHERE email = ?
    """
    params = ("Test@r.c",)  # Make sure this is a tuple, not a string

    try:
        result = execute_query(query, params)
        if result:  # Check if the result is not empty
            user = result[0]  # Assuming only one user matches
            return (
                jsonify(
                    {
                        "success": True,
                        "user": {
                            "id": user[0],
                            "email": user[1],
                            "firstName": user[2],
                            "familyName": user[3],
                            "gender": user[4],
                            "city": user[5],
                            "country": user[6],
                        },
                    }
                ),
                200,
            )
        else:
            return jsonify({"success": False, "message": "User not found"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# # Defining all the necessary functions from serverstub
@app.route("/sign_in", methods=["POST"])
def sign_in():

    email = request.json['email']
    password = request.json['password']

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
        return (
            jsonify({"success": True, "message": "Sign In Successful"}),
            200,
        )


@app.route("/sign_up", methods=["POST"])
def sign_up():

    email = request.json["email"]
    # print(email)
    # print("checking if user exist")
    if (user_exist(email)) == False:
        # print("user does not exist")2e
        first_name = request.json["firstName"]
        last_name = request.json["familyName"]
        gender = request.json["gender"]
        city = request.json["city"]
        country = request.json["country"]
        password = request.json["password"]
        password_confirmation = request.json["password_confirmation"]

        if (
            (email != "")
            or (len(password) < 4)
            or (first_name != "")
            or (last_name != "")
            or (gender != "")
            or (city != "")
            or (country != "")
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


@app.route("/sign_out", methods=["POST"])
def sign_out():
    email = request.json["email"]
    # TODO: Add If/else to see if email exists in the database. If yes, delete. If no, return false.
    delete_token(email)
    return jsonify({"success": True, "message": "Successfully signed out"}), 500


# Check whether user exist
def user_exist(email):
    exist = get_user(email)
    if exist == email:
        result = False

    else:
        result = True

    return result

@app.route("/user/change_password", methods=["POST"])
def change_password():

    email = request.json["email"]
    old_password = request.json["oldPassword"]
    new_password = request.json["newPassword"]

    user = get_user(email)
    if (user[1] != old_password):
        return (
            jsonify({"success": False, "message": "Wrong password"}),
            401,
        )
    
    elif (len(new_password)<4):
        return (
            jsonify({"success": False, "message": "Password must be at least 4 characters"}),
            400,
        )
    
    else:
        update_password(email, new_password)
        return (jsonify({"success": True, "message": "Password Changed Successfully"}), 500)


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


# # Defining base routes (users and messages)
# @app.route("/user")
# def users():
#     return "User"  # Placeholder


# @app.route("/messages")
# def messages():
#     return "Messages"  # Placeholder


# For us to see the existing routes only, not to be used in the final implementation
@app.route("/routes", methods=["GET"])
def show_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append(
            {"endpoint": rule.endpoint, "methods": list(rule.methods), "url": str(rule)}
        )
    return jsonify(routes)


if __name__ == "__main__":
    app.run(debug=True)
