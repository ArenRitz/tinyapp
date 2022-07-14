// Settings
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.urlencoded({ extended: true })); // used for form data
const bcrypt = require("bcryptjs");  // used to hash passwords


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
    password: bcrypt.hashSync("admin", 10)
  },

};

// Helper Funcs

// returns the only the links the user has access to
const getUserDb = (cookie) => {
  let currentDb = {};
  let currentUser = cookie;
  for (const urls in urlDatabase) {
    if (urlDatabase[urls].userID === currentUser) {
      let key = urls;
      let value = urlDatabase[urls]["longURL"];
      currentDb[key] = value;
    }
  }
  return currentDb;
}
// generates ID used for new users and links
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
}
// adds link to global urlDatabase
const addLinkToDatabase = (id, url, user_id) => {
  urlDatabase[id] = { "longURL": url, "userID": user_id };
}
// verifies if url exists in global urlDatabase
const urlCheck = (urlID, db) => {
  for (const id in db) {
    if (id === urlID) {
      return true;
    }
  }
  return false;
}

const verifyUser = (email, password) => {
  let verification = { "email": false, "password": false };
  for (let users in usersDatabase) {
    if (usersDatabase[users].email === email) {
      verification.email = true;
      if (bcrypt.compareSync(password, usersDatabase[users].password)) {
        verification.password = true;
      }
    }
  }
  return verification;
};

// gets the user_id from cookie
const getUserByCookie = (cookie) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].id === cookie) {
      return usersDatabase[user];
    }
  }
  return undefined;
}
// gets user_id from email
const getUserByEmail = (email) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return undefined;
}
// verifies password for log-in
const passwordCheck = (password) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].password === password) {
      return true;
    }
  }
  return false;
}
// gets URL from the url id
const getUrlbyId = (id, db) => {
  if (Object.keys(db).includes(id)) {
    return db[id];
  }
  return undefined;
}


// Get

app.get("/urls", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  if (!state) {
    res.send("<h1>Please login to see or add links</h1>");
  } else {
    let currentDb = getUserDb(req.cookies["user_id"]);
    const templateVars = { urls: currentDb, user: getUserByCookie(req.cookies["user_id"]) };
    res.render("urls_index", templateVars);
  }
});

app.get("/", (req, res) => {
  let currentDb = getUserDb(req.cookies["user_id"]);
  const templateVars = { urls: currentDb, user: getUserByCookie(req.cookies["user_id"]) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  if (!state) {
    res.redirect("/login");
  } else {
    const templateVars = { user: getUserByCookie(req.cookies["user_id"]) };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  let currentDb = getUserDb(req.cookies["user_id"]);
  if (!urlCheck(req.params.id, currentDb)) {
    res.status(400).send("<h1>URL does not exist</h1>");
  } else if (!state) {
    res.send("Please login to see or add links");
  } else if (currentDb[req.params.id] === undefined) {
    res.send("<h1>You don't have access to this link or it doesn't exist</h1>");
  } else {
    console.log(currentDb[req.params.id]);
    const templateVars = { id: req.params.id, longURL: currentDb[req.params.id], user: getUserByCookie(req.cookies["user_id"]) };
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  if (state) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: state };
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  if (state) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: state };
    res.render("urls_login", templateVars)
  }
});

app.get("/u/:id", (req, res) => {
  let currentDb = getUserDb(req.cookies["user_id"]);
  const longURL = getUrlbyId(req.params.id, currentDb);
  if (!longURL) {
    res.send("URL does not exist");
  } else {
    res.redirect(longURL);
  }
});

// Post

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  if (!req.body.email.trim() || !req.body.password.trim()) {
    res.status(400).send("Please enter an email and password");
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send("Account already exists");
  } else {
    res.cookie("user_id", user_id);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    usersDatabase[user_id] = { "id": user_id, "email": req.body.email, "password": hashedPassword };
    res.redirect("/urls");
  }
});


app.post("/login", (req, res) => {
  let verification = verifyUser(req.body.email, req.body.password);
  if (verification.email === false) {
    res.status(403).send("User does not exist");
  } else if (verification.password === false) {
    res.status(403).send("Password is incorrect");
  } else {
    res.cookie("user_id", getUserByEmail(req.body.email).id);
    res.redirect("/urls");
  }
});



app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  if (!state) {
    res.send("Please login to create a new URL");
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.cookies["user_id"];
    addLinkToDatabase(id, longURL, userID);
    res.redirect(`/urls/${id}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  let currentDb = getUserDb(req.cookies["user_id"]);
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