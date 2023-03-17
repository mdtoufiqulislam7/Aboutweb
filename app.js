const express = require("express");
const app = express();
require("./config/db");
const cors = require("cors");
const path = require("path");
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();


//export Schema app
const User = require("./model/user.model")





//passport session setup  
//start
const passport = require('passport');
const session = require('express-session')
const MongoStore = require('connect-mongo');
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
  store: MongoStore.create({
    mongoUrl: process.env.db_url,
    collectionName: "sessionDAta",
  })
}))

app.use(passport.initialize());
app.use(passport.session());


//passport Authantic
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy(async (username, password, done)=> {

      try {
        const user = await User.findOne({ username: username }); 
        if (!user) { return done(null, false,{message: "user incorrected"});
      }  
      if(!bcrypt.compare(password,user.password)){
        return done(null, false,{message: "password incorrected"});
      }
        return done(null, user);
      } catch (error) {
        return done(error);
      }

    


      
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // find session info using session id
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });

// end creat session and password auth and seril deserila 











app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'view'))




app.get("/",(req,res,next)=>{
    res.render('index')
})


const checklogin = (req,res,next)=>{
    if(req.isAuthenticated()){
        return res.redirect('/profile')
    }
    next()
}


//login get
app.get("/login",checklogin,(req,res)=>{
    res.render('login')
})
//login post 

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login',successRedirect: '/profile' }),
  );
//registion get

app.get("/registion",(req,res)=>{
    res.render('registion');
})
//registion post
app.post("/registion",async (req,res)=>{
   const user = await User.findOne({username: req.body.username});
   if(user) return res.status(400).send("user already exist");

   bcrypt.hash(req.body.password, saltRounds, async(err, hash)=> {
    // Store hash in your password DB.
    const newuser = new User({
        username: req.body.username,
        password: hash,
    })
    await newuser.save();
    res.redirect('/login')
});

})

//profile get

const checkauthenticated = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login')
}

app.get("/profile",checkauthenticated,(req,res)=>{
   
    res.render('profile')

    
})

app.get('/logout',(req,res)=>{
  
    try {
        req.logOut((err)=>{
            if(err){
                return next(err)
            }
            else{
                res.redirect('/')
            }
        })
    } catch (error) {
        res.status(400).send(error.message)
    }

})



 //error haldeler   
app.use((req,res,next)=>{
    res.json({
        error: "Route Not Found"
    })
})

app.use((err,req,res,next)=>{
    res.json({
        error: "Server problem"
    })
})

app.use=((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});




module.exports= app;