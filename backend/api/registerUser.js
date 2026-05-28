const { Wallets, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const orgArg = process.argv.indexOf('--org');
        const userArg = process.argv.indexOf('--user');
        
        if (orgArg === -1 || userArg === -1) {
            console.error("Usage: node registerUser.js --org <Org1|Org2> --user <username>");
            process.exit(1);
        }
        
        const org = process.argv[orgArg + 1];
        const user = process.argv[userArg + 1];
        
        console.log(`Registering user ${user} for ${org}...`);

        // load the network configuration
        const ccpPath = path.resolve(__dirname, '../../medichain-network/connection-profile.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = org === 'Org1' ? ccp.certificateAuthorities['ca.org1.medichain.local'].url : ccp.certificateAuthorities['ca.org2.medichain.local'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(user);
        if (userIdentity) {
            console.log(`An identity for the user "${user}" already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet. Run enrollAdmin.js first.');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: user,
            role: 'client'
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: user,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${org}MSP`,
            type: 'X.509',
        };
        
        await wallet.put(user, x509Identity);
        console.log(`Successfully registered and enrolled user "${user}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }
}

main();
