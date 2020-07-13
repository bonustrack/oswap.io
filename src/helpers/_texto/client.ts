import { Client as KbyteClient } from 'kbyte';
import { publicKeyCreate } from 'secp256k1';
import { getDeviceMessageHashToSign, getDeviceAddress } from '@obyte/ocore/object_hash';
import { fromWif, decryptPackage, createObjDeviceKey, createEncryptedPackage, sign } from './utils';
import mainConfig from '../config';

export default class Client {
  public address: string;
  public client: any;
  public config: object;
  public events = {
    ready: [],
    pairing: [],
    message: []
  };
  public devicePubKey: any;
  private objMyPermDeviceKey: any;

  constructor(config) {
    this.address = config.address ? config.address : `wss://${mainConfig.node}`;
    this.client = config.client ? config.client : new KbyteClient(this.address);
    this.config = config;
    const { testnet, wif, tempPrivKey, prevTempPrivKey, name } = config;
    const devicePrivKey = fromWif(wif, testnet).privateKey;
    this.devicePubKey = publicKeyCreate(devicePrivKey, true).toString('base64');
    const deviceTempPrivKey = Buffer.from(tempPrivKey, 'base64');
    const devicePrevTempPrivKey = Buffer.from(prevTempPrivKey, 'base64');
    this.objMyPermDeviceKey = createObjDeviceKey(devicePrivKey);
    const objMyTempDeviceKey = createObjDeviceKey(deviceTempPrivKey);
    // objMyTempDeviceKey.use_count = null;
    // const objMyPrevTempDeviceKey = createObjDeviceKey(devicePrevTempPrivKey);

    this.client.subscribe(result => {
      const [command, { subject, body }] = result;
      switch (command) {
        case 'justsaying':
          switch (subject) {
            case 'hub/challenge': {
              const objLogin = {
                challenge: body,
                pubkey: this.objMyPermDeviceKey.pub_b64,
                signature: undefined
              };
              objLogin.signature = sign(
                getDeviceMessageHashToSign(objLogin),
                this.objMyPermDeviceKey.priv
              );
              this.client.justsaying('hub/login', objLogin);

              const objTempPubkey = {
                temp_pubkey: objMyTempDeviceKey.pub_b64,
                pubkey: this.objMyPermDeviceKey.pub_b64,
                signature: undefined
              };
              objTempPubkey.signature = sign(
                getDeviceMessageHashToSign(objTempPubkey),
                this.objMyPermDeviceKey.priv
              );
              this.client.request('hub/temp_pubkey', objTempPubkey);
              this.client.justsaying('hub/refresh', null);
              this.trigger('ready', null);
              break;
            }
            case 'hub/message': {
              try {
                const objEncryptedPackage = body.message.encrypted_package;
                const decryptedPackage = decryptPackage(objEncryptedPackage, objMyTempDeviceKey);
                switch (decryptedPackage.subject) {
                  case 'pairing': {
                    if (decryptedPackage.body.reverse_pairing_secret) {
                      const reply = {
                        pairing_secret: decryptedPackage.body.reverse_pairing_secret,
                        device_name: name
                      };
                      this.send(body.message.pubkey, 'pairing', reply).then(() => {
                        const msg = new Message(this, body.message.pubkey, decryptedPackage.body);
                        this.trigger('pairing', msg);
                      });
                    }
                    break;
                  }
                  case 'text': {
                    const msg = new Message(this, body.message.pubkey, decryptedPackage.body);
                    this.trigger('message', msg);
                    break;
                  }
                }
              } catch (e) {
                console.log('Decrypt error', e);
                this.client.justsaying('hub/delete', body.message_hash);
              }
              this.client.justsaying('hub/delete', body.message_hash);
              break;
            }
          }
          break;
      }
    });
  }

  on(event, cb) {
    this.events[event].push(cb);
  }

  trigger(event, msg) {
    this.events[event].forEach(cb => cb(msg));
  }

  async send(recipientDevicePubkey, subject, body) {
    const myDeviceAddress = getDeviceAddress(this.devicePubKey);
    const myDeviceHub = this.address.replace('wss://', '').replace('ws://', '');
    const json = { from: myDeviceAddress, device_hub: myDeviceHub, subject, body };
    const objTempPubkey = await this.client.requestAsync(
      'hub/get_temp_pubkey',
      recipientDevicePubkey
    );
    const objEncryptedPackage = createEncryptedPackage(json, objTempPubkey.temp_pubkey);
    const recipientDeviceAddress = getDeviceAddress(recipientDevicePubkey);
    const objDeviceMessage = {
      encrypted_package: objEncryptedPackage,
      to: recipientDeviceAddress,
      pubkey: this.objMyPermDeviceKey.pub_b64,
      signature: undefined
    };
    objDeviceMessage.signature = sign(
      getDeviceMessageHashToSign(objDeviceMessage),
      this.objMyPermDeviceKey.priv
    );
    return this.client.requestAsync('hub/deliver', objDeviceMessage);
  }
}

class Message {
  public client: any;
  public sender: any;
  public body: any;

  constructor(client, sender, body) {
    this.client = client;
    this.sender = sender;
    this.body = body;
  }

  reply(body) {
    return this.client.send(this.sender, 'text', body);
  }
}
