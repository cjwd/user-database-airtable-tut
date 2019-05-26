const Airtable = require('airtable');
const bcrypt = require('bcrypt');
const data = require('./dataController.js');

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);
const table = base('users');

const findUser = async (email, username) => {
  let recordExists = false;
  const options = {
    filterByFormula: `OR(email = '${email}', username = '${username}')`,
  };

  const users = await data.getAirtableRecords(table, options);

  users.filter(user => {
    if (user.get('email') === email || user.get('username') === username) {
      return (recordExists = true);
    }
    return (recordExists = false);
  });

  return recordExists;
};

exports.addUser = async (req, res, next) => {
  const { fullname, email, username } = req.body;

  const userExists = await findUser(email, username);

  if (userExists) {
    res.render('login', {
      message: 'Username or Email already exists!',
    });
    return;
  }

  table.create(
    {
      email,
      username,
      display_name: fullname,
    },
    function(err, record) {
      if (err) {
        console.error(err);
        return;
      }
      req.body.id = record.getId();
      next();
    }
  );
};

exports.storePassword = (req, res) => {
  const { password, id } = req.body;

  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
      console.error(err);
      return;
    }

    table.update(
      id,
      {
        password: hash,
      },
      function(err) {
        if (err) {
          console.error(err);
          return;
        }
        res.render('login', {
          message: 'Your account has been created!',
        });
      }
    );
  });
};

exports.authenticate = (req, res) => {
  const { username, password } = req.body;
  const options = {
    filterByFormula: `OR(email = '${username}', username = '${username}')`,
  };

  data
    .getAirtableRecords(table, options)
    .then(users => {
      users.forEach(function(user) {
        bcrypt.compare(password, user.get('password'), function(err, response) {
          if (response) {
            // Passwords match, response = true
            res.render('profile', {
              user: user.fields,
            });
          } else {
            // Passwords don't match
            console.log(err);
          }
        });
      });
    })
    .catch(err => {
      console.log(Error(err));
    });
};
