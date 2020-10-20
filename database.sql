CREATE DATABASE users;

CREATE TABLE profiles(
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL
);