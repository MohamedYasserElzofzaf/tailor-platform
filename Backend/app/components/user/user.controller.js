const User = require("./user.model");
const mongo = require("mongoose");
const jwt = require("jsonwebtoken");
const { userSchema } = require("../../utility/validationSchema");
const promise_handler = require("../../utility/promiseHandler");
const { check_password, hashing } = require("../../utility/password");

const OK = 200;
const CREATED = 201;
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

const TOKEN_AGE = 7 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secretitivezeetacloneproject", {
    expiresIn: TOKEN_AGE,
  });
};

module.exports = {
  get_user: async (req, res, next) => {
    try {
      const id = req.params.id;
      is_valid_id(id);
      const [user, err] = await promise_handler(User.findById(id));
      is_not_founded(user);
      is_no_error(err, INTERNAL_SERVER_ERROR);
      res.status(OK).json(user);
    } catch (err) {
      next(err);
    }
  },

  sign_up: async (req, res, next) => {
    const { email } = req.body;
    try {
      const doesExist = await User.findOne({ email });
      if (doesExist)
        throw { status: BAD_REQUEST, message: "Email already registered." };
      const [user, error] = await promise_handler(
        userSchema.validateAsync(req.body)
      );
      is_no_error(error, BAD_REQUEST);
      const hashed_password = await hashing(user.password);
      await User.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashed_password,
      });
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: TOKEN_AGE * 1000 });
      res.status(CREATED).json();
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const found = await User.findOne({ email });
      if (!found) throw { status: 400, message: "Wrong email or password." };
      const valid_password = await check_password(password, found.password);
      if (!valid_password)
        throw { status: 404, message: "Wrong email or password." };
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },
};

function is_valid_id(id) {
  if (!mongo.isValidObjectId(id))
    throw { status: BAD_REQUEST, message: "ID NOT VALID" };
}

function is_no_error(error, status) {
  if (error) throw { status: status, message: error.toString() };
}

function is_not_founded(data) {
  if (!data) throw { status: NOT_FOUND, message: "NOT FOUND" };
}

function is_founded(data) {
  if (data) throw { status: BAD_REQUEST, message: "EMAIL ALEARDY EXIST" };
}
