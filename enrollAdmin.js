/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const adminUserId = 'admin';
const adminUserPasswd = 'adminpw';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');

async function main() {
    try {
        // Build an in memory object with the network configuration (also known as a connection profile).
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
	    if (!fileExists) {
		    throw new Error(`no such file or directory: ${ccpPath}`);
	    }
	    const contents = fs.readFileSync(ccpPath, 'utf8');
	    const ccp = JSON.parse(contents);
        console.log(`Loaded the network configuration located at ${ccpPath}`);
    
        // Build an instance of the fabric CA services based on the information in the network configuration.
	    const caInfo = ccp.certificateAuthorities['ca.org1.example.com']; //lookup CA details from config
	    const caTLSCACerts = caInfo.tlsCACerts.pem;
	    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        console.log(`Built a CA Client instance named ${caInfo.caName}`);
    
        // Setup the wallet to hold the credentials of the admin user.
	    let wallet;
	    if (walletPath) {
		    wallet = await Wallets.newFileSystemWallet(walletPath);
		    console.log(`Set up a file system wallet at ${walletPath}`);
	    } else {
		    wallet = await Wallets.newInMemoryWallet();
		    console.log('Set up an in memory wallet');
        }        
        
        // Check to see if we've already enrolled the admin user.
		const identity = await wallet.get(adminUserId);
		if (identity) {
			console.log('An identity for the admin user already exists in the wallet');
			return;
		}

		// Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await caClient.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPasswd });
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: mspOrg1,
			type: 'X.509',
		};
		await wallet.put(adminUserId, x509Identity);
        console.log('Successfully enrolled admin user and imported it into the wallet');
        
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();