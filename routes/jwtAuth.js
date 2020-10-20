const router = require("express").Router();

//registering

router.post("/", async (req, res) => {
  try {
    
    //1. destructure the req.body

    const

    //2. check if user exists (if user exists throw error)

    //3. Bcrypt the user password

    //4. enter the new user inside our db

    //5. generating our jwt token



  } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
  }
})

module.exports = router;