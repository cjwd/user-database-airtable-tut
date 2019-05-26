exports.getIndex = (req, res) => {
  res.render('index', {
    title: 'My App',
  });
};

exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Create an Account',
  });
};

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Sign In',
  });
};

exports.getProfile = (req, res) => {
  res.render('profile', {
    title: 'Your Profile',
  });
};
