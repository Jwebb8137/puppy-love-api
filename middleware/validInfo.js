module.exports = function(req, res, next) {
  const { email, username, passwordInput } = req.body;

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === "/users") {
    console.log(!email.length);
    if (![email, username, passwordInput].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    }
  } else if (req.path === "/login") {
    if (![username, passwordInput].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    }
  }

  next();
};