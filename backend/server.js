import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import timeZoneRoutes from "./routes/timeZoneRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

// ***** INITIALIZATIONS ******
dotenv.config();
connectDB();
const app = express();
app.use(express.json());

// ***** Passport config ******
import passportEngine from "./config/passport.js";
passportEngine(passport);

// ******** SECURITY MIDDLEWARES ********
// setting origin for CORS policy
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

// initializing helmet middleware
app.use(helmet());

// preventing hyper parameter pollution using hpp middleware
app.use(hpp());

// preventing cross site scripting attacks using xss-clean middleware
app.use(xssClean());

// sanitizing mongoDB queries
app.use(mongoSanitize());

// ***** ROUTES *****
// time zone route
app.use("/api/timeZone", timeZoneRoutes);

// auth route
app.use("/api/auth", authRoutes);

// calendar route
app.use("/api/calendar", calendarRoutes);

// event route
app.use("/api/events", eventRoutes);

// team route
app.use("/api/team", teamRoutes);

// support route
app.use("/api/support", supportRoutes);

// chat route
app.use("/api/chat", chatRoutes);

// ***** ERROR HANDLING MIDDLEWARES *****
// 404 not found
app.use(notFound);

// error handler middleware
app.use(errorHandler);

// ***** SERVER SETUP ******
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
