import mongoose from "mongoose";
import express from "express";
import axios from "axios";
import Seller from "../models/Seller.js";
import decryptApiKey from "../utils/decryption.js";
import createSign from "../utils/createSign.js";

let router = express.Router();


router.get('/ping', (req, res) => {
    res.send('pong');
});

router.get('/products', async (req, res) => {
    const sellerID = req.body.sellerID;

    const amazonAPIUrl = process.env.AMAZONAPI_URL + "api/seller/products";
    const flipkartAPIUrl = process.env.FLIPKARTAPI_URL + "api/seller/products";

    const seller = await Seller.findOne({ email: sellerID });

    let amazonAPI = seller.AmazonApiKey;
    let flipkartAPI = seller.FlipkartApiKey;
    let AmazonSecretKey = seller.AmazonSecretKey;
    let FlipkartSecretKey = seller.FlipkartSecretKey;

    const amazonAPIIV = seller.AmazonApiIV;
    const flipkartAPIIV = seller.FlipkartApiKeyIV;
    const AmazonSecretKeyIV = seller.AmazonSecretIV;
    const FlipkartSecretKeyIV = seller.FlipkartSecretKeyIV;

    amazonAPI = decryptApiKey(amazonAPI, amazonAPIIV);
    flipkartAPI = decryptApiKey(flipkartAPI, flipkartAPIIV);
    AmazonSecretKey = decryptApiKey(AmazonSecretKey, AmazonSecretKeyIV);
    FlipkartSecretKey = decryptApiKey(FlipkartSecretKey, FlipkartSecretKeyIV);
    // console.log("amazon api key", amazonAPI);
    // console.log("flipkart api key", flipkartAPI);
    // console.log("amazon secret key", AmazonSecretKey);
    // console.log("flipkart secret key", FlipkartSecretKey);

    const amazonAPIsign = createSign(AmazonSecretKey, "GET", "/api/seller/products");
    const flipkartAPIsign = createSign(FlipkartSecretKey, "GET", "/api/seller/products");

    // console.log("amazon api sign", amazonAPIsign);
    // console.log("flipkart api sign", flipkartAPIsign);

    try {
        const amazonResponse = await axios.get(amazonAPIUrl, {
            headers: {
                "x-api-key": amazonAPI,
                "x-api-signature": amazonAPIsign
            }
        });

        const flipkartResponse = await axios.get(flipkartAPIUrl, {
            headers: {
                "x-api-key": flipkartAPI,
                "x-api-signature": flipkartAPIsign
            }
        });

        res.json({ amazonProducts: amazonResponse.data, flipkartProducts: flipkartResponse.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }

});

export default router;