CREATE DATABASE image_processor;

--User Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email_address VARCHAR(320) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL
);

CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    image_s3_key TEXT NOT NULL,
    image_file_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() 
);


