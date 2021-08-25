const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshToken.model");

const PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRES_IN;

const verify = async (req, res) => {
  const { password } = req.body;
  // console.log(req.body, PASSWORD);
  if (password == PASSWORD) {
    const token = await jwt.sign({ type: "admin" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
    const refreshToken = await jwt.sign({ type: "admin" }, JWT_SECRET);

    //Keeping record of newly created refresh tokens in MongoDB.
    const refreshTokenDB = new RefreshToken({
      refreshToken: refreshToken,
    });
    try {
      await refreshTokenDB.save();
    } catch (err) {
      console.log(err);
    }

    res.status(200).json({ success: true, token, refreshToken });
  } else {
    res.status(400).json({ errors: "Password Incorrect" });
  }
};

const verifyToken = async (req, res, next) => {
  //Retrives the access and refresh token from the request header.
  const token = req.headers["authorization"].split(" ")[1];
  const refreshToken = req.headers["refreshtoken"];

  //Checks that access and refresh tokens exist before jwt verification.
  if (token === null || refreshToken === null) return res.sendStatus(401);
  if ((await RefreshToken.find({ refreshToken: refreshToken })).length !== 1)
    return res.sendStatus(401);

  //Verifies the access token to see if its valid, invalid or expired.
  try {
    await jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        //Access token is either invalid or expired, so use refresh token to verify and send new access token
        jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
          if (err) {
            return res.sendStatus(403);
          } else {
            const newToken = jwt.sign({ type: "admin" }, JWT_SECRET, {
              expiresIn: JWT_EXPIRE,
            });
            return res.json({
              status: "Success",
              expiredToken: true,
              newToken,
            });
          }
        });
      } else {
        return res.json({ status: "Success", expiredToken: false });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const authAdmin = async (req, res, next) => {
  const refreshToken = req.headers["refreshtoken"];
  //Checks that refresh token exists before jwt verification.
  if (refreshToken == null) return res.sendStatus(401);
  if ((await RefreshToken.find({ refreshToken: refreshToken })).length !== 1)
    return res.sendStatus(401);

  //Verifies if the refresh token is valid before providing access to API routes.
  try {
    jwt.verify(refreshToken, JWT_SECRET, (err) => {
      if (err) return res.sendStatus(403);
      next();
    });
  } catch (err) {
    return res.sendStatus(500);
  }
};

const deleteRefreshToken = async (req, res) => {
  const refreshToken = req.headers["refreshtoken"];
  //Removes refresh token from mongoDB to prevent renewal of access tokens.
  await RefreshToken.deleteOne({ refreshToken: refreshToken }, (err) => {
    if (err) return res.sendStatus(403);
    return res.sendStatus(200);
  });
};

module.exports = { verify, verifyToken, authAdmin, deleteRefreshToken };
