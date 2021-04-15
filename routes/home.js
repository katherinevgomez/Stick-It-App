///////////////////////////////
// Import Router
////////////////////////////////
const router = require("express").Router()
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Game = require("../models/User")

//CUSTOM MIDDLEWARE FUNCTIONS
const addUserToRequest = async (req, res, next) => {
    // check if the user is logged in
    if (req.session.userId){
        req.user = await User.findById(req.session.userId)
        next()
    } else {
        next()
    }
}

//checks if req.user exists, if not, redirect to login
const isAuthorized = (req, res, next) => {
    if(req.user){
        next()
    }else {
        res.redirect("/auth/login")
    }
}


///////////////////////////////
// Router Specific Middleware
////////////////////////////////
router.use(addUserToRequest)
///////////////////////////////
// Router Routes
////////////////////////////////
router.get("/", (req, res) => {
    res.render("home")
})

router.get("/about", (req,res) => {
    res.render("about")
})
//DELETE ROUTE
router.delete("/games/:id", (req,res) => {
    
    User.findByIdAndDelete(req.params.id,
        (error, data) => {
            res.redirect("/games")
        })
})

//AUTH RELATETED ROUTES

//SIGNUP ROUTES
router.get("/auth/signup", (req,res) => {
    res.render("auth/signup")
})
router.post("/auth/signup", async (req,res) => {
    try {
        //generate out salt
        const salt = await bcrypt.genSalt(10)
        //hash the password
        req.body.password = await bcrypt.hash(req.body.password, salt)
        console.log(req.body)
        //create the new user
        await User.create(req.body)
        //res.redirect
        res.redirect("/auth/login")
    }catch(error){
        res.json(error)
    }
})
//LOGIN ROUTES
router.get("/auth/login", (req,res) => {
    res.render("auth/login")
})
router.post("/auth/login", async (req, res) => {
    try {
      // get the user
      const user = await User.findOne({ username: req.body.username });
      if (user) {
        //check if the passwords match
        const result = await bcrypt.compare(req.body.password, user.password);
        if (result) {
          // add userId property to the session object
          req.session.userId = user._id;
          // redirect
          res.redirect("/games");
        } else {
          res.json({ error: "Password does not match" });
        }
      } else {
        res.json({ error: "User Doesn't Exist" });
      }
    } catch (error) {
      res.json(error);
    }
  });
//LOGOUT
router.get("/auth/logout", (req,res) => {
    //remove the userId property
    req.session.userId = null
    //redirect to main page
    res.redirect("/")
})

router.get("/games", isAuthorized, async (req,res) => {
    //pass req.user to our template
    res.render("games", {
        games: req.user.games,
    })
})



//games create route when form submitted
router.post("/games", isAuthorized, async (req, res) => {
    // fetch up to date user
    const user = await User.findOne({username: req.user.username})
    // push the game into the user
    user.games.push(req.body)
    await user.save()
    // redirect back to games
    res.redirect("/games")
})


///////////////////////////////
// Export Router
////////////////////////////////
module.exports = router