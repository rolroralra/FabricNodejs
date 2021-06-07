// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Constants
const PORT = 8000;
const HOST = "0.0.0.0";

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const channelName = 'mychannel';
const chaincodeName = 'fabcar';
const adminUserId = 'admin';
const adminUserPasswd = 'adminpw';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ejs view template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Index page
app.get('/', function (req, res) {
    res.render('index', { title: "Main Page", activate: "index"});
});

// Qeury all cars page
app.get('/queryallcars', function (req, res) {
    res.render('queryallcars', { title: "Query", activate: "queryallcars" });
});

// Add car page
app.get('/addcar', function (req, res) {
    res.render('addcar', { title: "Add Car", activate: "addcar"  });
});

// Query car page
app.get('/querycar', function (req, res) {
    res.render('querycar', { title: "Query Car", activate: "querycar"  });
});

// Change car owner page
app.get('/changeowner', function (req, res) {
    res.render('changeowner', { title: "Change Owner", activate: "changeowner" });
});
// Change car owner page
app.get('/deletecar', function (req, res) {
    res.render('deletecar', { title: "Delete Car", activate: "deletecar" });
});

app.post('/api/initledger/', async function (req, res) {
    try {        
        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup the gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Now let's try to submit a transaction.
		// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
		// to the orderer to be committed by each of the peer's to the channel ledger.
		console.log('=> Submit Transaction: InitLedger');
		await contract.submitTransaction('InitLedger');        
        console.log('=> Transaction has been submitted');
        await gateway.disconnect();
        res.status(200).json({response: 'Transaction has been submitted'});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }   

});

app.get('/api/queryallcars', async function (req, res) {
    try {
        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup a gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log('=> Evaluate Transaction: QueryAllCars, function returns all the current assets on the ledger');
        const result = await contract.evaluateTransaction('QueryAllCars');        
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        
        var obj = JSON.parse(result)
        res.json(obj)

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
});

app.post('/api/querycar', async function (req, res) {
    try {

        var id = req.body.id;
        var make = req.body.make;
        var model = req.body.model;
        var colour = req.body.colour;
        var owner = req.body.owner;
        
 
        // make queryString
        var queryStringObject = new Object();
        queryStringObject.selector = new Object();
        if (id != ""){
            queryStringObject.selector.ID = id;
        }        
        if (make != ""){
            queryStringObject.selector.make = make;
        }
        if (model != ""){
            queryStringObject.selector.model = model;
        }
        if (colour != ""){
            queryStringObject.selector.colour = colour;
        }
        if (owner != ""){
            queryStringObject.selector.owner = owner;
        }                        
        var queryString = JSON.stringify(queryStringObject)
        console.log(queryString);
        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup the gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');


        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log(`=> Evaluate Transaction: QueryCar, function returns the attributes`);
        const result = await contract.evaluateTransaction('QueryCarCouchDB', queryString);
        if (result.toString() == ''){
            res.json({response: "empty result"})
        }
        console.log(`=> Transaction has been evaluated, result is: ${result.toString()}`);
        var obj = JSON.parse(result)
        res.json(obj)
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        res.status(400).json({response: 'Transaction failed', status: 400});
        
    }
});

app.post('/api/addcar/', async function (req, res) {
    try {
        var id = req.body.id;
        var make = req.body.make;
        var model = req.body.model;
        var colour = req.body.colour;
        var owner = req.body.owner;

        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup the gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Now let's try to submit a transaction.
		// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
		// to the orderer to be committed by each of the peer's to the channel ledger.
		console.log('=> Submit Transaction: AddCar, adds new car with id, make, model, colour, and owner arguments');
		await contract.submitTransaction('AddCar', id, make, model, colour, owner);        
        console.log('=> Transaction has been submitted');
        await gateway.disconnect();
        res.status(200).json({response: 'Transaction has been submitted', status: 200});
        

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({response: 'Transaction failed', status: 400});
    }   

});

app.post('/api/changeowner/', async function (req, res) {
    try {
        var id = req.body.id;
        var owner = req.body.owner;

        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup the gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try to submit a transaction.
		// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
        // to the orderer to be committed by each of the peer's to the channel ledger.
        
        try {
            // How about we try a transactions where the executing chaincode throws an error.
            // Notice how the submitTransaction will throw an error containing the error thrown by the chaincode.
            console.log(`=> Submit Transaction: ChangeOwner ${id}, change the owner to ${owner}`);
            await contract.submitTransaction('ChangeOwner', id, owner);
            console.log(`=> Transaction has been submitted`);
        } catch (error) {
            console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({response: 'Transaction failed'})
        }
        
        await gateway.disconnect();
        res.status(200).json({response: 'Transaction has been submitted', status: 200});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({response: 'Transaction failed'});
    }   
});
app.post('/api/queryhistorycars', async function (req, res) {
    
    var id = req.body.carid;
    
    try {
        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup a gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log('=> Evaluate Transaction: QueryAllCars, function returns all the current assets on the ledger');
        const result = await contract.evaluateTransaction('queryHistoryCars', id);        
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        
        var obj = JSON.parse(result)
        res.json(obj)

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        res.json('');
    }
});

app.post('/api/deletecar/', async function (req, res) {
    try {
        var id = req.body.carid;
        console.log(id);

        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const contents = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(contents);
        console.log(`\n=> Loaded the network configuration located at ${ccpPath}`);

        // Prepare the identity from the wallet.
        let wallet;
        if (walletPath) {
            wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`=> Found the file system wallet at ${walletPath}`);
        } else {
            wallet = await Wallets.newInMemoryWallet();
            console.log('=> Found the in-memory wallet');
        }        

        // Check to see if we've already enrolled the user.
	    const userIdentity = await wallet.get(org1UserId);
	    if (!userIdentity) {
		    console.log(`An identity for the user ${org1UserId} does not exist in the wallet`);
		    return;
        }
        console.log(`=> The user is ${org1UserId}`);

        // Setup the gateway object.
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        console.log(`=> Gateway set up`);

        // Build a network object based on the channel where the smart contract is deployed.
        const network = await gateway.getNetwork(channelName);
        console.log('=> Channel obtained');

        // Get the contract object from the network.
        const contract = network.getContract(chaincodeName);
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try to submit a transaction.
		// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
        // to the orderer to be committed by each of the peer's to the channel ledger.
        
        try {
            // How about we try a transactions where the executing chaincode throws an error.
            // Notice how the submitTransaction will throw an error containing the error thrown by the chaincode.
            console.log(`=> Submit Transaction: deleteCar ${id}`);
            await contract.submitTransaction('DeleteCar', id);
            console.log(`=> Transaction has been submitted`);
        } catch (error) {
            console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({response: 'Transaction failed'})
        }
        
        await gateway.disconnect();
        res.status(200).json({response: 'Transaction has been submitted', status: 200});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        //res.status(400).json(error);
        res.status(400).json({response: 'Transaction failed'});
    }   
});
// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
