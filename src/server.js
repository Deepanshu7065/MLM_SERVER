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

// ─── Routes Imports ───────────────────────────────────────────────────────────
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

// ─── App + HTTP Server Setup ──────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ─── CORS Origins ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://dm-advancetech.com",
  "https://www.dm-advancetech.com",
  "http://100.90.254.6:3110",
  "http://100.90.254.6:5173",
  "http://100.90.254.6:3000",
  "http://localhost:3110",
  "http://localhost:5173",
  "http://192.168.1.24:3110",
  "http://172.22.0.1:3110",
];

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// ─── Health / Root — CORS & middleware se PEHLE ──────────────────────────────
// Cron-job.org ping mein koi origin header nahi hota, isliye CORS se bahar rakhna zaroori hai.
// Yeh routes hamesha fast respond karte hain — koi DB dependency nahi.

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Server is running ✅" });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    db: global.isDBReady ? "ready" : "initializing",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ─── Security & Performance Middleware ───────────────────────────────────────
app.disable("x-powered-by");

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      const isProd = process.env.NODE_ENV === "production";
      if (isProd) return callback(new Error("CORS: No origin not allowed in production"));
      return callback(null, true);
    }
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Webhook ke liye raw body — normal routes se pehle lagana zaroori hai
app.use("/payment-webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use('/upload', express.static('upload'));

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  // /health aur / ko global limiter se bahar rakho
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

// ─── DB Ready Guard ───────────────────────────────────────────────────────────
// /health aur / bypass karo — warna keep-alive ping bhi block ho jaega
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

// ─── Inject Socket.IO into Requests ──────────────────────────────────────────
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Socket.IO Events ────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`📡 Socket Connected: ${socket.id}`);

  socket.on("join_ticket", (ticketId) => {
    socket.join(String(ticketId));
    console.log(`👥 Joined room: ${ticketId}`);
  });

  socket.on("send_message", (data) => {
    if (!data?.ticket_id) return;
    io.to(String(data.ticket_id)).emit("receive_message", data);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket Disconnected [${socket.id}]: ${reason}`);
  });

  socket.on("error", (err) => {
    console.error(`⚠️  Socket Error [${socket.id}]:`, err.message);
  });
});

// ─── Webhook Route ────────────────────────────────────────────────────────────
app.use("/payment-webhook", webhookPayment);

// ─── Auth Routes (strict limiter) ────────────────────────────────────────────
app.use("/send-code",          authLimiter, sendCode);
app.use("/verify-code",        authLimiter, verifyCode);
app.use("/create-user",        authLimiter, createUser);
app.use("/verify-password",    authLimiter, verifyPassword);
app.use("/forget-send-code",   authLimiter, forgetSendOtp);
app.use("/forget-verify-code", authLimiter, verifyForgetOtp);
app.use("/update-password",    authLimiter, updatePassword);

// ─── User Routes ──────────────────────────────────────────────────────────────
app.use("/users",     users);
app.use("/user",      user);
app.use("/all-users", allUser);
app.use("/my-users",  myUsers);
app.use("/admin",     adminWalletRouter);

// ─── Course Routes ────────────────────────────────────────────────────────────
app.use("/courses",       courses);
app.use("/single-course", getCourseById);
app.use("/create_course", createCourses);
app.use("/manage_course", manageCourses);

// ─── Cart Routes ──────────────────────────────────────────────────────────────
app.use("/cart",        cartRouter);
app.use("/add-cart",    createCart);
app.use("/remove-cart", deleteCart);

// ─── Order Routes ─────────────────────────────────────────────────────────────
app.use("/create-order", createOrder);
app.use("/orders",       getOrder);
app.use("/user-order",   getUserOrder);
app.use("/single-order", getSingleOrder);
app.use("/invoice",      getOrderForInvoice);

// ─── Payment Routes ───────────────────────────────────────────────────────────
app.use("/checkout",        createPayment);
app.use("/payment/verify",  verifyPayment);
app.use("/get-payment",     getPayment);
app.use("/get-user-payment", getUserPayment);
app.use("/update-payment",  changePaymentStatus);

// ─── My Courses ───────────────────────────────────────────────────────────────
app.use("/my-courses", myCoursesRouter);

// ─── Wallet ───────────────────────────────────────────────────────────────────
app.use("/wallet", walletRouter);

// ─── Support Tickets ──────────────────────────────────────────────────────────
app.use("/all-tickets",       getAllTickets);
app.use("/tickets/status",    updateTicketStatus);
app.use("/tickets/chat",      ticketChat);
app.use("/tickets/chat/send", ticketChatPost);
app.use("/tickets/create",    createTickets);
app.use("/user-ticket",       userTickets);

// ─── Withdraw ─────────────────────────────────────────────────────────────────
app.use("/history-withdraw-all", withdrawalRouterGet);
app.use("/history-withdraw-my",  withdrawalUserRouterGet);
app.use("/request-payment",      withdrawalRouterPost);
app.use("/update-withdraw",      withdrawalRouterPatch);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
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

// ─── DB Init + Seed ───────────────────────────────────────────────────────────
async function runBackgroundTasks(retryCount = 0) {
  const MAX_RETRIES = 10;
  try {
    console.time("1️⃣  DB Auth");
    await sequelize.authenticate();
    console.timeEnd("1️⃣  DB Auth");
    console.log("📡 DB Connected ✅");

    console.time("2️⃣  DB Sync");
    const isDev = process.env.NODE_ENV !== "production";

    // 🔑 KEY FIX: Production mein alter:false — yeh 26s+ ki delay khatam karta hai
    // alter:true sirf development mein use karo
    await sequelize.sync({ alter: isDev, force: false });
    console.timeEnd("2️⃣  DB Sync");

    console.time("3️⃣  Admin Seed");
    await seedAdmin();
    console.timeEnd("3️⃣  Admin Seed");

    global.isDBReady = true;
    console.log("🟢 DB + Seed Ready — Server fully operational ✅");

    // ─── Self Keep-Alive Ping ─────────────────────────────────────────────
    // Render Free Tier 15 min mein sleep karta hai.
    // Yeh internal ping SIRF server ko awake rakhta hai jab external ping
    // (UptimeRobot/cron-job.org) kisi wajah se miss ho jaaye.
    // ASLI SOLUTION: cron-job.org se https://dm-advancetech.com/health
    // har 10-12 min pe ping lagao — woh zyada reliable hai.
    if (process.env.NODE_ENV === "production") {
      startKeepAlive();
    }

  } catch (error) {
    console.error(`❌ Background Task Error (attempt ${retryCount + 1}):`, error.message);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(2 ** retryCount * 1000, 30000); // exponential backoff, max 30s
      console.log(`🔄 Retrying in ${delay / 1000}s...`);
      setTimeout(() => runBackgroundTasks(retryCount + 1), delay);
    } else {
      console.error("💀 Max retries reached. DB never connected. Exiting.");
      process.exit(1);
    }
  }
}

// ─── Keep-Alive: Internal Self-Ping ──────────────────────────────────────────
// Render Free Tier 15 min inactivity ke baad server ko sleep mein dalta hai.
// Yeh function server ko khud ping karta hai taaki sleep na ho.
// Lekin SABSE RELIABLE tarika hai baahri cron (cron-job.org) se ping karna.
function startKeepAlive() {
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  const selfUrl = process.env.SELF_URL || "https://dm-advancetech.com/health";

  // Dynamic import taaki startup time affect na ho
  import("https").then(({ default: https }) => {
    const ping = () => {
      const req = https.get(selfUrl, (res) => {
        console.log(`🏓 Keep-alive ping → ${selfUrl} [${res.statusCode}]`);
      });
      req.on("error", (err) => {
        console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
      });
      req.end();
    };

    // Pehli baar 1 min baad ping karo (startup settle hone do)
    setTimeout(() => {
      ping();
      setInterval(ping, PING_INTERVAL_MS);
    }, 60_000);

    console.log(`🏓 Keep-alive started — pinging every ${PING_INTERVAL_MS / 60000} min`);
  }).catch(() => {
    // https module nahi mila (unlikely in Node) — silently fail
    console.warn("⚠️  Keep-alive: https module load failed");
  });
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
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

  // 10 sec ke baad force exit
  setTimeout(() => {
    console.error("⚠️  Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

process.on("uncaughtException",  (err) => console.error("🔥 uncaughtException:", err));
process.on("unhandledRejection", (err) => console.error("🔥 unhandledRejection:", err));

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  // DB init background mein — server turant requests accept karna shuru karta hai
  runBackgroundTasks();
});