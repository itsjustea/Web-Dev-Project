import sqlite3

DATABASE = "database.db"

with open("schema.sql", "r") as f:
    schema = f.read()

conn = sqlite3.connect(DATABASE)
cursor = conn.cursor()
cursor.executescript(schema)
conn.commit()
conn.close()

print("Database initialized successfully")
