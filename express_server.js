// DataBase

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDb = {
  admin: {
    id: "admin",
    email: "admin@admin.io",
    password: "admin",
  },

};

// Helper Funcs

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
}

const addLinkToDatabase = (id, url) => {
  urlDatabase[id] = url;
}

const getUserByCookie = (cookie) => {
  for (let user in usersDb) {
    if (usersDb[user].id === cookie) {
      return usersDb[user];
    }
  }
  return undefined;
}

const existingUserCheck = (email) => {
  for (let user in usersDb) {
    if (usersDb[user].email === email) {
      return true;
    }
  }
  return false;
}

// Settings
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
const e = require("express");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// Post

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  if (!req.body.email.trim() || !req.body.password.trim()) {
    res.status(400).send("Please enter an email and password");
  } else if (existingUserCheck(req.body.email)) {
    res.status(400).send("Email already exists");
  } else {
  res.cookie("user_id", user_id);
  usersDb[user_id] = { "id": user_id, "email": req.body.email, "password": req.body.password };
  res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  res.cookie("user", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  addLinkToDatabase(id, longURL);
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/");
});

// Get

app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_login", templateVars)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Port listener

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});