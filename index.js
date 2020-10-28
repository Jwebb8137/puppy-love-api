const express = require("express");
const app = express();
const { cloudinary } = require("./utils/cloudinary");
const cors = require("cors");
const pool = require("./db");
const path = require("path");
const PORT = process.env.PORT || 5000;
const bcrypt = require("bcrypt");
const jwtGenerator = require("./utils/jwtGenerator");
const authorization = require("./middleware/authorization");
const config = require('./config');
const bodyParser = require('body-parser');
const { chatToken, videoToken } = require('./tokens');

//MIDDLEWARE

app.use(cors())
app.options('*', cors());
app.use(express.json({ limit: '50mb' })); //req.body
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
if(process.env.NODE_ENV === "production") {
  //server static content
  //npm run build
  app.use(express.static(path.join(__dirname, "client/build")));
}

//JWT VERIFICATION

app.get("/is-verified", authorization, async (req, res) => {
  try {

    res.json(true);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

//USER DASHBOARD

app.get("/dashboard", authorization, async (req, res) => {
  try {
    
    const user = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [req.user]);
    res.json(user.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

//RETRIEVE TARGET USER INFO

app.get("/target-info", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [req.query.target]);
    res.json(user.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

//RETRIEVE IMAGES FROM CLOUDINARY

app.get('/images', async (req, res) => {
  try {
    console.log("searching")
    const {resources} = await cloudinary.search
      .expression('folder:puppylove')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();
    const publicIds = resources.map((file) => file.public_id );
    console.log(publicIds);
    res.send(publicIds);      
  } catch (err) {
    console.error(err)
  }
})

//LOGIN

app.post("/login", async(req, res) => {
  try {

    console.log(req.body)

    //1. destructure the req.body

    const {username, passwordInput} = req.body;

    //2. check if user doesn't exit (if not throw error)

    const user = await pool.query("SELECT * FROM profiles WHERE username = $1", [username])

    if (user.rows.length === 0) {
      return res.status(401).send("Password or username does is incorrect")
    }

    //3. check if password is correct

    const validPassword = await bcrypt.compare(passwordInput, user.rows[0].password);

    console.log(validPassword);

    if(!validPassword) {
      return res.status(401).send("Password or Email is incorrect")
    };

    //4. issue jwt token

    const token = jwtGenerator(user.rows[0].user_id);

    res.json({ token })
    
  } catch (err) {
    console.error(err.message)
  }
})


//CREATE A USER

app.post('/users', async(req,res) => {
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
})

app.post('/user', async(req,res) => {
  try {
    const { username, first_name, last_name, password, email } = req.body;
    // const user = await pool.query("INSERT INTO profiles ( username, first_name, last_name, password, email ) VALUES ('CATGUY1', 'BOB', 'MCNOB', 'SECRET', 'MCNOB@GMAIL.COM')")
    const user = await pool.query("INSERT INTO profiles (email, username, password, first_name, last_name) VALUES($1, $2, $3, $4, $5)",
    [email, username, first_name, last_name, password]
  );
    res.end()
  } catch (err) {
    console.log(err.message)
    res.status(500).json({err: 'Something went wrong'})
  }
})

//GET ALL USERS

app.get("/users", async(req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM profiles")
    res.json(allUsers.rows)
  } catch (err) {
    console.error(err.message)
  }
})

//GET A USER

app.get("/users/:userid", async (req, res) => {
  try {
    const { userid } = req.params
    const user = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userid])
    res.json(user.rows[0])
  } catch (err) {
    console.log(err.message)
  }
})

// //DELETE A USER

app.delete("/users/:userid", async (req, res) => {
  try {
    const { userid } = req.params
    const deleteUser = await pool.query("DELETE FROM profiles WHERE user_id = $1", [userid])
    res.json("User was deleted!")
  } catch (err) {
    console.log(err.message)
  }  
})

//CHAT HANDLERS

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get('/chat/token', (req, res) => {
  const identity = req.query.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

app.post('/chat/token', (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

app.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.post('/user', async(req,res) => {
  try {
    const { username, first_name, last_name, password, email } = req.body;
    const user = await pool.query("INSERT INTO profiles (email, username, password, first_name, last_name) VALUES($1, $2, $3, $4, $5)",
    [email, username, first_name, last_name, password]
  );
    res.end()
  } catch (err) {
    console.log(err.message)
    res.status(500).json({err: 'Something went wrong'})
  }
})

app.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"))
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})

//EDIT PROFILE PIC

app.post('/users/:userid', async(req,res) => {
  try {
    console.log("working")

    //Upload image to cloudinary

    const {previewSource, user_id} = req.body;
    const uploadedResponse = await cloudinary.uploader.upload(previewSource, {
      upload_preset: 'default'
    })
    const photo_url = uploadedResponse.url;
    const updatePhoto = await pool.query("UPDATE profiles SET photo_url = $1 WHERE user_id = $2",
    [photo_url, user_id]
    );
    console.log("working")
    res.end()
  } catch (err) {
    console.log(err.message)
    res.status(500).json({err: 'Something went wrong'})
  }
})
