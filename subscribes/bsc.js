import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import Web3 from 'web3'
var web3 = new Web3();
var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://bsc-ws-node.nariox.org:443', {
    reconnect: {
        auto: true,
        delay: 1000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
}));
import { readFile } from 'fs/promises';
const data = JSON.parse(await readFile(new URL('../contracts/usdt_bep20.json', import.meta.url)));
const contract = new web3.eth.Contract(data.abi, data.address, {});

let subscribes = ["0x4550d8C82ec1f3130323A0E61D58c133a2137c07"];

contract.events.Transfer(function(error, response){
    if (!error){
        let input_address = response.returnValues.to;
        let amount = parseFloat(response.returnValues.value) / 10 ** parseFloat(data.decimals);
        let txhash = response.transactionHash;
        console.log(input_address, amount, txhash)
        if (subscribes.indexOf(input_address) >= 0) {
            console.log(input_address, amount, txhash)
            console.log("Found");
        }
    }
});