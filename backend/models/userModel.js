import mongoose from "mongoose";

const bookingDetailSchema = new mongoose.Schema({
  eventDetails: {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    bookedHours: [String],
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    profilePicture: {
      type: String,
      default: "/img/noAvatar.png",
    },
    oAuthId: {
      type: String,
      default: null,
    },
    oAuth: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: null,
    },
    googleAccessToken: {
      type: String,
      default: null,
    },
    googleRefreshToken: {
      type: String,
      default: null,
    },
    zoomAccessToken: {
      type: String,
      default: null,
    },
    zoomRefreshToken: {
      type: String,
      default: null,
    },
    googleScopes: {
      type: String,
      default: null,
    },
    zoomScopes: {
      type: String,
      default: null,
    },
    timeZonesToShow: {
      type: String,
      default: null,
    },
    homeTimeZone: {
      type: String,
      default: null,
    },
    // UPDATE 2 *********************************************************
    bookingDetails: [
      {
        // type: [bookingDetailSchema]

        eventDetails: {
          eventId: {
            type: mongoose.Schema.Types.ObjectId,
          },
          bookedHours: [String],
        },
      },
    ],
    zoomData: {
      zoomUserId: String,
      zoomUserAccountId: String,
      accessTokenTime: String,
    },

    is_admin: {
      type: Number,
      default: 0,
    },
    // UPDATE 2 END *********************************************************
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
