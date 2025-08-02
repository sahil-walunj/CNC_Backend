import crypto from "crypto";

function createSign(secret, method, path) {
    const signature = crypto.createHmac('sha256', secret).update(method + path).digest('hex');
    return signature;
}

export default createSign;