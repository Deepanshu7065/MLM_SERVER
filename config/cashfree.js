// src/config/cashfree.js
import { Cashfree, CFEnvironment } from "cashfree-pg";

// ✅ Latest version mein new Cashfree() instance banata hai
const cashfreeInstance = new Cashfree(
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

export { cashfreeInstance as Cashfree };