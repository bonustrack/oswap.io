import wif from 'wif';
import { publicKeyCreate, sign as ecdsaSign, verify as ecdsaVerify } from 'secp256k1';
import { randomBytes, createHash, createECDH, createCipheriv, createDecipheriv } from 'crypto';

export function deriveSharedSecret(ecdh, peerB64Pubkey) {
  const sharedSecretSrc = ecdh.computeSecret(peerB64Pubkey, 'base64');
  return createHash('sha256')
    .update(sharedSecretSrc)
    .digest()
    .slice(0, 16);
}

export function createEncryptedPackage(json, recipientDevicePubkey) {
  const text = JSON.stringify(json);
  // console.log("will encrypt and send: "+text);
  const ecdh = createECDH('secp256k1');
  const senderEphemeralPubkey = ecdh.generateKeys('base64', 'compressed');
  const sharedSecret = deriveSharedSecret(ecdh, recipientDevicePubkey); // Buffer
  // console.log(sharedSecret.length);
  // we could also derive iv from the unused bits of ecdh.computeSecret() and save some bandwidth
  const iv = randomBytes(12); // 128 bits (16 bytes) total, we take 12 bytes for random iv and leave 4 bytes for the counter
  const cipher = createCipheriv('aes-128-gcm', sharedSecret, iv);
  // under browserify, encryption of long strings fails with Array buffer allocation errors, have to split the string into chunks
  let arrChunks = [];
  const CHUNK_LENGTH = 2003;
  for (let offset = 0; offset < text.length; offset += CHUNK_LENGTH) {
    // console.log('offset '+offset);
    arrChunks.push(
      // @ts-ignore
      cipher.update(text.slice(offset, Math.min(offset + CHUNK_LENGTH, text.length)), 'utf8')
    );
  }
  // @ts-ignore
  arrChunks.push(cipher.final());
  const encryptedMessageBuf = Buffer.concat(arrChunks);
  // const encryptedMessageBuf = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  // console.log(encryptedMessageBuf);
  const encryptedMessage = encryptedMessageBuf.toString('base64');
  // console.log(encryptedMessage);
  const authtag = cipher.getAuthTag();
  // this is visible and verifiable by the hub
  return {
    encrypted_message: encryptedMessage,
    iv: iv.toString('base64'),
    authtag: authtag.toString('base64'),
    dh: {
      sender_ephemeral_pubkey: senderEphemeralPubkey,
      recipient_ephemeral_pubkey: recipientDevicePubkey
    }
  };
}

export function decryptPackage(objEncryptedPackage, objMyTempDeviceKey) {
  console.log('Expected ' + objEncryptedPackage.dh.recipient_ephemeral_pubkey);

  const priv_key = objMyTempDeviceKey.priv;
  if (objMyTempDeviceKey.use_count) objMyTempDeviceKey.use_count++;
  else objMyTempDeviceKey.use_count = 1;

  const ecdh = createECDH('secp256k1');
  // @ts-ignore
  if (process.browser) ecdh.generateKeys('base64', 'compressed');
  ecdh.setPrivateKey(priv_key);
  const shared_secret = deriveSharedSecret(ecdh, objEncryptedPackage.dh.sender_ephemeral_pubkey);
  const iv = Buffer.from(objEncryptedPackage.iv, 'base64');
  const decipher = createDecipheriv('aes-128-gcm', shared_secret, iv);
  const authtag = Buffer.from(objEncryptedPackage.authtag, 'base64');
  decipher.setAuthTag(authtag);
  const enc_buf = Buffer.from(objEncryptedPackage.encrypted_message, 'base64');
  // var decrypted1 = decipher.update(enc_buf);
  // under browserify, decryption of long buffers fails with Array buffer allocation errors, have to split the buffer into chunks
  let arrChunks = [];
  const CHUNK_LENGTH = 4096;
  for (let offset = 0; offset < enc_buf.length; offset += CHUNK_LENGTH) {
    //console.log('offset '+offset);

    arrChunks.push(
      // @ts-ignore
      decipher.update(enc_buf.slice(offset, Math.min(offset + CHUNK_LENGTH, enc_buf.length)))
    );
  }
  const decrypted1 = Buffer.concat(arrChunks);
  let decrypted2;
  try {
    decrypted2 = decipher.final();
  } catch (e) {
    return console.log('Failed to decrypt package: ' + e);
  }

  const decrypted_message_buf = Buffer.concat([decrypted1, decrypted2]);
  const decrypted_message = decrypted_message_buf.toString('utf8');
  const json = JSON.parse(decrypted_message);
  if (json.encrypted_package) {
    // strip another layer of encryption
    console.log('inner encryption');
    return decryptPackage(json.encrypted_package, objMyTempDeviceKey);
  } else return json;
}

export function createObjDeviceKey(priv) {
  return { priv, pub_b64: publicKeyCreate(priv, true).toString('base64') };
}

export function toWif(privateKey, testnet) {
  const version = testnet ? 239 : 128;
  return wif.encode(version, privateKey, false);
}

export function fromWif(string, testnet) {
  const version = testnet ? 239 : 128;
  return wif.decode(string, version);
}

export function sign(hash, privateKey) {
  const res = ecdsaSign(hash, privateKey);
  return res.signature.toString('base64');
}

export function verify(hash, b64Sig, b64Pubkey) {
  try {
    const signature = new Buffer(b64Sig, 'base64');
    return ecdsaVerify(hash, signature, new Buffer(b64Pubkey, 'base64'));
  } catch (e) {
    return false;
  }
}
