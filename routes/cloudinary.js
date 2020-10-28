const router = require("express").Router();
const { cloudinary } = require("./utils/cloudinary");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res) => {
  try {
    const {resources} = await cloudinary.search
      .expression('folder:puppylove')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();
    const publicIds = resources.map((file) => file.public_id );
    res.send(publicIds);      
  } catch (err) {
    console.error(err)
  }
});

module.exports = router;