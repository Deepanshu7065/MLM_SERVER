// import { Router } from "express";
// import Order from "../../Modal/order.js";

// const getSingleOrder = Router();

// getSingleOrder.get("/:id", async (req, res) => {
//     try {
//         console.log("🔍 Fetching orders...");
//         const order = await Order.findOne({
//             where: { id: req.params.id },
//             logging: console.log
//         });
//         console.log("📋 Found orders:", order.length, order);
//         res.status(200).json({ order });
//     } catch (error) {
//         console.error("❌ Order fetch error:", error);
//         res.status(500).json({ error: "Internal server error." });
//     }
// })

// export default getSingleOrder




import { Router } from "express";
import Order from "../../Modal/order.js";

const getSingleOrder = Router();

getSingleOrder.get("/:id", async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id },
            logging: console.log
        });
        res.status(200).json({ order });
    } catch (error) {
        console.error("❌ Order fetch error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
})

export default getSingleOrder   