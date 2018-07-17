/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Enroll the admin user
 */

var FabricClient = require('fabric-client');
var FabricCaClient = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

//
var fabricClient = new FabricClient();
var fabricCaClient = null;
var adminUser = null;
var memberUser = null;
var storePath = path.join(__dirname, 'hfc-key-store');
console.log(' Store path:' + storePath);

function enrollAdmin() {
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    FabricClient.newDefaultKeyValueStore({path: storePath})
    .then((stateStore) => {
        // assign the store to the fabric client
        fabricClient.setStateStore(stateStore);
        var cryptSuite = FabricClient.newCryptoSuite();
        // use the same location for the state store (where the users' certificate are kept)
        // and the crypto store (where the users' keys are kept)
        var cryptStore = FabricClient.newCryptoKeyStore({path: storePath});
        cryptSuite.setCryptoKeyStore(cryptStore);
        fabricClient.setCryptoSuite(cryptSuite);
        var	tlsOptions = {
        	trustedRoots: [],
        	verify: false};
        // be sure to change the http to https when the CA is running TLS enabled
        fabricCaClient = new FabricCaClient('http://localhost:7054', tlsOptions, 'ca.example.com', cryptSuite);
        // first check to see if the admin is already enrolled
        return fabricClient.getUserContext('admin', true);
    }).then((userFromStore) => {
        if (userFromStore && userFromStore.isEnrolled()) {
            console.log('Successfully loaded admin from persistence');
            adminUser = userFromStore;
            return null;
        } else {
        // need to enroll it with CA server
            return fabricCaClient.enroll({
                enrollmentID: 'admin',
                enrollmentSecret: 'adminpw'
            }).then((enrollment) => {
                console.log('Successfully enrolled admin user "admin"');
                return fabricClient.createUser(
                    {
                        username: 'admin',
                        mspid: 'Org1MSP',
                        cryptoContent: {
                            privateKeyPEM: enrollment.key.toBytes(),
                            signedCertPEM: enrollment.certificate
                        }
                    });
            }).then((user) => {
                adminUser = user;
                return fabricClient.setUserContext(adminUser);
            }).catch((err) => {
                console.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
                throw new Error('Failed to enroll admin');
            });
        }
    }).then(() => {
        console.log('Assigned the admin user to the fabric client ::' + adminUser.toString());
    }).catch((err) => {
        console.error('Failed to enroll admin: ' + err);
    });
}

module.exports = enrollAdmin();

