/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const adminUserId = 'admin';
const org1UserId = 'appUser';
const channelName = 'mychannel';
const chaincodeName = 'fabcar';
const mspOrg1 = 'Org1MSP';
const affiliation = 'org1.department1';
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
        console.log(`Built a CA Client named ${caInfo.caName}`);
    
        // Setup the wallet to hold the credentials of the admin user.
	    let wallet;
	    if (walletPath) {
		    wallet = await Wallets.newFileSystemWallet(walletPath);
		    console.log(`Set up a file system wallet at ${walletPath}`);
	    } else {
		    wallet = await Wallets.newInMemoryWallet();
		    console.log('Set up an in memory wallet');
        }     

        // Check to see if we've already enrolled the user
		const userIdentity = await wallet.get(org1UserId);
		if (userIdentity) {
			console.log(`An identity for the user ${org1UserId} already exists in the wallet`);
			return;
		}

		// Use the admin to register a new user
		const adminIdentity = await wallet.get(adminUserId);
		if (!adminIdentity) {
			console.log('An identity for the admin user does not exist in the wallet');
			console.log('Enroll the admin user before retrying');
			return;
		}
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);           

        // Register the user, enroll the user, and import the new identity into the wallet.		
		const secret = await caClient.register({
			affiliation: affiliation,
			enrollmentID: org1UserId,
			role: 'client'
		}, adminUser);
		const enrollment = await caClient.enroll({
			enrollmentID: org1UserId,
			enrollmentSecret: secret
		});
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: mspOrg1,
			type: 'X.509',
		};
		await wallet.put(org1UserId, x509Identity);
        console.log(`Successfully registered and enrolled user ${org1UserId} and imported it into the wallet`);
        
    } catch (error) {
        console.error(`Failed to register user ${org1UserId}: ${error}`);
        process.exit(1);
    }
}

main();
