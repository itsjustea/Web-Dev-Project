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


def retrieve_all(query, params=()):
    # Retrieves all the rows fromt he database based on the query and params.
    db = get_db()
    cursor = db.cursor()
    cursor.execute(query, params)
    return cursor.fetchall()


# Can uncomment if you need this, but should be don't need. You can use the retrieve_all() function to perform SELECT with WHERE.
# def retrieve_one(query, params=()):
#     # Retrieves only one row from the database based on the query and params.
#     db = get_db()
#     cursor = db.cursor()
#     cursor.execute(query, params)
#     return cursor.fetchone()
