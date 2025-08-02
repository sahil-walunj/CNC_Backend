import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
const router = express.Router();

router.get('/ping', (req, res) => {
    res.send('pong');
});
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(404).json({ email: "Seller not found" });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(400).json({ password: "Incorrect password" });
        }

        const payload = { id: seller.id, sellerName: seller.sellerName, email: seller.email };
        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                return res.json({
                    success: true,
                    token: "Bearer " + token,
                });
            }
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});


export default router;