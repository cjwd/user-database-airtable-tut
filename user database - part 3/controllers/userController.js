const Airtable = require('airtable');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const querystring = require('querystring');
const data = require('./dataController.js');

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);
const table = base('users');

// Start Helper Functions
const findUser = async (email = undefined, username = undefined) => {
  let recordExists = false;
  let options = {};

  if (email && username) {
    options = {
      filterByFormula: `OR(email = '${email}', username = '${username}')`,
    };
  } else {
    options = {
      filterByFormula: `OR(email = '${email}', username = '${email}')`,
    };
  }

  const users = await data.getAirtableRecords(table, options);

  users.filter(user => {
    if (user.get('email') === email || user.get('username') === username) {
      return (recordExists = true);
    }
    if (user.get('email') === email || user.get('username') === email) {
      return (recordExists = true);
    }
    return false;
  });

  return recordExists;
};

const generateToken = (id, email) => {
  const source = `${id}${email}`;
  let token = '';
  for (let i = 0; i < source.length; i += 1) {
    token += source.charAt(Math.floor(Math.random() * source.length));
  }

  return token;
};

const generateResetUrl = (token, email) => {
  let url = '';
  url = `login/resetlink/${token}?${querystring.stringify({ email })}`;
  return url;
};

// End Helper Functions

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
    (err, record) => {
      if (err) {
        console.error(err);
        return;
      }
      req.body.id = record.getId();
      next();
    }
  );
};

exports.storePassword = (req, res, next) => {
  const { password, id } = req.body;

  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
      console.error(err);
      return;
    }

    req.body.hash = hash;

    data.updateRecord(table, id, {
      password: hash,
    });

    next();
  });
};

exports.confirmToken = async (req, res, next) => {
  // Get Form Variables
  const { email, token } = req.body;

  const options = {
    filterByFormula: `OR(email = '${email}', token = '${token}')`,
  };

  // Get the user
  const users = await data.getAirtableRecords(table, options);

  const user = users.map(record => ({
    id: record.getId(),
  }));

  // hash and the update the user's password
  req.body.id = user[0].id;
  next();
};

exports.authenticate = (req, res, next) => {
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
            req.session.authenticated = user.fields;
            res.redirect('/profile');
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

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
    return;
  }

  res.redirect('/login');
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (!err) {
      res.clearCookie('connect.sid');
      res.redirect('/');
    } else {
      throw new Error(err);
    }
  });
};

exports.addToken = async (req, res, next) => {
  const { username } = req.body;
  // Check that the user exists. We wrote this helper function already in Part 1
  const userExists = await findUser(username);

  if (!userExists) {
    res.render('/user/forgot', {
      message: 'Username or Email already exists!',
    });
    return;
  }

  const options = {
    filterByFormula: `OR(email = '${username}', username = '${username}')`,
  };

  // Get the user
  const users = await data.getAirtableRecords(table, options);

  const user = users.map(record => ({
    id: record.getId(),
    email: record.get('email'),
  }));

  const token = generateToken(user[0].id, user[0].email);

  table.update(
    user[0].id,
    {
      token,
    },
    (err, record) => {
      if (err) {
        console.error(err);
      }

      req.body.url = generateResetUrl(token, user[0].email);
      req.body.to = user[0].email;
      next();
    }
  );
};

exports.sendPasswordResetEmail = async (req, res) => {
  const subject = 'Password Reset link for My Sweet App';
  const { url, to } = req.body;
  const body = `Hello,
  You requested to have your password reset. Ignore if this is a mistake or you did not make this request. Otherwise, click the link below to reset your password.
  <a href="http://localhost:7777/${url}">Reset My Password</a>
  You can also copy and paste this link in your browser URL bar.
  <a href="http://localhost:7777/${url}">http://localhost:7777/${url}</a>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    // secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      // email sent
      res.render('forgot', {
        message: 'Please check your email for your password reset link',
      });
    }
  });
};

exports.sendConfirmResetEmail = async (req, res) => {
  const subject = 'Password successfully reset';
  const to = req.body.email;
  const body = `Hello, Your password was successfully reset.`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    // secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      // email sent
      res.render('login');
    }
  });
};
