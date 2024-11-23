const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables from .env file

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Configure session middleware
app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Configure Passport with GitHub strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      profile.accessToken = accessToken;
      // Save user profile to the session
      return done(null, profile);
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Define routes
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["public_repo"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/index.html");
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/test", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello, ${req.user.username}! <a href="/logout">Logout</a>`);
  } else {
    res.send('<a href="/auth/github">Login with GitHub</a>');
  }
});

// Endpoint to get user data
app.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ username: req.user.username });
  } else {
    res.json({ username: null });
  }
});

app.get("/favorites", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("authenticatd");
    const options = {
      headers: {
        "User-Agent": "request",
        Authorization: "token " + req.user.accessToken,
      },
    };

    fetch("https://api.github.com/user/starred", options)
      .then((response) => response.json())
      .then((data) => {
        console.log("get favorites", data);
        return res.json(data);
      })
      .catch((err) =>
        res.status(500).json({ error: "Failed to fetch favorites" })
      );
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

app.get("/favoritePage", (req, res) => {
  if (req.isAuthenticated) {
    res.sendFile(path.join(__dirname, "public/favoritePage", "favorites.html"));
  } else {
    res.redirect("/");
  }
});

app.post("/star", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Post Start Authenticated User");
    const { owner, repo } = req.body;
    const options = {
      method: "PUT",
      headers: {
        "User-Agent": "request",
        Authorization: "token " + req.user.accessToken,
        "Content-Length": 0,
      },
    };

    fetch(`https://api.github.com/user/starred/${owner}/${repo}`, options)
      .then((response) => {
        if (response.status === 204) {
          res.json({ message: "Repository starred successfully" });
        } else {
          res
            .status(response.status)
            .json({ error: "Failed to star repository" });
        }
      })
      .catch((error) =>
        res.status(500).json({ error: "Failed to star repository" })
      );
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

app.delete("/unstar", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Unstar repo by Authenticated User");
    const { owner, repo } = req.body;
    const options = {
      method: "DELETE",
      headers: {
        "User-Agent": "request",
        Authorization: "token " + req.user.accessToken,
        "Content-Length": 0,
      },
    };

    fetch(`https://api.github.com/user/starred/${owner}/${repo}`, options)
      .then((response) => {
        if (response.status === 204) {
          res.json({ message: "Repository unstarred successfully" });
        } else {
          res
            .status(response.status)
            .json({ error: "Failed to unstar repository" });
        }
      })
      .catch((error) =>
        res.status(500).json({ error: "Failed to unstar repository" })
      );
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
