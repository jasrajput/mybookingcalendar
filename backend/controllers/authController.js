import bcrypt from "bcryptjs";
import { google } from "googleapis";
import cookie from "cookie";
import User from "../models/userModel.js";
import generateToken from "../utils/tokenGenerator.js";
import axios from "axios";
import { DateTime } from "luxon";

// @desc        create a new user
// @route       POST /api/auth
// @access      public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userFound = await User.findOne({ email });

    if (userFound) {
      res.status(403);
      throw new Error("Email id already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
      const { _id, name, email, timeZonesToShow, homeTimeZone } = user;
      res.status(201).json({
        user: { id: _id, name, email, timeZonesToShow, homeTimeZone },
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc        login a user
// @route       POST /api/auth/login
// @access      public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (passwordMatched) {
      const { _id, name, email, timeZonesToShow, homeTimeZone } = user;
      res.status(200).json({
        user: { id: _id, name, email, timeZonesToShow, homeTimeZone },
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Password do not match" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    get user data
// @route   GET /api/auth/me
// @access  private
export const getUser = async (req, res, next) => {
  try {
    const {
      _id,
      name,
      email,
      googleScopes,
      zoomScopes,
      timeZonesToShow,
      homeTimeZone,
      is_admin,
    } = await User.findById(req.user.id);
    res.status(200).json({
      user: {
        id: _id,
        name,
        email,
        googleScopes,
        zoomScopes,
        timeZonesToShow,
        homeTimeZone,
        is_admin,
      },
      token: generateToken(_id),
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE 2 ********************************************************
// @desc    get all users
// @route   GET /api/auth/
// @access  private
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find({});
    res
      .status(200)
      .json({ users: allUsers, token: generateToken(req.user._id) });
  } catch (error) {
    next(error);
  }
};
// UPDATE 2 END********************************************************

// @desc    connect user with zoom
// @route   POST /api/auth/create-tokens
// @access  private
export const getTokens = async (req, res, next) => {
  try {
    const { code } = req.body;

    const response = await axios.post("https://zoom.us/oauth/token", null, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.ZOOM_API_CLIENT_ID +
            ":" +
            process.env.ZOOM_API_CLIENT_SECRET
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.ZOOM_API_REDIRECT_URL,
      },
    });

    // UPDATE 2 **********************************************************************
    // getting the zoom user details, for use in the deauthorization endpoint
    const userRes = await axios.get("https://api.zoom.us/v2/users/me", {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    });
    // UPDATE 2 END **********************************************************************

    const userUpdated = await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          zoomAccessToken: response.data.access_token,
          zoomRefreshToken: response.data.refresh_token,
          zoomScopes: response.data.scope,
          zoomData: {
            zoomUserId: userRes.data.id,
            zoomUserAccountId: userRes.data.account_id,
            accessTokenTime: DateTime.now().toISO(),
          },
        },
      }
    );

    if (userUpdated) {
      res.status(200).json({
        message: "User updated successfully",
        token: generateToken(req.user._id),
      });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    // set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", generateToken(req.user._id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "strict",
        path: "/",
      })
    );

    res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    next(error);
  }
};

// REVISION 1 ****************************************************
// @desc    updates the time zones to show in the UI
// @route   PUT /api/auth/time-zone
// @access  private
export const editTimeZone = async (req, res, next) => {
  try {
    const { timeZonesToShow } = req.body;
    const updatedUser = await User.updateOne(
      { _id: req.user._id },
      { $set: { timeZonesToShow: JSON.stringify(timeZonesToShow) } }
    );

    if (updatedUser) {
      res.status(200).json({
        message: "Time zones updated",
        token: generateToken(req.user._id),
      });
    } else {
      res.status(500).json({ message: "Unable to update user time zones" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    updates the home time zones in DB
// @route   PUT /api/auth/home-time-zone
// @access  private
export const saveHomeTimeZone = async (req, res, next) => {
  try {
    const { homeTimeZone } = req.body;
    const updatedUser = await User.updateOne(
      { _id: req.user._id },
      { $set: { homeTimeZone: homeTimeZone } }
    );

    if (updatedUser) {
      res.status(200).json({
        message: "Home time zone updated",
        token: generateToken(req.user._id),
      });
    } else {
      res.status(500).json({ message: "Unable to update user home time zone" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    disconnects the account in DB
// @route   PUT /api/auth/disconnect
// @access  private
export const disconnectAccount = async (req, res, next) => {
  try {
    const accountToDisconnect = req.query.account;

    if (accountToDisconnect === "google") {
      const user = await User.findById(req.user._id);

      const newGoogleScopes = user.googleScopes
        .split(" ")
        .filter((scope) => !scope.includes("calendar"))
        .join(" ");

      const updatedUser = await User.updateOne(
        { _id: req.user._id },
        { $set: { googleScopes: newGoogleScopes } }
      );

      if (updatedUser) {
        res.status(200).json({
          message: "Google calendar disconnected",
          token: generateToken(req.user._id),
        });
      } else {
        res
          .status(500)
          .json({ message: "Unable to disconnect google calendar" });
      }
    } else if (accountToDisconnect === "zoom") {
      const updatedUser = await User.updateOne(
        { _id: req.user._id },
        { $set: { zoomScopes: null } }
      );

      if (updatedUser) {
        res.status(200).json({
          message: "Zoom disconnected",
          token: generateToken(req.user._id),
        });
      } else {
        res.status(500).json({ message: "Unable to disconnect zoom" });
      }
    }
  } catch (error) {
    next(error);
  }
};
// REVISION 1 END ****************************************************

// @desc        deauthorizes the app from zoom
// @route       POST /api/auth/zoom/deauthorize
// @access      public
export const zoomDeauthorize = async (req, res, next) => {
  try {
    // checking if the req came from zoom or not
    if (req.headers.authorization === process.env.ZOOM_API_VERIFICATION_TOKEN) {
      const { user_id } = req.body.payload;

      await User.updateOne(
        { zoomData: { zoomUserId: user_id } },
        { $set: { zoomScopes: "" } }
      );

      res.status(200).end();
    }
  } catch (error) {
    next(error);
  }
};
