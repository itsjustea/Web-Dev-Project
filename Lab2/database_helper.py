# This file will contain all the functions that access and control the database and shall contain some SQL scripts.
# This file will be used by the server.py to access the database. This file shall NOT contain any domain functions
# like sign in or sign up and shall only contain data-centric functionality like find_user(), remove_user(),
# create_post() and etc. Implementing sign_in() in server.py shall involve a call to find_user() implemented in
# database_helper.py .

import sqlite3

from flask import g, request

DATABASE = "database.db"


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row  # Allows column access by name
    return g.db


def close_db(error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def execute_query(query, params=()):
    # This is a generic execute function where we can run CRUD functions. The params are defined in the server.py file
    # Sample usage (in server.py):
    # query = """
    # INSERT INTO user (email, password, firstName, familyName, gender, city, country)
    # VALUES (?, ?, ?, ?, ?, ?, ?)
    # """
    # params = (email, password, first_name, last_name, gender, city, country)
    # execute_query(query, params)

    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    if query.strip().upper().startswith("SELECT"):
        result = (
            cursor.fetchall()
        )  # Fetch all rows that matches the query -  for SELECT queries only.
        return result
    return cursor


# Query for email and password to check if the user exists
def get_user(email):
    query = """
    SELECT email, password FROM user WHERE email = ?
    """
    params = (email,)
    user = execute_query(query, params)
    if user == []:
        return 0
    else:
        return user[0]


# Insert new user with their new data
def insert_user(email, password, firstName, familyName, gender, city, country):
    # print("insert")
    params = (
        email,
        password,
        firstName,
        familyName,
        gender,
        city,
        country,
    )
    query = """
    INSERT INTO user (email, password, firstName, familyName, gender, city, country)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    execute_query(query, params)


# Query for user data by email
def get_user_data_by_email(email):
    query = """
    SELECT * FROM user WHERE email = ?
    """
    params = (email,)
    user = execute_query(query, params)
    if user == []:
        return 0
    else:
        return user


# Query for user data by token
def get_user_data_bytoken(token):
    print(token)
    query = """
    SELECT email FROM tokens WHERE token = ?
    """
    params = (token,)
    result = execute_query(query, params)
    print(result)
    if result == []:
        return 0
    else:
        email = result[0][0]
        query = """
        SELECT email FROM user WHERE email = ?
        """
        params = (email,)
        user = execute_query(query, params)
        print(user)
        return user


# Retrieves all the rows from the database based on the query and params.
def retrieve_all(query, params=()):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    return cursor.fetchall()


# Insert token into token table - Used for sign in
def store_token(email, token):
    print(email, token)
    try:
        query = """
        INSERT INTO tokens (email, token)
        VALUES (?, ?)
        """
        params = (email, token)
        test = execute_query(query, params)
        # print(test)
        return True

    except:
        return False


# Delete token from token table - Used for sign out
def delete_token(token):
    db = get_db()
    cursor = db.cursor()
    query = """
    SELECT * FROM tokens WHERE token = ?
    """
    params = (token,)
    result = execute_query(query, params)
    if result != None:
        query = """
        DELETE FROM tokens WHERE token = ?
        """
        params = (token,)
        cursor.execute(query, params)
        db.commit()
        cursor.close()
        db.close()
        print("1")
        return True
    else:
        print("2")
        db.commit()
        cursor.close()
        db.close()
        return False

    # Just for checking if the token exists during testing, wont be used for presentation


def get_token_by_email(email):
    query = """
    SELECT token FROM tokens WHERE email = ?
    """
    params = (email,)
    token = execute_query(query, params)
    if token == []:
        return 0
    else:
        return token


# Just for checking if the token exists during testing, wont be used for presentation
def get_all_tokens():
    query = """
    SELECT * FROM tokens
    """
    tokens = execute_query(query, params=())
    if tokens == []:
        return 0
    else:
        return tokens


# Post password on table if password change is requested
def update_password(email, password):
    query = """
    UPDATE user SET password = ? WHERE email = ?
    """
    params = (password, email)
    execute_query(query, params)


# Insert message into message table
def insert_messages(sender, receiver, content):
    try:
        query = """
        INSERT INTO messages (sender_email, receiver_email, content)
        VALUES (?, ?, ?)
        """
        params = (sender, receiver, content)
        execute_query(query, params)
        return True
    except:
        return False


# Query for message data
def get_messages(receiver_email):
    query = """
    SELECT sender_email, content FROM messages WHERE receiver_email = ?
    """
    params = (receiver_email,)
    messages = retrieve_all(query, params)
    if messages == []:
        return 0
    else:
        return messages


# Can uncomment if you need this, but should be don't need. You can use the retrieve_all() function to perform SELECT with WHERE.
# def retrieve_one(query, params=()):
#     # Retrieves only one row from the database based on the query and params.
#     db = get_db()
#     cursor = db.cursor()
#     cursor.execute(query, params)
#     return cursor.fetchone()
