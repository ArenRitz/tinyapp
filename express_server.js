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


const test = {
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

const getUserByEmail = (email) => {
  for (let user in usersDb) {
    if (usersDb[user].email === email) {
      return usersDb[user];
    }
  }
  return undefined;
}

const passwordCheck = (password) => {
  for (let user in usersDb) {
    if (usersDb[user].password === password) {
      return true;
    }
  }
  return false;
}

const getUrlbyId = (id, db) => {
  if (Object.keys(db).includes(id)) {
    return db[id];
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
  if (!state) {
    res.send("Please login to see or add links");
  } else if (currentDb[req.params.id] === undefined) {
    res.send("<h1>You don't have access to this link or it doesn't exist</h1>");
  } else {
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
    usersDb[user_id] = { "id": user_id, "email": req.body.email, "password": req.body.password };
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email.trim())) {
    res.status(403).send("User does not exist")
  } else if (!passwordCheck(req.body.password))
    res.status(403).send("Password is incorrect")
  else {
    res.cookie("user_id", getUserByEmail(req.body.email).id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  if (!state) {
    res.send("Please login to create a new URL");
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    addLinkToDatabase(id, longURL);
    res.redirect(`/urls/${id}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const state = getUserByCookie(req.cookies["user_id"])
  let currentDb = getUserDb(req.cookies["user_id"]);
  if (!state) {
    res.send("Please login edit or delete links");
  } else if (currentDb[req.params.id] === undefined) {
    res.send("<h1>You don't have access to this link or it doesn't exist</h1>");
  } else {
  delete currentDb[req.params.id]
  res.redirect("/");
  }
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/");
});



// Port listener

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});