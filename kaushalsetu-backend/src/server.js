import dns from "dns";

// MongoDB SRV DNS fix
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import notificationRoutes from "./routes/notifications.js";
import bookingRoutes from "./routes/bookings.js";

// app.use("/api/bookings", bookingRoutes);
// app.use("/api/notifications", notificationRoutes);
const port = process.env.PORT || 5001;
connectDB()
  .then(() =>
   app.listen(port, "0.0.0.0", () =>
  console.log(`KaushalSetu API running on port ${port}`)
)
  )
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });
// import providerRoutes from "./routes/providers.js";
// app.use("/providers", providerRoutes);
