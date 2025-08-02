import crypto from "crypto";

let algorithm = 'aes-256-cbc';
function decryptApiKey(encryptedData, ivHex) {
    // console.log(encryptedData, ivHex);
    let secretKey = process.env.SECRET_KEY;
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export default decryptApiKey;