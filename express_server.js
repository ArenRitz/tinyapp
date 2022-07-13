// DataBase

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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
  for (let user in users) {
    if (users[user].id === cookie) {
      return users[user];
    }
  }
  return undefined;
}

// Settings
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// Post

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  res.cookie("user_id", user_id);
  users[user_id] = { "id": user_id, "email": req.body.email, "password": req.body.password };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
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
  const templateVars = { urls: urlDatabase, user: undefined };
  const userCheck = getUserByCookie(req.cookies["user_id"]);
  if (userCheck) {
    templateVars["user"] = userCheck;
  }
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: undefined };
  const userCheck = getUserByCookie(req.cookies["user_id"]);
  if (userCheck) {
    templateVars["user"] = userCheck;
  }
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: undefined };

  const userCheck = getUserByCookie(req.cookies["user_id"]);
  if (userCheck) {
    templateVars["user"] = userCheck;
  }
  console.log(templateVars)
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: undefined };
  const userCheck = getUserByCookie(req.cookies["user_id"]);
  if (userCheck) {
    templateVars["user"] = userCheck;
  }
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: undefined };
  const userCheck = getUserByCookie(req.cookies["user_id"]);
  if (userCheck) {
    templateVars["user"] = userCheck;
  }
  console.log(templateVars)
  res.render("urls_register", templateVars);
});



// Port listener

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});