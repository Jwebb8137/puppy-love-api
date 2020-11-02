const express = require('express');
const usersRouter = express.Router();
const bodyParser = express.json();
const { cloudinary } = require("../../utils/cloudinary");
const pool = require("../../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../../utils/jwtGenerator");
const bcrypt = require("bcrypt");

usersRouter  
  .route('/')
  .get("/", async(req, res) => {
    try {
      const allUsers = await pool.query("SELECT * FROM profiles")
      res.json(allUsers.rows)
    } catch (err) {
      console.error(err.message)
    }
  })

  .get("/:userid", async (req, res) => {
    try {
      const { userid } = req.params
      const user = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userid])
      res.json(user.rows[0])
    } catch (err) {
      console.log(err.message)
    }
  })

  .delete("/:userid", async (req, res) => {
    try {
      const { userid } = req.params
      const deleteUser = await pool.query("DELETE FROM profiles WHERE user_id = $1", [userid])
      res.json("User was deleted!")
    } catch (err) {
      console.log(err.message)
    }  
  })

  .post("/", async (req, res) => {
    try {
      //Upload image to cloudinary   
      const { previewSource } = req.body;
      const uploadedResponse = await cloudinary.uploader.upload(previewSource, {
        upload_preset: 'default'
      })
      const photo_url = uploadedResponse.url;
      //Upload pet image to cloudinary
      const { previewPetSource } = req.body;
      const uploadedPetResponse = await cloudinary.uploader.upload(previewPetSource, {
        upload_preset: 'default'
      })
      const photo_pet_url = uploadedPetResponse.url;
      //destructure body
      const { email, username, headline, password, first_name, last_name, age, hobbies, gender, seeking_gender, description, pet_type, pet_name, pet_description, pet_meet_description, pet_hobbies } = req.body;
      //check for existing user (if so throw error)
      const user = await pool.query("SELECT * FROM profiles WHERE username = $1", [username])   
      if(user.rows.length !== 0) {
        return res.status(401).send("User already exists");
      }
      //Bcrypt password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const bcryptPassword = await bcrypt.hash(password, salt);
      //if no user exists
      const newUser = await pool.query("INSERT INTO profiles (email, username, password, headline, first_name, last_name, age, hobbies, gender, seeking_gender, description, pet_type, pet_name, pet_description, pet_meet_description, pet_hobbies, photo_url, photo_pet_url) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *",
        [email, username, bcryptPassword, headline, first_name, last_name, age, hobbies, gender, seeking_gender, description, pet_type, pet_name, pet_description, pet_meet_description, pet_hobbies, photo_url, photo_pet_url]
      );
      // generate jwt token
      const token = jwtGenerator(newUser.rows[0].user_id);
      res.json({ token })
    } catch (err) {
      console.log(err.message)
      res.status(500).json({err: 'Something went wrong'})
    }
  });