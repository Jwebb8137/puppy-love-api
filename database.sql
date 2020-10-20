DROP TABLE profiles;

CREATE TABLE profiles
(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(255),
    description VARCHAR(255),
    seeking_gender VARCHAR(255),
    pet_type VARCHAR(255),
    pet_name VARCHAR(255),
    photo_url VARCHAR(255),
    pet_description VARCHAR(255),
    age VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo_pet_url VARCHAR(255),
    headline VARCHAR(255),
    pet_meet_description VARCHAR(255),
    pet_hobbies VARCHAR(255),
    hobbies VARCHAR(255)
);