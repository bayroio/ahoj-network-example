import React, { useState }  from 'react'

import Jumbotron from 'react-bootstrap/Jumbotron'
import Toast from 'react-bootstrap/Toast'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import { Link } from 'react-router-dom'

import * as avalanche from "avalanche";
import BN from 'bn.js';
import { Buffer } from 'buffer/'; // the slash forces this library over native Node.js Buffer

let bintools = avalanche.BinTools.getInstance();

let myKeychain;
let newAddress1, newAddress2, newAddress3;
let keypair;
let avm;
let ava;
let addresses;
let addressStrings;

/// The keychain is accessed through the AVM API and can be referenced directly or through a reference variable.
/// This exposes the instance of the class AVM Keychain which is created when the AVM API is created.
/// At present, this supports secp256k1 curve for ECDSA key pairs.
async function AccessingTheKeychain() {
    //let mynetworkID = 12345; //default is 3, we want to override that for our local network
    //let myBlockchainID = "rrEWX7gc7D9mwcdrdBxBTdqh1a7WDVsMuadhTZgyXfFcRz45L"; // The AVM blockchainID on this network
    ava = new avalanche.Avalanche("localhost", 9650, "http") //, mynetworkID, myBlockchainID);
    avm = ava.AVM(); //.XChain(); //let avm = ava.apis; //returns a reference to the AVM API used by Avalanche.js

    myKeychain = avm.keyChain();

    console.log("Avalanche instance: ", ava)
    console.log("AVM API reference: ", avm)
    console.log("myKeyChain: ", myKeychain)
}

/// The keychain has the ability to create new keypairs for you and return the address assocated with the key pair.
/// You may also import your exsting private key into the keychain using either a Buffer...
/// let mypk = bintools.cb58Decode("24jUJ9vZexUM6expyMcT48LBx27k1m7xpraoV62oSQAHdziao5"); //returns a Buffer
/// let newAddress2 = myKeychain.importKey(mypk);
/// ... or an Avalanche serialized string works, too:
/// let mypk = "24jUJ9vZexUM6expyMcT48LBx27k1m7xpraoV62oSQAHdziao5";
/// let newAddress2 = myKeychain.importKey(mypk); //returns a Buffer for the address
async function CreatingAVMkeypairs() {
    newAddress1 = myKeychain.makeKey();
    newAddress2 = myKeychain.makeKey();
    newAddress3 = myKeychain.makeKey();

    console.log("New Address 1: ", newAddress1)
    console.log("New Address 2: ", newAddress2)
    console.log("New Address 3: ", newAddress3)
}

/// The AVMKeyChain extends the global KeyChain class, which has standardized key management capabilities.
/// The following functions are available on any keychain that implements this interface.
async function WorkingWithKeychains() {
    addresses = myKeychain.getAddresses(); //returns an array of Buffers for the addresses
    addressStrings = myKeychain.getAddressStrings(); //returns an array of strings for the addresses
    let exists = myKeychain.hasKey(newAddress1); //returns true if the address is managed
    keypair = myKeychain.getKey(newAddress1); //returns the keypair class

    console.log("Addresses: ", addresses)
    console.log("AddressStrings: ", addressStrings)
    console.log("Address Exists: ", exists)
    console.log("Keypair class: ", keypair)
}

/// The AVMKeyPair class implements the global KeyPair class, which has standardized keypair functionality.
/// The following operations are available on any keypair that implements this interface.
async function WorkingWithKeypairs() {
    let address = keypair.getAddress(); //returns Buffer
    let addressString = keypair.getAddressString(); //returns string

    console.log("Addresses: ", address)
    console.log("AddressStrings: ", addressString)

    let pubk = keypair.getPublicKey(); //returns Buffer
    let pubkstr = keypair.getPublicKeyString(); //returns an Avalanche serialized string

    console.log("Pubk: ", pubk)
    console.log("Pubkstr: ", pubkstr)

    let privk = keypair.getPrivateKey(); //returns Buffer
    let privkstr = keypair.getPrivateKeyString(); //returns an Avalanche serialized string

    console.log("Privk: ", privk)
    console.log("Privkstr: ", privkstr)

    keypair.generateKey(); //creates a new random keypair

    console.log("Keypair class: ", keypair)

    let mypk = "24jUJ9vZexUM6expyMcT48LBx27k1m7xpraoV62oSQAHdziao5";
    let successful = keypair.importKey(mypk); //returns boolean if private key imported successfully
    console.log("Successful: ", successful)

    let message = Buffer.from("Wubalubadubdub");
    let signature = keypair.sign(message); //returns a Buffer with the signature
    let signerPubk = keypair.recover(message, signature);
    let isValid = keypair.verify(message, signature); //returns a boolean

    console.log("Signature: ", signature)
    console.log("SignerPubk: ", signerPubk)
    console.log("IsValid: ", isValid)
}

/// The AVM stores all available balances in a datastore called Unspent Transaction Outputs (UTXOs).
/// A UTXO Set is the unique list of outputs produced by transactions, addresses that can spend those outputs,
/// and other variables such as lockout times (a timestamp after which the output can be spent) and
/// thresholds (how many signers are required to spend the output).
/// For the case of this example, we're going to create a simple transaction that spends an amount of available coins 
/// and sends it to a single address without any restrictions. The management of the UTXOs will mostly be abstracted away.
/// However, we do need to get the UTXO Set for the addresses we're managing.
async function GettingTheUTXOSet() {
    let myAddresses = myKeychain.getAddresses(); //returns an array of addresses the keychain manages
    let addressStrings = myKeychain.getAddressStrings(); //returns an array of addresses the keychain manages as strings
    let utxos = await avm.getUTXOs(myAddresses);

    console.log("My Addresses: ", myAddresses)
    console.log("Address Strings: ", addressStrings)
    console.log("UTXO: ", utxos)
}

/// The first steps in creating a new asset using Avalanche.js is to determine the qualties of the asset.
/// We will give the asset a name, a ticker symbol, as well as a denomination.
async function MintingTheAsset() {
    // === Describe the new asset ===
    // The first steps in creating a new asset using Avalanche.js is to determine the qualties of the asset.
    //We will give the asset a name, a ticker symbol, as well as a denomination.

    // The fee to pay for the asset, we assume this network is fee-less
    let fee = new BN(0);

    // Name our new coin and give it a symbol
    let name = "Kikicoin is the most intelligent coin";
    let symbol = "KIKI";

    // Where is the decimal point indicate what 1 asset is and where fractional assets begin
    // Ex: 1 $AVAX is denomination 9, so the smallest unit of $AVAX is nano-AVAX ($nAVAX) at 10^-9 $AVAX
    let denomination = 9;

    // === Creating the initial state ===
    // We want to mint an asset with 400 coins to all of our managed keys, 500 to the second address we know of, 
    // and 600 to the second and third address. This sets up the state that will result from the Create Asset transaction.
    // Note: This example assumes we have the keys already managed in our AVM Keychain.

    // Create outputs for the asset's initial state
    let secpOutput1 = new avalanche.SecpOutput(new BN(400), new BN(400), 1, addresses);
    let secpOutput2 = new avalanche.SecpOutput(new BN(500), new BN(500), 1, [addresses[1]]);
    let secpOutput3 = new avalanche.SecpOutput(new BN(600), new BN(600), 1, [addresses[1], addresses[2]]);

    console.log("secpOutput1: ", secpOutput1)
    console.log("secpOutput2: ", secpOutput2)
    console.log("secpOutput3: ", secpOutput3)

    // Populate the initialState array
    // The AVM needs to know what type of output is produced.
    // The constant avalanche.AVMConstants.SECPFXID is the correct output.
    // It specifies that we are using a secp256k1 signature scheme for this output.
    let initialState = new avalanche.InitialStates();
    initialState.addOutput(secpOutput1, avalanche.AVMConstants.SECPFXID);
    initialState.addOutput(secpOutput2, avalanche.AVMConstants.SECPFXID);
    initialState.addOutput(secpOutput3, avalanche.AVMConstants.SECPFXID);

    /// === Creating the signed transaction ===
    /// Now that we know what we want an asset to look like, we create an output to send to the network.
    /// There is an AVM helper function buildCreateAssetTx() which does just that.
    // Fetch the UTXOSet for our addresses
    let utxos = await avm.getUTXOs(addresses);
    
    console.log("UTXOC: ", utxos)

    // Make an unsigned Create Asset transaction from the data compiled earlier
    let unsigned = await avm.buildCreateAssetTx(utxos, fee, addresses, initialState, name, symbol, denomination);

    let signed = avm.keyChain().signTx(unsigned); //returns a Tx class
    
    console.log("TX Signed:", signed)

    /// === Issue the signed transaction ===
    /// Now that we have a signed transaction ready to send to the network, let’s issue it!
    /// Using the Avalanche.js AVM API, we going to call the issueTx function. 
    /// This function can take either the Tx class returned in the previous step, 
    /// a base-58 string Avalanche serialized representation of the transaction, or a raw Buffer class with the data for the transaction.
    
    // using the Tx class
    let txid = await avm.issueTx(signed); //returns an Avalanche serialized string for the TxID
    // or... using the base-58 representation
    //let txid = await avm.issueTx(signed.toString()); //returns an Avalanche serialized string for the TxID
    // or... using the transaction Buffer
    //let txid = await avm.issueTx(signed.toBuffer()); //returns an Avalanche serialized string for the TxID

    /// === Get the status of the transaction ===
    /// Now that we sent the transaction to the network, it takes a few seconds to determine if the transaction has gone through.
    /// We can get an updated status on the transaction using the TxID through the AVM API.
    // returns one of: "Accepted", "Processing", "Unknown", and "Rejected"
    let status = await avm.getTxStatus(txid); 
    
    console.log("Status of the transaction: ", status);
}

async function ManagingKeys() {
    console.log("--- Managing Keys ---")
    AccessingTheKeychain();
    CreatingAVMkeypairs();
    WorkingWithKeychains();
    WorkingWithKeypairs();
}

async function CreatingAnAsset() {
    console.log("--- Creating An Asset ---")
    AccessingTheKeychain();
    CreatingAVMkeypairs();
    WorkingWithKeychains();
    MintingTheAsset();
}

async function SendingAnAsset() {
    console.log("--- Sending An Asset ---")
}

async function GetUTXO() {
    console.log("--- Get UTXO ---")
    let ava = new avalanche.Avalanche("localhost", 9650, "http");
    let avm = ava.AVM(); //.XChain(); //returns a reference to the AVM API used by Avalanche.js
    let myKeychain = avm.keyChain();
    let newAddress = myKeychain.makeKey();
    let addresses = myKeychain.getAddresses(); //returns an array of Buffers for the addresses
    let addressesStrings = myKeychain.getAddressStrings(); //returns an array of strings for the addresses
    let exists = myKeychain.hasKey(newAddress); //returns true if the address is managed
    let keypair = myKeychain.getKey(newAddress); //returns the keypair class
    let address = keypair.getAddress(); //returns Buffer
    let addressString = keypair.getAddressString(); //returns string
    let utxos = await avm.getUTXOs(addresses);
    //let utxos = await avm.getUTXOs(addressesStrings);
    //let utxos = await avm.getUTXOs(["X-MNhgCpLYV9ta9woFZAjxBvNorG3uF3oyi"]);


    console.log("Avalanche instance: ", ava)
    console.log("AVM API reference: ", avm)
    console.log("My Keychain: ", myKeychain)
    console.log("New Address: ", newAddress) 
    console.log("Addresses: ", addresses)
    console.log("AddressesStrings: ", addressesStrings)
    console.log("Address Exists: ", exists)
    console.log("Keypair class: ", keypair)
    console.log("Addresses: ", address)
    console.log("AddressStrings: ", addressString)
}

const MainPage = () => (
    <Container className="p-3">
        <Jumbotron>
            <h1 className="header">Ahoj Network</h1>
                <br></br>
                <Button variant="primary" onClick={ManagingKeys}>Managing AVM Keys</Button>{' '}
                <Button variant="primary" onClick={CreatingAnAsset}>Minting An Asset</Button>{' '}
                <Button variant="primary" onClick={SendingAnAsset}>Sending An Asset</Button>{' '}
                <Button variant="primary" onClick={GetUTXO}>Get UTXO</Button>{' '}
        </Jumbotron>
    </Container>
)

/*class MainPage extends Component {
    componentDidMount = () => {
        const portis = new Portis('6e57b02c-653b-45f0-96d3-c84b0fd5564c', 'goerli')
        const web3 = new Web3(portis.provider);
        this.setState({ portis, web3 })
    }

    async displayPortis() {
        this.state.portis.showPortis()
        
        const accounts = await this.state.web3.eth.getAccounts()
        console.log("Account: " + accounts[0])
        //this.state.web3.eth.getAccounts().then(account => console.log(account[0]))
        this.state.web3.eth.getBalance(accounts[0]).then(balance => console.log("Balance: " + balance/1000000000000000000 + ' ETH'))
        this.state.web3.eth.net.getNetworkType().then(networkname => console.log("Network name: " + networkname))
        //const balance = await this.state.web3.eth.getBalance(accounts[0])
        //const etherString = this.state.web3.toWei(balance)
        //console.log(etherString + 'ETH')
        //onst networkName = this.state.web3.network.name
        //document.getElementById("app").innerHTML = `
        //    <p>Wallet Address: ${accounts[0]}</p>
        //    <p>Balance: ${etherString} ETH (${networkName})</p>`

    }

    render() {
        return (
        )
    }
}*/

export default MainPage
