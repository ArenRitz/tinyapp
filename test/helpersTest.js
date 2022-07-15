const { assert } = require('chai');

const { getUserDb, generateRandomString, addLinkToDatabase, urlCheck, getUserByCookie, getUserByEmail, getUrlbyId } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const userUrlDatabase = {
  "b6UTxQ": "https://www.tsn.ca",
  "g3kdsl": "https://www.github.com",
};

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



describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
});


describe('getUserByEmail', function () {
  it('should return undefined for a wrong email', function () {
    const user = getUserByEmail("user@exomple.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, undefined);
  });
});


describe('getUserByCookie', function () {
  it('should return a user with valid cookie', function () {
    const user = getUserByCookie("userRandomID", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
});

describe('getUrlbyId', function () {
  it('should return a url with valid id', function () {
    const url = getUrlbyId("b6UTxQ", urlDatabase);
    const expectedURL = "https://www.tsn.ca";
    assert.equal(url.longURL, expectedURL);
  });
});

describe('urlCheck', function () {
  it('should return true if url exists', function () {
    const url = urlCheck("b6UTxQ", urlDatabase);
    const expectedURL = true;
    assert.equal(url, expectedURL);
  });
});

describe('addLinkToDatabase', function () {
  it('should add a link to the database', function () {
    addLinkToDatabase("g3kdsl", "https://www.github.com", "admin", urlDatabase);
    const expectedObj = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "admin",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
      },
      g3kdsl: {
        longURL: "https://www.github.com",
        userID: "admin",
      }
    };
    assert.deepEqual(urlDatabase, expectedObj);
  });
});

describe('generateRandomString', function () {
  it('should generate a random string every time', function () {
    const randomString1 = generateRandomString();
    const randomString2 = generateRandomString();
    assert.notEqual(randomString1, randomString2);
  });
});

describe('getUserDb', function () {
  it('should return a user database', function () {
    const userDb = getUserDb("admin", urlDatabase);

    assert.deepEqual(userDb, userUrlDatabase);
  });
});