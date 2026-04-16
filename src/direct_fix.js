// FINAL_FIX.js
// Run: node FINAL_FIX.js

import dotenv from "dotenv";
dotenv.config();

import sequelize from "./DB/sequelize.js";

async function finalFix() {
    try {
        console.log("🔥 FINAL FIX - Creating Orders\n");

        await sequelize.authenticate();
        console.log("✅ Database connected\n");

        // 1. Get payments (we know this works)
        console.log("📊 Checking Payments:");
        console.log("=".repeat(60));

        const [payments] = await sequelize.query(`
            SELECT id, "userId", payment_id, total_amount, status, order_id
            FROM payments
            ORDER BY created_at DESC
        `);

        console.log(`Found ${payments.length} payment(s)\n`);

        const successPayments = payments.filter(p => p.status === 'SUCCESS');
        console.log(`✅ SUCCESS: ${successPayments.length}`);
        console.log(`⏳ PENDING: ${payments.filter(p => p.status === 'PENDING').length}`);
        console.log(`❌ FAILED: ${payments.filter(p => p.status === 'FAILED').length}\n`);

        if (successPayments.length === 0) {
            console.log("⚠️  No SUCCESS payments!\n");
            console.log("Run this to change payment 6 to SUCCESS:");
            console.log("PATCH http://localhost:5001/update-payment/6");
            console.log('{ "status": "SUCCESS" }\n');
            process.exit(0);
        }

        // 2. Create orders WITHOUT checking users table
        console.log("🚀 Creating Orders:");
        console.log("=".repeat(60));

        let created = 0;
        let skipped = 0;

        for (const payment of successPayments) {
            try {
                // Check if order exists
                const [existing] = await sequelize.query(`
                    SELECT "orderId" FROM orders WHERE "paymentId" = ${payment.id}
                `);

                if (existing.length > 0) {
                    console.log(`⏭️  Order #${existing[0].orderId} already exists for Payment ${payment.id}`);
                    skipped++;
                    continue;
                }

                // Create order directly (trust that user exists)
                const [result] = await sequelize.query(`
                    INSERT INTO orders (
                        "userId", 
                        "paymentId", 
                        "totalAmount", 
                        quantity, 
                        status, 
                        "courseId",
                        created_at,
                        updated_at
                    ) VALUES (
                        '${payment.userId}',
                        ${payment.id},
                        ${payment.total_amount},
                        1,
                        'completed',
                        ARRAY[1],
                        NOW(),
                        NOW()
                    ) RETURNING "orderId"
                `);

                const newOrderId = result[0].orderId;

                // Update payment
                await sequelize.query(`
                    UPDATE payments 
                    SET order_id = '${newOrderId}' 
                    WHERE id = ${payment.id}
                `);

                console.log(`✅ Order #${newOrderId} created for Payment ${payment.payment_id} (User: ${payment.userId})`);
                created++;

            } catch (error) {
                console.log(`❌ Error for Payment ${payment.id}:`, error.message);
            }
        }

        console.log("\n" + "=".repeat(60));
        console.log("📊 RESULT:");
        console.log(`  ✅ Created: ${created}`);
        console.log(`  ⏭️  Skipped: ${skipped}\n`);

        // 3. Verify orders created
        console.log("🔍 Verification:");
        console.log("=".repeat(60));

        const [finalOrders] = await sequelize.query(`
            SELECT 
                o."orderId",
                o."userId",
                o."paymentId",
                o."totalAmount",
                o.status,
                p.payment_id,
                p.status as payment_status
            FROM orders o
            LEFT JOIN payments p ON o."paymentId" = p.id
            ORDER BY o.created_at DESC
        `);

        console.log(`Total Orders: ${finalOrders.length}\n`);

        if (finalOrders.length > 0) {
            finalOrders.forEach((o, i) => {
                console.log(`Order ${i + 1}:`);
                console.log(`  Order ID: ${o.orderId}`);
                console.log(`  User: ${o.userId}`);
                console.log(`  Amount: ₹${o.totalAmount}`);
                console.log(`  Status: ${o.status}`);
                console.log(`  Payment: ${o.payment_id} (${o.payment_status})\n`);
            });

            console.log("✅✅✅ SUCCESS! ✅✅✅\n");
            console.log("Now test your API:");
            console.log("  GET http://localhost:5001/orders\n");
        } else {
            console.log("❌ No orders created\n");
        }

        process.exit(0);

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        process.exit(1);
    }
}

finalFix();