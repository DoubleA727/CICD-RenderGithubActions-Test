const bcrypt = require("bcrypt");

const saltRounds = 10;

module.exports.comparePassword = (req, res, next) => {    
    // Check password
    const callback = (err, isMatch) => {
      if (err) {
        console.error("Error bcrypt:", err);
        res.status(500).json(err);
      } else {
        if (isMatch) {
          next();
        } else {
          res.status(401).json({
            message: "Invalid username/email or password.",
          });
        }
      }
    };
    bcrypt.compare(req.body.password, res.locals.hash, callback);
};
  

module.exports.hashPassword = (req, res, next) => {
    const callback = (err, hash) => {
      if (err) {
        console.error("Error bcrypt:", err);
        res.status(500).json(err);
      } else {
        res.locals.hash = hash;
        next();
      }
    };
  
    bcrypt.hash(req.body.password, saltRounds, callback);
};

//FOR EDITING USER PROFILE, HASHES THE PASSWORD WHEN EDITING
module.exports.hashPasswordOnEdit = (req, res, next) => {
    const plainNewPassword = req.body.password;

    if (!plainNewPassword) return next();

    const callback = (err, hash) => {
        if (err) {
          console.error("Error bcrypt:", err);
          return res.status(500).json({ error: "Password hashing failed" });
        }

        //NEW PASS NOW HASHED
        req.body.password = hash;
        next();
    };

    // Perform hashing
    bcrypt.hash(plainNewPassword, saltRounds, callback);
};

// Hashes password when update
module.exports.hashPasswordOnEdit = (req, res, next) => {
  const plainNewPassword = req.body.password;
  if (!plainNewPassword) return next();

  bcrypt.hash(plainNewPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error bcrypt:", err);
      return res.status(500).json({ error: "Password hashing failed" });
    }
    req.body.password = hash; // overwrite plain password with hash
    next();
  });
};

  