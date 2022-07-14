// Settings
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['CaNt#HaCk%ThIs^BaDdIes', 'VeRyEnCrYpTeD#PaSsW0rd'],
  maxAge: 24 * 60 * 60 * 1000
})); // read cookies (needed for auth)
app.use(express.urlencoded({ extended: true })); // used for form data
const bcrypt = require("bcryptjs");  // used to hash passwords
const salt = bcrypt.genSaltSync(10);

const { getUserDb, generateRandomString, addLinkToDatabase, urlCheck, verifyUser, getUserByCookie, getUserByEmail, getUrlbyId } = require('./helpers.js');



// DataBase

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "admin",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};



const usersDatabase = {
  admin: {
    id: "admin",
    email: "admin@admin.io",
    password: bcrypt.hashSync("admin", salt)
  },

};


// Gets

app.get("/urls", (req, res) => {
  const state = req.session.user_id;
  if (!state) {
    res.send("<h1>Please login to see or add links</h1>");
  } else {
    let currentDb = getUserDb(req.session.user_id, usersDatabase);
    const templateVars = { urls: currentDb, user: getUserByCookie(req.session.user_id, usersDatabase) };
    res.render("urls_index", templateVars);
  }
});

app.get("/", (req, res) => {
  let currentDb = getUserDb(req.session.user_id, usersDatabase);
  const templateVars = { urls: currentDb, user: getUserByCookie(req.session.user_id, usersDatabase) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const state = req.session.user_id;
  if (!state) {
    res.redirect("/login");
  } else {
    const templateVars = { user: getUserByCookie(req.session.user_id, usersDatabase) };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const state = req.session.user_id;
  let currentDb = getUserDb(req.session.user_id, usersDatabase);
  if (!urlCheck(req.params.id, currentDb)) {
    res.status(400).send("<h1>URL does not exist</h1>");
  } else if (!state) {
    res.send("Please login to see or add links");
  } else if (currentDb[req.params.id] === undefined) {
    res.send("<h1>You don't have access to this link or it doesn't exist</h1>");
  } else {
    console.log(currentDb[req.params.id]);
    const templateVars = { id: req.params.id, longURL: currentDb[req.params.id], user: getUserByCookie(req.session.user_id, usersDatabase) };
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  const state = req.session.user_id;
  if (state) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: state };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const state = req.session.user_id;
  if (state) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: state };
    res.render("urls_login", templateVars)
  }
});

app.get("/u/:id", (req, res) => {
  let currentDb = getUserDb(req.session.user_id, usersDatabase);
  const longURL = getUrlbyId(req.params.id, currentDb);
  if (!longURL) {
    res.send("URL does not exist");
  } else {
    res.redirect(longURL);
  }
});

// Posts

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  if (!req.body.email.trim() || !req.body.password.trim()) {
    res.status(400).send("Please enter an email and password");
  } else if (getUserByEmail(req.body.email, usersDatabase)) {
    res.status(400).send("Account already exists");
  } else {
    req.session.user_id = user_id;
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    usersDatabase[user_id] = { "id": user_id, "email": req.body.email, "password": hashedPassword };
    res.redirect("/urls");
  }
});


app.post("/login", (req, res) => {
  let verification = verifyUser(req.body.email, req.body.password, usersDatabase);
  if (verification.email === false) {
    res.status(403).send("User does not exist");
  } else if (verification.password === false) {
    res.status(403).send("Password is incorrect");
  } else {
    req.session.user_id = getUserByEmail(req.body.email, usersDatabase).id;
    res.redirect("/urls");
  }
});



app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const state = req.session.user_id;
  if (!state) {
    res.send("Please login to create a new URL");
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.user_id;
    addLinkToDatabase(id, longURL, userID, urlDatabase);
    res.redirect(`/urls/${id}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const state = req.session.user_id;
  let currentDb = getUserDb(req.session.user_id, usersDatabase);
  console.log(!urlCheck(req.params.id));
  if (!urlCheck(req.params.id, currentDb)) {
    res.send("<h1>URL does not exist</h1>");
  } else if (!state) {
    res.send("<h1>Please login edit or delete links</h1>");
  } else if (currentDb[req.params.id] === undefined) {
    res.send("<h1>You don't have access to this link</h1>");
  } else {
    delete urlDatabase[req.params.id]
    res.redirect("/");
  }
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id]["longURL"] = req.body.longURL;
  res.redirect("/");
});


// Port listener

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});