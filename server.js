// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./database/connect.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import blogRoutes from "./routes/blogRoutes.js";
// import path from "path";
// import { fileURLToPath } from "url";

// // Load env variables
// dotenv.config();

// // Connect to DB
// connectDB();

// const app=express();

// //get current directory
// const __filename=fileURLToPath(import.meta.url);
// const __dirname=path.dirname(__filename);


// //middleware
// app.use(cors());
// app.use(express.json());



// //server static files from uploads directory
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// //routes
// app.use("/api/admin/", adminRoutes);
// app.use("/api/blogs", blogRoutes)




// // const PORT=process.env.PORT || 4000;

// // app.listen(PORT, ()=>{
// //   console.log(`server is running on ${PORT}`)
// // })

// export default app;



// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/connect.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files (note: Vercel serverless does not persist uploaded files)
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Root route to prevent 404 on '/'
app.get("/", (req, res) => {
  res.status(200).send("Backend is running on Vercel!");
});

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);

// Export app for Vercel (no app.listen)
export default app;


