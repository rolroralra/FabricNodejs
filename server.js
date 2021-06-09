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
const chaincodeName = 'model';
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
app.get('/', function(req, res) {
    res.render('index', { title: "Main Page", activate: "index" });
});

// Qeury all models page
app.get('/queryallmodels', function(req, res) {
    res.render('queryallmodels', { title: "Query", activate: "queryallmodels" });
});

// Qeury all products page
app.get('/queryallproducts', function(req, res) {
    res.render('queryallproducts', { title: "Query", activate: "queryallproducts" });
});

// Add model page
app.get('/addmodel', function(req, res) {
    res.render('addmodel', { title: "Add Model", activate: "addmodel" });
});

// Query model page
app.get('/querymodel', function(req, res) {
    res.render('querymodel', { title: "Query Model", activate: "querymodel" });
});

// Change model owner page
app.get('/changeowner', function(req, res) {
    res.render('changeowner', { title: "Change Owner", activate: "changeowner" });
});
// Change model owner page
app.get('/deletemodel', function(req, res) {
    res.render('deletemodel', { title: "Delete Model", activate: "deletemodel" });
});
app.get('/pushmodel', function(req, res) {
    res.render('pushmodel', { title: "Push Model", activate: "pushmodel" });
});
app.get('/createmodelproduct', function(req, res) {
    res.render('createmodelproduct', { title: "Create Model Product", activate: "createmodelproduct", modelid: req.query.modelid });
});


app.post('/api/initledger/', async function(req, res) {
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
        // const contract = network.getContract(chaincodeName);
        const contract = network.getContract(req.body.chaincodeName);

        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Now let's try to submit a transaction.
        // This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
        // to the orderer to be committed by each of the peer's to the channel ledger.
        console.log('=> Submit Transaction: InitLedger');
        await contract.submitTransaction('InitLedger');
        console.log('=> Transaction has been submitted');
        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted' });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }

});

app.get('/api/queryallmodels', async function(req, res) {
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
        console.log('=> Evaluate Transaction: QueryAllModels, function returns all the current assets on the ledger');
        const result = await contract.evaluateTransaction('QueryAllModels');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result)
        res.json(obj)

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
});

app.post('/api/querymodel', async function(req, res) {
    try {
        var id = req.body.id;
        var name = req.body.name;
        var count = req.body.count;

        // make queryString
        var queryStringObject = new Object();
        queryStringObject.selector = new Object();
        if (id != "") {
            queryStringObject.selector.ID = id;
        }
        if (name != "") {
            queryStringObject.selector.name = name;
        }
        if (count != "") {
            queryStringObject.selector.count = count;
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
        const contract = network.getContract("model");
        console.log('=> Contract obtained');


        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log(`=> Evaluate Transaction: QueryModel, function returns the attributes`);
        const result = await contract.evaluateTransaction('QueryModelCouchDB', queryString);
        if (result.toString() == '') {
            res.json({ response: "empty result" })
        }
        console.log(`=> Transaction has been evaluated, result is: ${result.toString()}`);
        var obj = JSON.parse(result)
        res.json(obj)
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        res.status(400).json({ response: 'Transaction failed', status: 400 });

    }
});

app.post('/api/addmodel/', async function(req, res) {
    try {
        var id = req.body.id;
        var name = req.body.name;
        var count = req.body.count;

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
        console.log('=> Submit Transaction: AddModel, adds new model with id, name, count arguments');
        await contract.submitTransaction('AddModel', id, name, count);
        console.log('=> Transaction has been submitted');
        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({ response: 'Transaction failed', status: 400 });
    }

});

app.post('/api/changeowner/', async function(req, res) {
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
            res.status(400).json({ response: 'Transaction failed' })
        }

        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({ response: 'Transaction failed' });
    }
});
app.post('/api/queryhistorymodels', async function(req, res) {

    var id = req.body.modelid;

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
        console.log('=> Evaluate Transaction: QueryAllModels, function returns all the current assets on the ledger');
        const result = await contract.evaluateTransaction('queryHistoryModels', id);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result)
        res.json(obj)

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        res.json('');
    }
});

app.post('/api/deletemodel/', async function(req, res) {
    try {
        var id = req.body.modelid;
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
            console.log(`=> Submit Transaction: deleteModel ${id}`);
            await contract.submitTransaction('DeleteModel', id);
            console.log(`=> Transaction has been submitted`);
        } catch (error) {
            console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({ response: 'Transaction failed' })
        }

        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        //res.status(400).json(error);
        res.status(400).json({ response: 'Transaction failed' });
    }
});

app.post('/api/pushmodel/', async function(req, res) {
    try {
        var id = req.body.modelid;
        var count = req.body.count;
        console.log(id);
        console.log(count);

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
            console.log(`=> Submit Transaction: pushModel ${id} ${count}`);
            await contract.submitTransaction('PushModel', id, count);
            console.log(`=> Transaction has been submitted`);
        } catch (error) {
            console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({ response: 'Transaction failed' })
        }

        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        //res.status(400).json(error);
        res.status(400).json({ response: 'Transaction failed' });
    }
});
app.post('/api/popmodel/', async function(req, res) {
    try {
        var id = req.body.modelid;
        var count = req.body.count;
        console.log(id);
        console.log(count);

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
            console.log(`=> Submit Transaction: popModel ${id} ${count}`);
            await contract.submitTransaction('PopModel', id, count);
            console.log(`=> Transaction has been submitted`);
        } catch (error) {
            console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({ response: 'Transaction failed' })
        }

        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        //res.status(400).json(error);
        res.status(400).json({ response: 'Transaction failed' });
    }
});

app.get('/api/queryallproducts', async function(req, res) {
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
        const contract = network.getContract("product");
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log('=> Evaluate Transaction: QueryAllProducts, function returns all the current assets on the ledger');
        const result = await contract.evaluateTransaction('QueryAllProducts');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result)
        res.json(obj)

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
});

app.post('/api/queryhistoryproducts', async function(req, res) {

    var id = req.body.productid;

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
        const contract = network.getContract("product");
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log('=> Evaluate Transaction: Query History Products, function returns all the current assets on the ledger');
        const result = await contract.evaluateTransaction('QueryHistoryProducts', id);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result)
        res.json(obj)

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        res.json('');
    }
});

app.post('/api/deleteproduct/', async function(req, res) {
    try {
        var id = req.body.productid;
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
        const contract = network.getContract("product");
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try to submit a transaction.
        // This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
        // to the orderer to be committed by each of the peer's to the channel ledger.

        try {
            // How about we try a transactions where the executing chaincode throws an error.
            // Notice how the submitTransaction will throw an error containing the error thrown by the chaincode.
            console.log(`=> Submit Transaction: deleteProduct ${id}`);
            await contract.submitTransaction('DeleteProduct', id);
            console.log(`=> Transaction has been submitted`);
        } catch (error) {
            console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({ response: 'Transaction failed' })
        }

        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        //res.status(400).json(error);
        res.status(400).json({ response: 'Transaction failed' });
    }
});

app.post('/api/addproduct/', async function(req, res) {
    try {

        var id = req.body.id;
        var modelid = req.body.modelid;
        var modelname = req.body.modelname;
        var make = req.body.make;
        var status = req.body.status;
        var updatedat = req.body.updatedat;
        var description = req.body.description;

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
        const contract = network.getContract("product");
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Now let's try to submit a transaction.
        // This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
        // to the orderer to be committed by each of the peer's to the channel ledger.
        console.log('=> Submit Transaction: AddProduct, adds new product with arguments');

        await contract.submitTransaction('AddProduct', id, modelid, modelname, make, status, updatedat, description);
        console.log('=> Transaction has been submitted');
        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({ response: 'Transaction failed', status: 400 });
    }

});

app.post('/api/queryproduct', async function(req, res) {
    try {
        var id = req.body.id;
        var modelID = req.body.modelID;
        var modelName = req.body.modelName;
        var make = req.body.make;
        var status = req.body.status;
        var updatedAt = req.body.updatedAt;
        var description = req.body.description;


        // make queryString
        var queryStringObject = new Object();
        queryStringObject.selector = new Object();
        if (id != "") {
            queryStringObject.selector.ID = id;
        }
        if (modelID != "") {
            queryStringObject.selector.modelID = modelID;
        }
        if (modelName != "") {
            queryStringObject.selector.modelName = modelName;
        }
        if (make != "") {
            queryStringObject.selector.make = make;
        }
        if (status != "") {
            queryStringObject.selector.status = status;
        }
        if (updatedAt != "") {
            queryStringObject.selector.updatedAt = updatedAt;
        }
        if (description != "") {
            queryStringObject.selector.description = description;
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
        const contract = network.getContract("product");
        console.log('=> Contract obtained');


        // Invoke the chaincode function!!!
        // Let's try a query type operation (function).
        // This will be sent to just one peer and the results will be shown.
        console.log(`=> Evaluate Transaction: QueryProduct, function returns the attributes`);
        const result = await contract.evaluateTransaction('QueryProductCouchDB', queryString);
        if (result.toString() == '') {
            res.json({ response: "empty result" })
        }
        console.log(`=> Transaction has been evaluated, result is: ${result.toString()}`);
        var obj = JSON.parse(result)
        res.json(obj)
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
        res.status(400).json({ response: 'Transaction failed', status: 400 });

    }
});

app.post('/api/updateproduct/', async function(req, res) {
    try {
        var productid = req.body.productid;
        var modelid = req.body.modelid;
        var status = req.body.status;
        var updatedat = req.body.updatedat;

        console.log(productid);
        console.log(modelid);
        console.log(status);
        console.log(updatedat);

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
        const contract = network.getContract("model");
        console.log('=> Contract obtained');

        const contract2 = network.getContract("product");
        console.log('=> Contract obtained');

        // Invoke the chaincode function!!!
        // Let's try to submit a transaction.
        // This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
        // to the orderer to be committed by each of the peer's to the channel ledger.

        try {
            // How about we try a transactions where the executing chaincode throws an error.
            // Notice how the submitTransaction will throw an error containing the error thrown by the chaincode.

            var chaincodeMethodName = "";
            if (status == "2") {
                chaincodeMethodName = "PushModel";
            } else if (status == "3") {
                chaincodeMethodName = "PopModel";
            } else {
                res.status(400).json({ response: 'Transaction failed' })
                return
            }

            console.log(`=> Submit Transaction: ${chaincodeMethodName} ${modelid} 1`);
            await contract.submitTransaction(chaincodeMethodName, modelid, 1);
            console.log(`=> Transaction has been submitted`);

            console.log(`=> Submit Transaction: UpdateProduct ${productid} ${status} ${updatedat}`);
            await contract2.submitTransaction('UpdateProduct', productid, status, updatedat);
            console.log(`=> Transaction has been submitted`);


        } catch (error) {
            // console.log(`=> Error. ${id} may not exist.`);
            //res.status(400).json(error);
            res.status(400).json({ response: 'Transaction failed' })
        }

        await gateway.disconnect();
        res.status(200).json({ response: 'Transaction has been submitted', status: 200 });

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        //res.status(400).json(error);
        res.status(400).json({ response: 'Transaction failed' });
    }
});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);