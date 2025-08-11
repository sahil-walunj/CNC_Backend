import mongoose from "mongoose";
import express from "express";
import axios from "axios";
import Seller from "../models/Seller.js";
import decryptApiKey from "../utils/decryption.js";
import createSign from "../utils/createSign.js";
import auth from "../middleware/auth.js";
let router = express.Router();


router.get('/ping', (req, res) => {
    res.send('pong');
});

router.get('/products', auth, async (req, res) => {
    const sellerID = req.sellerId;

    const amazonAPIUrl = process.env.AMAZONAPI_URL + "api/seller/products";
    const flipkartAPIUrl = process.env.FLIPKARTAPI_URL + "api/seller/products";

    const seller = await Seller.findOne({ _id: sellerID });

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
        let products = [];
        let amazonList = amazonResponse.data.products;
        let flipkartList = flipkartResponse.data.products;
        // console.log(flipkartList);
        for (let i = 0; i < amazonList.length; i++) {
            products.push({ "title": amazonList[i].Title, "amazonList": amazonList[i], "flipkartList": NaN });
        }
        for (let i = 0; i < flipkartList.length; i++) {
            let iterator = products.find(product => product.title === flipkartList[i].title);
            if (iterator) {
                iterator.flipkartList = flipkartList[i];
            }
            else {
                products.push({ "title": flipkartList[i].title, "flipkartList": flipkartList[i], "amazonList": NaN });
            }
        }
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }

});
router.post('/new/product', auth, async (req, res) => {
    const createFor = req.body.createFor;
    const sellerID = req.sellerId;
    const amazonAPIUrl = process.env.AMAZONAPI_URL + "api/seller/products";
    const flipkartAPIUrl = process.env.FLIPKARTAPI_URL + "api/seller/products";

    const seller = await Seller.findOne({ _id: sellerID });

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

    const amazonAPIsign = createSign(AmazonSecretKey, "POST", "/api/seller/products");
    const flipkartAPIsign = createSign(FlipkartSecretKey, "POST", "/api/seller/products");
    console.log(createFor);
    let result = [];
    if (createFor.includes("Amazon")) {
        const { title, category, price, amazonQuantityAvailable, fulfillmentChannel} = req.body;
        const response = await axios.post(amazonAPIUrl, {
            title: title,
            category: category,
            price: price,
            quantityAvailable: amazonQuantityAvailable,
            fulfillmentChannel: fulfillmentChannel
        }, {
        headers: {
            "x-api-key": amazonAPI,
            "x-api-signature": amazonAPIsign
        }
        })
        if (response.status !== 200) {
            res.status(500).json(response.data);
        }
        result.push(response.data);
    }
    if (createFor.includes("Flipkart")) {
        const {  title, category, price, flipkartQuantityAvailable } = req.body;
        const response = await axios.post(flipkartAPIUrl, {
            title: title,
            category: category,
            price: price,
            quantityAvailable: flipkartQuantityAvailable
        }, {
        headers: {
            "x-api-key": flipkartAPI,
            "x-api-signature": flipkartAPIsign
        }
        })
        if (response.status !== 200) {
            res.status(500).json(response.data);
        }
        result.push(response.data);
    }
    res.status(200).json(result);
})
export default router;