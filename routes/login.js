const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");

router.post("/", authorization, async (req, res) => {
  try {
    //1. destructure the req.body
    const {username, passwordInput} = req.body;
    //2. check if user doesn't exit (if not throw error)
    const user = await pool.query("SELECT * FROM profiles WHERE username = $1", [username])
    if (user.rows.length === 0) {
      return res.status(401).send("Password or username does is incorrect")
    }
    //3. check if password is correct
    const validPassword = await bcrypt.compare(passwordInput, user.rows[0].password);
    if(!validPassword) {
      return res.status(401).send("Password or Email is incorrect")
    };
    //4. issue jwt token
    const token = jwtGenerator(user.rows[0].user_id);
    res.json({ token })
  } catch (err) {
    console.error(err.message)
  }
});

module.exports = router;