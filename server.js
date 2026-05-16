import exp from "express";
import { connect } from "mongoose";
import { empRoute } from "./API/empApp.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = exp();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const MONGODB_URI = process.env.MONGODB_URI || (
  process.env.NODE_ENV === "development"
    ? "mongodb://127.0.0.1:27017/empdb"
    : undefined
);

if (!MONGODB_URI) {
  console.error(
    "Missing required environment variable MONGODB_URI. Set it in Render or your deployment environment."
  );
  process.exit(1);
}

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// add cors middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  }),
);

// body parser middleware
app.use(exp.json());
// emp api middleware
app.use("/emp-api", empRoute);

// DB connection
const connectDB = async () => {
  try {
    await connect(MONGODB_URI);
    console.log("DB connected");
    app.listen(PORT, () => console.log(`server listening on port ${PORT}..`));
  } catch (err) {
    console.error("err in DB connection", err);
    process.exit(1);
  }
};

connectDB();

// error handling middleware
app.use((err, req, res, next) => {
  console.error("err in middleware:", err.message);

  res.status(err.status || 500).json({
    message: "error",
    reason: err.message,
  });
});