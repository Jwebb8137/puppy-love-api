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

app.use("/api/images", require("./routes/cloudinary"));

app.use("/api/login", require("./routes/login"));

app.use("/api/users", usersRouter)

app.use("/api/dashboard", require("./routes/dashboard"));

//JWT VERIFICATION

app.get("/api/is-verified", authorization, async (req, res) => {
  try {
    res.json(true); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

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

app.post("/api/chatroom/info", async (req, res) => {
  const { email, username, headline, password, first_name, last_name, age, hobbies, gender, seeking_gender, description, pet_type, pet_name, pet_description, pet_meet_description, pet_hobbies } = req.body;
  //check for existing user (if so throw error)
  const user = await pool.query("SELECT * FROM profiles WHERE username = $1", [username])   

  try {
    const { uid, chatMemberOrigin, chatMemberSecondary } = req.body;
    const chatInfo = await pool.query("INSERT INTO chat (chat-id, chat-member-origin, chat-member-secondary) VALUES ($1, $2, $3) RETURNING *",
      [uid, chatMemberOrigin, chatMemberSecondary]
    );  
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})




module.exports = app;