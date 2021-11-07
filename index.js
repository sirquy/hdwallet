import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.enable('trust proxy');
app.disable('x-powered-by');

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(cors());

import { ethers } from "ethers";
const HDNode = ethers.utils.HDNode;
import * as accounts from './utils/accounts.js';
import HDKey from 'hdkey';
import bip39 from "bip39";

const version = process.env.API_VERSION || 'v1';
const mnemonic = process.env.MNEMONIC;
const chaincode = {
    'ETH' : 60,
    'TRX' : 195
};
app.get('/api/'+version+'/:blockchain/generate/:index', async (req, res)  => {
    let index = req.params.index;
    let blockchain = (req.params.blockchain).toUpperCase();
    try {
        switch(blockchain) {
            case 'TRX':
                const seed = await bip39.mnemonicToSeed(mnemonic);
                const masterHdkey = HDKey.fromMasterSeed(seed);
                const path = `m/44'/195'/0'/0/${index}`;
                const hdKey = masterHdkey.derive(path)
                const accountData = accounts.generateAccountFromPriKeyBytes(hdKey.privateKey);
                res.json(accountData);
            break;
            default:
                let wallet = HDNode.fromMnemonic(mnemonic).derivePath("m/44'/60'/0'/0/"+index);
                res.json({
                    privateKey: wallet.privateKey,
                    publicKey: wallet.publicKey,
                    parentFingerprint: wallet.parentFingerprint,
                    fingerprint: wallet.fingerprint,
                    address: wallet.address,
                    chainCode: wallet.chainCode,
                    index: wallet.index,
                    depth: wallet.depth,
                    mnemonic: {
                        phrase: 'hidden',
                        path: wallet.mnemonic.path,
                        locale: wallet.mnemonic.locale,
                    },
                    path: wallet.path
                });
            break;
        }
    } catch(e) {
        res.json("Has an error");
    }
});

app.get('/*', (req, res) => {
    res.json({
      error: "Sorry. This page isn't available",
    });
  });

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});