import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import loginRoutes from "./routes/login.js";
import signupRoutes from "./routes/signup.js";
import sellerRoutes from "./routes/seller.js";

const app= express();
const port = process.env.PORT || 5254;

app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.use("/api/login", loginRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/seller", sellerRoutes);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});