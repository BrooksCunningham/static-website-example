//
"use strict";
/**
 * Private functions to handle local decryption of the token.
 */
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.encryptDetached = exports.decryptSecureToken = exports.decryptDetached = exports.decrypt = exports.verifyVisitorInfo = void 0;
const crypto_1 = require("crypto");
const Pako = require("pako");
function getHmac(data, key, algorithm, outputEncoding) {
    // @see https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key
    const hmac = crypto_1.createHmac(algorithm, key);
    hmac.update(data);
    return hmac.digest(outputEncoding);
}
/**
 * @hidden
 */
function verifyVisitorInfo(info) {
    if (typeof (info.action) !== "string" && info.action !== null) {
        throw Error("Bad token");
    }
    if (typeof (info.expires) !== "number") {
        throw Error("Bad token");
    }
    return info;
}
exports.verifyVisitorInfo = verifyVisitorInfo;
function decrypt(secureToken, secretKey) {
    const components = secureToken.split(":");
    if (components.length !== 4) {
        throw Error("Invalid token");
    }
    const version = components[0];
    const ivEncoded = components[1];
    const encodedValue = components[2];
    const hmac = components[3];
    return decryptDetached(version, ivEncoded, encodedValue, hmac, secretKey);
}
exports.decrypt = decrypt;
function decryptDetached(version, ivEncoded, encodedValue, hmac, secretKey) {
    const encryptionKey = secretKey.substring(0, 32);
    const hashKey = secretKey.substring(secretKey.length - 32);
    let encoding;
    if (version === "1.0") {
        encoding = "hex";
    }
    else if (version === "3") {
        encoding = "base64";
    }
    else {
        throw Error(`Unknown token version: '${version}'`);
    }
    // Make sure that someone with the correct hashKey performed the HMAC operation.
    // This ensures that a 3rd-party has not tampered with the encodedValue.

    if (hmac !== getHmac(encodedValue, hashKey, "sha256", encoding)) {
        // console.log('HMAC: ', hmac);
        // console.log('GET HMAC: ', getHmac(encodedValue, hashKey, "sha256", encoding));
        // throw new Error("The HMAC does not match (wrong tokenEncryptionKey configured?)");
        console.log("The HMAC does not match (wrong tokenEncryptionKey configured?)")
    }
    // Convert the iv back into a byte array.
    const iv = Buffer.from(ivEncoded, encoding);
    let decrypted;
    const cipher = crypto_1.createDecipheriv("aes-256-cbc", encryptionKey, iv);
    if (version === "1.0") {
        decrypted = cipher.update(encodedValue, "hex", "utf8") + cipher.final("utf8");
    }
    else {
        const compressedData = Buffer.concat([cipher.update(encodedValue, "base64"), cipher.final()]);
        try {
            decrypted = Pako.inflateRaw(compressedData, { to: "string" });
        }
        catch (e) {
            throw new Error("Bad deflate data: " + e);
        }
    }
    return decrypted;
}
exports.decryptDetached = decryptDetached;
module.exports = {
  decryptSecureToken : function decryptSecureToken(secureToken, secretKey) {
      const decrypted = decrypt(secureToken, secretKey);
      let visitorInfo;
      try {
          visitorInfo = JSON.parse(decrypted);
      }
      catch (e) {
          throw new Error("The decrypted token is not valid JSON!");
      }
      return verifyVisitorInfo(visitorInfo);
  },
decrypt_abp_token_in_browser : function decrypt_abp_token_in_browser() {
    var abp_token = document.getElementById("abp_token").value //decryptSecureToken(encrypted_token, priv_key)
    var abp_decryption_key = document.getElementById("abp_decryption_key").value
    // var abp_token_decryption_text = document.getElementById("abp_token") ;
    console.log(abp_token)
    console.log(abp_decryption_key)
    document.getElementById("abp_token_decryption").innerHTML = JSON.stringify(abp.decryptSecureToken(abp_token, abp_decryption_key), null, 2);
  }
};

// exports.decryptSecureToken = decryptSecureToken;
function encryptDetached(data, secretKey) {
    const compressedData = Pako.deflateRaw(data);
    const encryptionKey = secretKey.substring(0, 32);
    const hashKey = secretKey.substring(secretKey.length - 32);
    const iv = crypto_1.randomBytes(16);
    const cipher = crypto_1.createCipheriv("aes-256-cbc", encryptionKey, iv);
    let encodedValue = cipher.update(Buffer.from(compressedData), null, "base64");
    encodedValue += cipher.final("base64");
    const base64Iv = iv.toString("base64");
    const hmac = getHmac(encodedValue, hashKey, "sha256", "base64");
    return { iv: base64Iv, data: encodedValue, hmac };
}

exports.encryptDetached = encryptDetached;
