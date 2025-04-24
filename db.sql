CREATE DATABASE image_processor;

--User Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email_address VARCHAR(320) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL
);

CREATE TYPE image_status AS ENUM ('ready', 'processing', 'failed');

CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    image_s3_key TEXT,
    image_file_name TEXT,
    mime_type VARCHAR(15),
    status image_status NOT NULL DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT NOW() 
);


