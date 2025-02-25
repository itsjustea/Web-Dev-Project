CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    familyName TEXT NOT NULL,
    gender TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_user_id INTEGER NOT NULL,
    receiver_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DROP TABLE IF EXISTS messages;

-- CREATE TABLE IF NOT EXISTS messages (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     sender_email TEXT NOT NULL,
--     receiver_email TEXT NOT NULL,
--     content TEXT NOT NULL,
--     datetime DATETIME DEFAULT CURRENT_TIMESTAMP
-- );


-- Clear DB

DELETE FROM user;
DELETE FROM messages;
DELETE FROM tokens;