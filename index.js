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

import * as accounts from './utils/accounts.js';
import eth from 'ethereumjs-wallet';
const EHDNode = eth.hdkey;
import THDNode from 'hdkey';
import bip39 from "bip39";
import ethereumjs from 'ethereumjs-tx';
const Tx = ethereumjs.Transaction;
import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org'));

const version = process.env.API_VERSION || 'v1';
const mnemonic = process.env.MNEMONIC;
const chaincode = {
    'ETH' : 60,
    'TRX' : 195
};
app.get('/api/'+version+'/:blockchain/generate/:index', async (req, res)  => {
    let index = req.params.index;
    let blockchain = (req.params.blockchain).toUpperCase();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    let path = null;
    try {
        switch(blockchain) {
            case 'TRX':
                const masterHdkey = THDNode.fromMasterSeed(seed);
                path = `m/44'/195'/0'/0/${index}`;
                const hdKey = masterHdkey.derive(path)
                const accountData = accounts.generateAccountFromPriKeyBytes(hdKey.privateKey);
                res.json(accountData);
            break;
            default:
                path = `m/44'/60'/0'/0/${index}`;
                const hdwallet = EHDNode.fromMasterSeed(seed);
                const wallet = hdwallet.derivePath(path).getWallet();
                res.json({
                    // privateKey: wallet.getPrivateKey().toString('hex'),
                    publicKey: wallet.getPublicKey().toString('hex'),
                    address: `0x${wallet.getAddress().toString('hex')}`,
                });
            break;
        }
    } catch(e) {
        res.json("Has an error");
    }
});
// add_gas("0xa3207050846c4E753C007D2339f36b8cc4D7044A");
async function add_gas(to_address) {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        let path = `m/44'/60'/0'/0/0`;
        const hdwallet = EHDNode.fromMasterSeed(seed);
        const wallet = hdwallet.derivePath(path).getWallet();
        
        const account = await web3.eth.accounts.privateKeyToAccount(wallet.getPrivateKey().toString('hex'));
        const private_key = new Buffer.from(wallet.getPrivateKey().toString('hex'), 'hex');
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const signedTx = await web3.eth.accounts.signTransaction({
            from: account.address,
            to: to_address,
            gasPrice: web3.utils.toHex(gasPrice),
            gas: web3.utils.toHex(100000),
            nonce: web3.utils.toHex(nonce),
            value: web3.utils.toHex(0.001 * Math.pow(10, 18)),
            chainID: 56
        }, '0x'+wallet.getPrivateKey().toString('hex'));
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
            if (!error) {
                console.log(hash);
            } else {
                console.log(error)
            }
        })
    } catch(e) {
        return e;
    }
}

app.get('/api/'+version+'/forward/:index?', async (req, res) => {
    try {
        let index = parseInt(req.params.index);
        const seed = await bip39.mnemonicToSeed(mnemonic);
        let path = `m/44'/60'/0'/0/${index}`;
        const hdwallet = EHDNode.fromMasterSeed(seed);
        const wallet = hdwallet.derivePath(path).getWallet();
        const account = await web3.eth.accounts.privateKeyToAccount(wallet.getPrivateKey().toString('hex'));
        const private_key = new Buffer.from(wallet.getPrivateKey().toString('hex'), 'hex');
        
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        let abi = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
        let contract_address = "0x55d398326f99059ff775485246999027b3197955";
        const contract = await new web3.eth.Contract(abi, contract_address, {
            from: account.address
        });
        let amount = await contract.methods.balanceOf(account.address).call();
        let receiver_address = "0x278f68c882bd6ba2c00dd871e9144e1fb610f86d"; // customer binance wallet address
        var data = await contract.methods.transfer(receiver_address, amount).encodeABI();
        if(amount > 0) {
            const signedTx = await web3.eth.accounts.signTransaction({
                from: account.address,
                to: contract_address,
                gas: web3.utils.toHex(100000),
                gasPrice: web3.utils.toHex(gasPrice),
                data: data,
                nonce: web3.utils.toHex(nonce),
            }, '0x'+wallet.getPrivateKey().toString('hex'));
            // tx.sign(private_key);
            // const serializedTx = tx.serialize();
            await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
                if (!error) {
                    res.json({hash});
                } else {
                    if(error.data === null) {
                        add_gas(account.address);
                    }
                    res.json({error})
                }
            })
        }
        res.json({msg: "Amount too small."});
    } catch (err) {
        res.json(err);
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