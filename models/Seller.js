import mongoose  from "mongoose";

const sellerSchema = mongoose.Schema({
    AmazonApiKey: {
        type: String,
        required: true,
    },
    AmazonSecretKey: {
        type: String,
        required: true,
    },
    FlipkartApiKey: {
        type: String,
        required: true,
    },
    FlipkartSecretKey: {
        type: String,
        required: true,
    },
    sellerName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String ,
        unique: true,
        required: true,
    },
    AmazonApiIV: {
        type: String,
        required: true
    },
    AmazonSecretIV:{
        type: String,
        required: true
    },
    FlipkartApiKeyIV: {
        type: String,
        required: true
    },
    FlipkartSecretKeyIV: {
        type: String,
        required: true
    }
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;