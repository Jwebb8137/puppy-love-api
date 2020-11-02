const express = require("express");
const { cloudinary } = require("./utils/cloudinary");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./db");
const path = require("path");
const bcrypt = require("bcrypt");
const jwtGenerator = require("./utils/jwtGenerator");
const authorization = require("./middleware/authorization");
const config = require('./config');
const bodyParser = require('body-parser');
const { chatToken, videoToken } = require('./tokens');
const usersRouter = require('./routes/users/users-router');

const app = express();

//MIDDLEWARE

app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '50mb' })); //req.body
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

//JWT VERIFICATION

app.get("/api/-verified", authorization, async (req, res) => {
  try {
    res.json(true); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

app.use("/api/dashboard", require("./routes/dashboard"));

//RETRIEVE TARGET USER INFO

app.get("/api/target-info", authorization, async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [req.query.target]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

app.use("/api/images", require("./routes/cloudinary"));

app.use("/api/login", require("./routes/login"));

app.use("/api/users", usersRouter

)
//GET ALL USERS

// app.get("/users", async(req, res) => {
//   try {
//     const allUsers = await pool.query("SELECT * FROM profiles")
//     res.json(allUsers.rows)
//   } catch (err) {
//     console.error(err.message)
//   }
// })

// //GET A USER

// app.get("/users/:userid", async (req, res) => {
//   try {
//     const { userid } = req.params
//     const user = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userid])
//     res.json(user.rows[0])
//   } catch (err) {
//     console.log(err.message)
//   }
// })

// // //DELETE A USER

// app.delete("/users/:userid", async (req, res) => {
//   try {
//     const { userid } = req.params
//     const deleteUser = await pool.query("DELETE FROM profiles WHERE user_id = $1", [userid])
//     res.json("User was deleted!")
//   } catch (err) {
//     console.log(err.message)
//   }  
// })

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

app.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"))
});

//EDIT PROFILE PIC

app.post('/api/users/:userid', async(req,res) => {
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

module.exports = app;