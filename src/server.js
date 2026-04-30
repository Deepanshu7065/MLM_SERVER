// // src/server.js

// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import "./Modal/index.js";
// import sendCode from "./Router/EmailVerify/sendEmail.js";
// import verifyCode from "./Router/EmailVerify/verifyEmail.js";
// import createUser from "./Router/User/createUser.js";
// import users from "./Router/User/users.js";
// import verifyPassword from "./Router/User/verifyPassword.js";
// import user from "./Router/User/$user.js";
// import sequelize from "./DB/sequelize.js";
// import forgetSendOtp from "./Router/EmailForget/forgetSendOtp.js";
// import verifyForgetOtp from "./Router/EmailForget/verifyForgetOtp.js";
// import updatePassword from "./Router/EmailForget/updatePassword.js";
// import courses from "./Router/Courses/courses.js";
// import createCourses from "./Router/Courses/createCourses.js";
// import manageCourses from "./Router/Courses/manageCourses.js";
// import myUsers from "./Router/my-users/index.js";
// import User from "./Modal/User.modal.js";
// import getCourseById from "./Router/Courses/coursesId.js";
// import cartRouter from "./Router/Cart/cart.js";
// import checkoutRouter from "./Router/Payment/checkout.js";
// import myCoursesRouter from "./Router/UserCourses/myCourses.js";
// import createCart from "./Router/Cart/cartCreate.js";
// import deleteCart from "./Router/Cart/deleteCart.js";
// import createOrder from "./Router/Order/createOrder.js";
// import getOrder from "./Router/Order/getOrder.js";
// import getSingleOrder from "./Router/Order/getSingleOrder.js";
// import getUserPayment from "./Router/Payment/getUserPyement.js";
// import getPayment from "./Router/Payment/getPayment.js";
// import allUser from "./Router/User/alluser.js";
// import { seedAdmin } from "../utils/seedAdmin.js";
// import changePaymentStatus from "./Router/Payment/changePaymentStatus.js";
// import getUserOrder from "./Router/Order/getUserOrder.js";
// import userStats from "./Router/User/stats.js";


// const app = express();
// app.disable("x-powered-by");

// app.use((req, res, next) => {
//   console.log(`🔥 ${new Date().toISOString()} | ${req.method} ${req.url}`);
//   console.log(`   Headers:`, req.headers);
//   next();
// });

// app.use(cors({
//   origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:5001"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use('/upload', express.static('upload'));

// app.get("/", (req, res) => res.send("Server is running ✅"));

// app.use("/send-code", sendCode);
// app.use("/verify-code", verifyCode);
// app.use("/create-user", createUser);
// app.use("/users", users);
// app.use("/user", user);
// app.use("/forget-send-code", forgetSendOtp);
// app.use("/forget-verify-code", verifyForgetOtp);
// app.use("/update-password", updatePassword);
// app.use("/verify-password", verifyPassword);
// app.use("/courses", courses);
// app.use("/single-course", getCourseById);
// app.use("/create_course", createCourses);
// app.use("/manage_course", manageCourses);
// app.use("/cart", cartRouter);
// app.use("/add-cart", createCart);
// app.use("/remove-cart", deleteCart);
// app.use("/checkout", checkoutRouter);
// app.use("/get-payment", getPayment)
// app.use("/get-user-payment", getUserPayment)
// app.use("/my-courses", myCoursesRouter);
// app.use("/create-order", createOrder);
// app.use("/orders", getOrder);
// app.use("/single-order", getSingleOrder);
// app.use("/user-order", getUserOrder);
// app.use("/update-payment", changePaymentStatus)
// app.use("/my-earnings", userStats)

// app.use("/all-users", allUser)

// app.use("/my-users", myUsers);

// app.get("/debug-users", async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ['id', 'userId', 'name', 'email', 'referalCode', 'parent_code', 'ref_by_id'],
//       raw: true
//     });

//     res.json({
//       totalUsers: users.length,
//       users: users
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.url} not found`,
//   });
// });


// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION:", err);
// });

// process.on("unhandledRejection", (reason) => {
//   console.error("UNHANDLED REJECTION:", reason);
// });
// async function startServer() {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync({ alter: true });
//     await seedAdmin();

//     app.listen(process.env.PORT, () => {
//       console.log(`🚀 Server running on ${process.env.PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Startup failed", err);
//     process.exit(1);
//   }
// }

// startServer();


//  after 
// // src/server.js

// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import "./Modal/index.js";
// import sendCode from "./Router/EmailVerify/sendEmail.js";
// import verifyCode from "./Router/EmailVerify/verifyEmail.js";
// import createUser from "./Router/User/createUser.js";
// import users from "./Router/User/users.js";
// import verifyPassword from "./Router/User/verifyPassword.js";
// import user from "./Router/User/$user.js";
// import sequelize from "./DB/sequelize.js";
// import forgetSendOtp from "./Router/EmailForget/forgetSendOtp.js";
// import verifyForgetOtp from "./Router/EmailForget/verifyForgetOtp.js";
// import updatePassword from "./Router/EmailForget/updatePassword.js";
// import courses from "./Router/Courses/courses.js";
// import createCourses from "./Router/Courses/createCourses.js";
// import manageCourses from "./Router/Courses/manageCourses.js";
// import myUsers from "./Router/my-users/index.js";
// import User from "./Modal/User.modal.js";
// import getCourseById from "./Router/Courses/coursesId.js";
// import cartRouter from "./Router/Cart/cart.js";
// import checkoutRouter from "./Router/Payment/checkout.js";
// import myCoursesRouter from "./Router/UserCourses/myCourses.js";
// import createCart from "./Router/Cart/cartCreate.js";
// import deleteCart from "./Router/Cart/deleteCart.js";
// import createOrder from "./Router/Order/createOrder.js";
// import getOrder from "./Router/Order/getOrder.js";
// import getSingleOrder from "./Router/Order/getSingleOrder.js";
// import getUserPayment from "./Router/Payment/getUserPyement.js";
// import getPayment from "./Router/Payment/getPayment.js";
// import allUser from "./Router/User/alluser.js";
// import { seedAdmin } from "../utils/seedAdmin.js";
// import changePaymentStatus from "./Router/Payment/changePaymentStatus.js";
// import getUserOrder from "./Router/Order/getUserOrder.js";
// import walletRouter from "./Router/Wallet/wallet.js";
// import adminWalletRouter from "./Router/User/adminWallet.js";
// import getAllTickets from "./Router/Contact/getAllTickets.js";
// import updateTicketStatus from "./Router/Contact/updateTicket.js";
// import ticketChat from "./Router/Contact/ticketChat.js";
// import ticketChatPost from "./Router/Contact/ticketChatPost.js";
// import createTickets from "./Router/Contact/createTicket.js";
// import userTickets from "./Router/Contact/userTicket.js";


// const app = express();
// app.disable("x-powered-by");

// app.use((req, res, next) => {
//   console.log(`🔥 ${new Date().toISOString()} | ${req.method} ${req.url}`);
//   console.log(`   Headers:`, req.headers);
//   next();
// });

// // app.use(cors({
// //   origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:5001"],
// //   credentials: true,
// //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// //   allowedHeaders: ["Content-Type", "Authorization"],
// // }));


// app.use(cors({
//   origin: true,
//   credentials: true
// }));

// app.use(express.json({ limit: "1mb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use('/upload', express.static('upload'));

// app.get("/", (req, res) => res.send("Server is running ✅"));

// app.use("/send-code", sendCode);
// app.use("/verify-code", verifyCode);
// app.use("/create-user", createUser);
// app.use("/users", users);
// app.use("/user", user);
// app.use("/forget-send-code", forgetSendOtp);
// app.use("/forget-verify-code", verifyForgetOtp);
// app.use("/update-password", updatePassword);
// app.use("/verify-password", verifyPassword);
// app.use("/courses", courses);
// app.use("/single-course", getCourseById);
// app.use("/create_course", createCourses);
// app.use("/manage_course", manageCourses);
// app.use("/cart", cartRouter);
// app.use("/add-cart", createCart);
// app.use("/remove-cart", deleteCart);
// app.use("/checkout", checkoutRouter);
// app.use("/get-payment", getPayment)
// app.use("/get-user-payment", getUserPayment)
// app.use("/my-courses", myCoursesRouter);
// app.use("/create-order", createOrder);
// app.use("/orders", getOrder);
// app.use("/user-order", getUserOrder);
// app.use("/single-order", getSingleOrder);
// app.use("/update-payment", changePaymentStatus)
// app.use("/wallet", walletRouter);
// app.use("/admin", adminWalletRouter);

// app.use("/all-tickets", getAllTickets)
// app.use("/tickets/status", updateTicketStatus)
// app.use("/tickets/chat", ticketChat)
// app.use("/tickets/chat/send", ticketChatPost)
// app.use("/tickets/create", createTickets)
// app.use("/user-ticket", userTickets)

// app.use("/all-users", allUser)

// app.use("/my-users", myUsers);

// app.get("/debug-users", async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ['id', 'userId', 'name', 'email', 'referalCode', 'parent_code', 'ref_by_id'],
//       raw: true
//     });

//     res.json({
//       totalUsers: users.length,
//       users: users
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.url} not found`,
//   });
// });


// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION:", err);
// });

// process.on("unhandledRejection", (reason) => {
//   console.error("UNHANDLED REJECTION:", reason);
// });
// async function startServer() {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync({ alter: true });
//     await seedAdmin();

//     app.listen(process.env.PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on ${process.env.PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Startup failed", err);
//     process.exit(1);
//   }
// }

// startServer();


import 'dotenv/config'
// import dotenv from "dotenv";

// dotenv.config({
//   path: ".env.local"
// });

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import "./Modal/index.js";
import sequelize from "./DB/sequelize.js";
import { seedAdmin } from "../utils/seedAdmin.js";

// Routes Imports
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
import User from "./Modal/User.modal.js";
import getCourseById from "./Router/Courses/coursesId.js";
import cartRouter from "./Router/Cart/cart.js";
import checkoutRouter from "./Router/Payment/checkout.js";
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

const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: "https://dm-advancetech.com",
    methods: ["GET", "POST"]
  }
});

app.disable("x-powered-by");

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use('/upload', express.static('upload'));

io.on("connection", (socket) => {
  console.log(`📡 New Socket Connection: ${socket.id}`);

  socket.on("join_ticket", (ticketId) => {
    socket.join(ticketId);
    console.log(`👥 User joined room: ${ticketId}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.ticket_id).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket Disconnected");
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes


app.get("/", (req, res) => res.send("Server is running with Socket.io ✅"));
app.use("/payment-webhook", webhookPayment);
app.use("/send-code", sendCode);
app.use("/verify-code", verifyCode);
app.use("/create-user", createUser);
app.use("/users", users);
app.use("/user", user);
app.use("/forget-send-code", forgetSendOtp);
app.use("/forget-verify-code", verifyForgetOtp);
app.use("/update-password", updatePassword);
app.use("/verify-password", verifyPassword);
app.use("/courses", courses);
app.use("/single-course", getCourseById);
app.use("/create_course", createCourses);
app.use("/manage_course", manageCourses);
app.use("/cart", cartRouter);
app.use("/add-cart", createCart);
app.use("/remove-cart", deleteCart);
app.use("/checkout", checkoutRouter);
// app.use("/get-payment", getPayment);
// app.use("/get-user-payment", getUserPayment);
app.use("/my-courses", myCoursesRouter);
app.use("/create-order", createOrder);
app.use("/checkout", checkoutRouter);
app.use("/payment/verify", verifyPayment);
app.use("/get-payment", getPayment);
app.use("/get-user-payment", getUserPayment);
// app.use("/orders", getOrder);
// app.use("/user-order", getUserOrder);
app.use("/orders", getOrder);
app.use("/user-order", getUserOrder);
app.use("/single-order", getSingleOrder);
app.use("/update-payment", changePaymentStatus);
app.use("/wallet", walletRouter);
app.use("/admin", adminWalletRouter);
app.use("/all-tickets", getAllTickets);
app.use("/tickets/status", updateTicketStatus);
app.use("/tickets/chat", ticketChat);
app.use("/tickets/chat/send", ticketChatPost);
app.use("/tickets/create", createTickets);
app.use("/user-ticket", userTickets);
app.use("/all-users", allUser);
app.use("/my-users", myUsers);

// withdraw
app.use("/history-withdraw-all", withdrawalRouterGet);
app.use("/history-withdraw-my", withdrawalUserRouterGet);
app.use("/request-payment", withdrawalRouterPost);
app.use("/update-withdraw", withdrawalRouterPatch);

// Error Handlers
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedAdmin();
    httpServer.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log(`🚀 Server + Socket running on ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.error("❌ Startup failed", err);
    process.exit(1);
  }
}

startServer();