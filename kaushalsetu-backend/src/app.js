import express from "express";
import cors from "cors";

import auth from "./routes/auth.js";
import services from "./routes/services.js";
import providers from "./routes/providers.js";
import bookings from "./routes/bookings.js";
import notifications from "./routes/notifications.js";
import community from "./routes/community.js";
import reviews from "./routes/reviews.js";
import payments from "./routes/payments.js";

import {
  notFound,
  errorHandler,
} from "./middleware/error.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL?.split(",") || true,
    credentials: true,
  })
);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "KaushalSetu API",
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", auth);

app.use("/api/services", services);

app.use("/api/providers", providers);

app.use("/api/bookings", bookings);

app.use("/api/notifications", notifications);

app.use("/api/community", community);

app.use("/api/reviews", reviews);

app.use("/api/payments", payments);

/*
|--------------------------------------------------------------------------
| Error handling
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

export default app;