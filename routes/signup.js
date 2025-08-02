import mongoose from "mongoose";
import Seller from "../models/Seller.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import 'dotenv/config';
const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY;
const iv = crypto.randomBytes(16);

const router = express.Router();

router.get('/ping', (req, res) => {
    res.send('pong');
});
function getKey() {
    const keyHex = process.env.SECRET_KEY;
    if (!keyHex) throw new Error('SECRET_KEY not set');
    if (keyHex.length !== 64) throw new Error('SECRET_KEY must be 32-byte hex (64 chars)');
    return Buffer.from(keyHex, 'hex');
}
function encryptApiKey(apiKey) {
    const key = getKey();
    const iv =  crypto.randomBytes(16);     // move iv creation inside for unique IV per call
    const cipher =crypto.createCipheriv(algorithm, key, iv);
    const encrypted =  Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

router.post('/new-seller', async (req, res) => {
    const { AmazonApiKey, AmazonSecretKey, FlipkartApiKey, FlipkartSecretKey, sellerName, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const { encryptedData: hashedApiKey, iv: apiIv } = encryptApiKey(AmazonApiKey);
    const { encryptedData: hashedSecretKey, iv: secretIv } = encryptApiKey(AmazonSecretKey);
    const { encryptedData: hashedFlipkartApiKey, iv: flipkartIv } = encryptApiKey(FlipkartApiKey);
    const { encryptedData: hashedFlipkartSecretKey, iv: flipkartSecretIv } = encryptApiKey(FlipkartSecretKey);

    // console.log(hashedApiKey, apiIv, hashedSecretKey, secretIv, hashedFlipkartApiKey, flipkartIv, hashedFlipkartSecretKey, flipkartSecretIv);

    const seller = new Seller({
        AmazonApiKey: hashedApiKey,
        AmazonSecretKey: hashedSecretKey,
        FlipkartApiKey: hashedFlipkartApiKey,
        FlipkartSecretKey: hashedFlipkartSecretKey,
        AmazonApiIV: apiIv,
        AmazonSecretIV: secretIv,
        FlipkartApiKeyIV: flipkartIv,
        FlipkartSecretKeyIV: flipkartSecretIv,
        sellerName: sellerName,
        password: hashedPassword,
        email: email
    });
    await seller.save()
        .then(() => {
            res.status(201).json({ message: 'Seller created successfully' });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'Error creating seller' });
        });

})



export default router;