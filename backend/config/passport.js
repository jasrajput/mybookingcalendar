import passportGoogle from "passport-google-oauth20";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

const GoogleStrategy = passportGoogle.Strategy;

export default (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
        scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
      },
      // below callback function will be called after the user has given the consent to share its profile details
      // this is called when the redirect/callback url is authenticating with google again using passport middleware
      async (accessToken, refreshToken, scopes, profile, done) => {
        const newUser = {
          name: profile.name.givenName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          oAuthId: profile.id,
          oAuth: true,
          provider: profile.provider,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          googleScopes: scopes.scope,
          is_admin: 0,
        };

        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // if user is registered with oAuth
            if (user.oAuth) {
              // updating access and refresh tokens if expired or new permission granted
              await User.updateOne({ _id: user._id }, { $set: newUser });
              done(null, user);
              // if user is found but not registered with oAuth, rather registered with simple email and password
              // in this case, update the user to oAuth user
            } else {
              user = await User.updateOne({ _id: user._id }, { $set: newUser });
              done(null, user);
            }
            // if the user is logging in first time, then create the new user
          } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(uuidv4(), salt);

            user = await User.create({ ...newUser, password: hashedPassword });
            done(null, user);
          }
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
};
