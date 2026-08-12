import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import "./Modal/index.js";
import sequelize from "./DB/sequelize.js";
import { seedAdmin } from "../utils/seedAdmin.js";

import sendCode from "./Router/EmailVerify/sendEmail.js";
import verifyCode from "./Router/EmailVerify/verifyEmail.js";
import createUser from "./Router/User/createUser.js";
import users from "./Router/User/users.js";
import verifyPassword from "./Router/User/verifyPassword.js";
import user from "./Router/User/$user.js";
import forgetSendOtp from "./Router/EmailForget/forgetSendOtp.js";
import verifyForgetOtp from "./Router/EmailForget/verifyForgetOtp.js";
import updatePassword from "./Router/EmailForget/updatePassword.js";
import courses from "./Router/Courses/courses.js";
import createCourses from "./Router/Courses/createCourses.js";
import manageCourses from "./Router/Courses/manageCourses.js";
import myUsers from "./Router/my-users/index.js";
import getCourseById from "./Router/Courses/coursesId.js";
import cartRouter from "./Router/Cart/cart.js";
import myCoursesRouter from "./Router/UserCourses/myCourses.js";
import createCart from "./Router/Cart/cartCreate.js";
import deleteCart from "./Router/Cart/deleteCart.js";
import createOrder from "./Router/Order/createOrder.js";
import getOrder from "./Router/Order/getOrder.js";
import getSingleOrder from "./Router/Order/getSingleOrder.js";
import getUserPayment from "./Router/Payment/getUserPyement.js";
import getPayment from "./Router/Payment/getPayment.js";
import allUser from "./Router/User/alluser.js";
import changePaymentStatus from "./Router/Payment/changePaymentStatus.js";
import getUserOrder from "./Router/Order/getUserOrder.js";
import walletRouter from "./Router/Wallet/wallet.js";
import adminWalletRouter from "./Router/User/adminWallet.js";
import getAllTickets from "./Router/Contact/getAllTickets.js";
import updateTicketStatus from "./Router/Contact/updateTicket.js";
import ticketChat from "./Router/Contact/ticketChat.js";
import ticketChatPost from "./Router/Contact/ticketChatPost.js";
import createTickets from "./Router/Contact/createTicket.js";
import userTickets from "./Router/Contact/userTicket.js";
import verifyPayment from "./Router/Payment/verifyPayment.js";
import webhookPayment from "./Router/Payment/webhookPayment.js";
import withdrawalRouterGet from './Router/Withdraw/withdraw.get.js';
import withdrawalRouterPost from './Router/Withdraw/withdraw.post.js';
import withdrawalRouterPatch from './Router/Withdraw/withdraw.patch.js';
import withdrawalUserRouterGet from './Router/Withdraw/withdraw.user.get.js';
import createPayment from './Router/Payment/createPayment.js';
import getOrderForInvoice from './Router/Order/getOrderForInvoice.js';

const app = express();
const httpServer = createServer(app);


const envFrontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(
  new Set([
    ...envFrontendUrls,
    "https://dm-advancetech.com",
    "https://www.dm-advancetech.com",
    "http://100.90.254.6:3110",
    "http://100.90.254.6:5173",
    "http://100.90.254.6:3000",
    "http://localhost:3110",
    "http://localhost:5173",
    "http://192.168.1.24:3110",
    "http://172.22.0.1:3110",
  ])
);


const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});



app.get("/", (_req, res) => {
  res.json({ success: true, message: "Server is running ✅" });
});

const SERVER_START_TIME = new Date().toISOString();

app.get("/health", (_req, res) => {
  const uptimeSec = Math.floor(process.uptime());
  res.status(200).json({
    success: true,
    db: global.isDBReady ? "ready" : "initializing",
    uptime: uptimeSec,
    uptimeFormatted: `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`,
    startedAt: SERVER_START_TIME,
    memory: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString(),
  });
});

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use("/payment-webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use('/upload', express.static('upload'));


const globalLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  skip: (req) => req.path === "/" || req.path === "/health",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try after 15 minutes." },
});

app.use(globalLimiter);


const DB_BYPASS_ROUTES = new Set(["/", "/health", "/payment-webhook"]);

app.use((req, res, next) => {
  if (DB_BYPASS_ROUTES.has(req.path)) return next();
  if (!global.isDBReady) {
    return res.status(503).json({
      success: false,
      message: "Server is starting up, please retry in a few seconds.",
    });
  }
  next();
});

app.use((req, _res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log(`📡 Socket Connected: ${socket.id}`);
  console.log(`   Transport: ${socket.conn.transport.name}`);
  console.log(`   Origin: ${socket.handshake.headers.origin || "none"}`);

  socket.conn.on("upgrade", () => {
    console.log(
      `🔄 Socket Transport Upgraded [${socket.id}]: ${socket.conn.transport.name}`
    );
  });

  socket.on("join_ticket", (ticketId) => {
    socket.join(String(ticketId));
    console.log(`👥 Joined room: ${ticketId}`);
  });

  socket.on("send_message", (data) => {
    if (!data?.ticket_id) return;
    io.to(String(data.ticket_id)).emit("receive_message", data);
  });

  socket.on("disconnect", (reason, details) => {
    console.log(`❌ Socket Disconnected [${socket.id}]`);
    console.log(`   Reason: ${reason}`);

    if (details) {
      console.log(`   Details:`, details);
    }
  });

  socket.on("error", (error) => {
    console.error(`⚠️ Socket Error [${socket.id}]:`, error);
  });
});

app.use("/payment-webhook", webhookPayment);

app.use("/send-code", authLimiter, sendCode);
app.use("/verify-code", authLimiter, verifyCode);
app.use("/create-user", authLimiter, createUser);
app.use("/verify-password", authLimiter, verifyPassword);
app.use("/forget-send-code", authLimiter, forgetSendOtp);
app.use("/forget-verify-code", authLimiter, verifyForgetOtp);
app.use("/update-password", authLimiter, updatePassword);

app.use("/users", users);
app.use("/user", user);
app.use("/all-users", allUser);
app.use("/my-users", myUsers);
app.use("/admin", adminWalletRouter);

app.use("/courses", courses);
app.use("/single-course", getCourseById);
app.use("/create_course", createCourses);
app.use("/manage_course", manageCourses);

app.use("/cart", cartRouter);
app.use("/add-cart", createCart);
app.use("/remove-cart", deleteCart);

app.use("/create-order", createOrder);
app.use("/orders", getOrder);
app.use("/user-order", getUserOrder);
app.use("/single-order", getSingleOrder);
app.use("/invoice", getOrderForInvoice);

app.use("/checkout", createPayment);
app.use("/payment/verify", verifyPayment);
app.use("/get-payment", getPayment);
app.use("/get-user-payment", getUserPayment);
app.use("/update-payment", changePaymentStatus);

app.use("/my-courses", myCoursesRouter);

app.use("/wallet", walletRouter);

app.use("/all-tickets", getAllTickets);
app.use("/tickets/status", updateTicketStatus);
app.use("/tickets/chat", ticketChat);
app.use("/tickets/chat/send", ticketChatPost);
app.use("/tickets/create", createTickets);
app.use("/user-ticket", userTickets);


app.use("/history-withdraw-all", withdrawalRouterGet);
app.use("/history-withdraw-my", withdrawalUserRouterGet);
app.use("/request-payment", withdrawalRouterPost);
app.use("/update-withdraw", withdrawalRouterPatch);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});


app.use((err, req, res, _next) => {
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error("🔥 Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


const MAX_DB_RETRIES = 5;
const DB_RETRY_BASE_MS = 2000;

async function runBackgroundTasks(retryCount = 0) {
  try {
    console.time("1️⃣ DB Auth");
    await sequelize.authenticate();
    global.isDBReady = true;
    console.log("📡 DB Connected ✅");
    console.timeEnd("1️⃣ DB Auth");

    // Sync models (safe — no alter/force in production)
    try {
      await sequelize.sync();
      console.log("📦 Models synced ✅");
    } catch (syncErr) {
      console.error("⚠️  Model sync warning:", syncErr.message);
    }

    // Seed admin user
    try {
      await seedAdmin();
    } catch (_) { /* ignore if already seeded */ }

  } catch (err) {
    console.error(`❌ DB Auth failed (attempt ${retryCount + 1}/${MAX_DB_RETRIES}):`, err.message);
    global.isDBReady = false;
    console.timeEnd("1️⃣ DB Auth");

    if (retryCount < MAX_DB_RETRIES - 1) {
      const delayMs = DB_RETRY_BASE_MS * Math.pow(2, retryCount);
      console.log(`🔄 Retrying DB connection in ${delayMs / 1000}s...`);
      setTimeout(() => runBackgroundTasks(retryCount + 1), delayMs);
    } else {
      console.error("🚫 All DB connection retries exhausted. Server running without DB.");
    }
  }
}

// function startKeepAlive() {
//   const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes — well under Render's 15-min sleep threshold
//   const selfUrl = process.env.SELF_URL || "https://server.dm-advancetech.com/health";

//   import("https").then(({ default: https }) => {
//     const ping = () => {
//       const req = https.get(selfUrl, (res) => {
//         console.log(`🏓 Keep-alive ping → ${selfUrl} [${res.statusCode}]`);
//       });
//       req.on("error", (err) => {
//         console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
//       });
//       req.end();
//     };

//     // First ping after 30s (give server time to fully start), then every 4 minutes
//     setTimeout(() => {
//       ping();
//       setInterval(ping, PING_INTERVAL_MS);
//     }, 30_000);

//     console.log(`🏓 Keep-alive scheduled — pinging every ${PING_INTERVAL_MS / 60000} min`);
//   }).catch(() => {
//     console.warn("⚠️  Keep-alive: https module load failed");
//   });
// }

function startKeepAlive() {
  const PING_INTERVAL_MS = 4 * 60 * 1000;
  const selfUrl = process.env.SELF_URL || "https://server.dm-advancetech.com/health";

  setInterval(async () => {
    try {
      const response = await fetch(selfUrl);
      console.log(`🏓 Keep-alive ping → ${selfUrl} [${response.status}]`);
    } catch (err) {
      console.warn(`⚠️ Keep-alive ping failed: ${err.message}`);
    }
  }, PING_INTERVAL_MS);
}
function gracefulShutdown(signal) {
  console.log(`\n📴 ${signal} received. Shutting down gracefully...`);
  httpServer.close(async () => {
    try {
      await sequelize.close();
      console.log("🗄️  DB connection closed.");
    } catch (_) { }
    console.log("👋 Server closed. Goodbye.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⚠️  Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => console.error("🔥 uncaughtException:", err));
process.on("unhandledRejection", (err) => console.error("🔥 unhandledRejection:", err));

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  runBackgroundTasks();
  startKeepAlive();   // ← WAS MISSING! Keep-alive was defined but never called
});