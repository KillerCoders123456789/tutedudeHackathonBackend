import cron from "node-cron";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const startOrderCleanupJob = () => {
 // Schedule a job to run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    try {
      const orders = await Order.find({
        createdAt: { $lte: oneHourAgo },
        isDeprecated: false,
      });

      for (const order of orders) {
        if (!order.isDelivered) {
          await Product.findByIdAndUpdate(
            order.productId,
            { $inc: { amountLeft: order.amount } }
          );
        }

        order.isDeprecated = true;
        await order.save();
      }

      console.log(`[CRON] Processed ${orders.length} orders`);
    } catch (error) {
      console.error("[CRON ERROR]:", error.message);
    }
  });
};

export default startOrderCleanupJob;
