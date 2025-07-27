import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"))

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "TuteDude Hackathon Backend API", 
    status: "Running",
    endpoints: [
      "POST /api/auth/register - User registration",
      "POST /api/auth/login - User login", 
      "GET /api/inventory - Get products",
      "POST /api/inventory - Create product",
      "GET /api/orders - Get orders",
      "POST /api/orders - Create order",
      "GET /api/suppliers - Get suppliers",
      "POST /api/suppliers - Create supplier"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});


//routing
import userRoutes from "./routes/user.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";

app.use("/api/user", userRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/product", productRoutes);

// Frontend compatibility aliases
app.use("/api/auth", userRoutes); // Alias for /api/user routes
app.use("/api/inventory", productRoutes); // Alias for /api/product routes  
app.use("/api/orders", orderRoutes); // Alias for /api/order routes
app.use("/api/suppliers", sellerRoutes); // Alias for /api/seller routes

export { app };
