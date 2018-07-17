var FabricClient = require('fabric-client');
var path = require('path');
var util = require('util');

var storePath = path.join(__dirname + '/hfc-key-store');
var txID = null;
class FabricConnector {

    configure(channelName, ordererUrl, peerUrl) {
        this.channelName = channelName;
        this.ordererUrl = ordererUrl;
        this.peerUrl = peerUrl;
        this.txID = null;

        // set up new fabric client
        this.fabricClient = new FabricClient();

        // create new Channe, Peer and Orderer
        this.channel = this.fabricClient.newChannel(this.channelName);
        this.peer = this.fabricClient.newPeer(this.peerUrl);
        this.orderer = this.fabricClient.newOrderer(this.ordererUrl);

        // add peer and orderer to channel
        this.channel.addPeer(this.peer);
        this.channel.addOrderer(this.orderer);
    }

    async getUser(user) {
        // get and set the state store
        let stateStore = await FabricClient.newDefaultKeyValueStore({path: storePath});
        this.fabricClient.setStateStore(stateStore);
        // get and set the crypto store
        var cryptoSuite = FabricClient.newCryptoSuite();
        var cryptoStore = FabricClient.newCryptoKeyStore({path: storePath});
        cryptoSuite.setCryptoKeyStore(cryptoStore);
        this.fabricClient.setCryptoSuite(cryptoSuite);
        // return the user context
        let userFromStore = await this.fabricClient.getUserContext(user, true);
        if (userFromStore && userFromStore.isEnrolled()) {
            console.log('user loaded from persistence');
            return userFromStore;
        } else {
            throw Error('Failed to load user from persistence');
        }
    }

    async sendProposal() {
        this.txID = this.fabricClient.newTransactionID();
        var request = {
            chaincodeId: this.ccId,
            fcn: this.func,
            args: this.args,
            chainId: this.channelName,
            txId: this.txID
        };
        let results = await this.channel.sendTransactionProposal(request)
        .then(res => {
            if (res[0] instanceof Error) {
                return Promise.reject(res[0]);
            }
            return Promise.resolve(res);
        })
          .catch(err => {
              return Promise.reject({
                  statusCode: err.statusCode,
                  message: err.details
              });
          });
        return results;
    }

    async sendTransaction() {
        // submit proposal
        let proposalResults = await this.sendProposal();
        // check results of proposal
        let proposalResponses = proposalResults[0];
        let proposal = proposalResults[1];
        let proposalIsGood = false;
        if (proposalResponses &&
            proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            proposalIsGood = true;
            console.log('Proposal Submitted Successfuly');
        } else {
            console.log('Bad Proposal Sent');
        }
        // if the propsal is good, send a transaction to the ordere
        if (proposalIsGood) {
            let responseMessage = util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
                proposalResponses[0].response.status, proposalResponses[0].response.message);
            console.log(responseMessage);

            // build the transaction request
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };

            var txIDAsString = this.txID.getTransactionID();
            var promises = [];

            // send the transaction to the channel, and push the promise response
            // on to the array
            var sendPromise = this.channel.sendTransaction(request);
            promises.push(sendPromise);

            // event hub to manage and monitor the request that has been sent
            let eventHub = this.fabricClient.newEventHub();
            eventHub.setPeerAddr('grpc://localhost:7053');

            // resolve with a timeout if the transaction is not processed within
            // 30 seconds
            let txPromise = await new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eventHub.disconnect();
                    resolve({eventStatus: 'TIMEOUT'});
                }, 3000);
                eventHub.connect();
                eventHub.registerTxEvent(txIDAsString, (tx, code) => {
                    // clear the timeout if the transaction has been 
                    // successful, unregister the event and disconnect the 
                    // event hub
                    clearTimeout(handle);
                    eventHub.unregisterTxEvent(txIDAsString);
                    eventHub.disconnect();

                    // what was the response?
                    var returnStatus = {eventStatus: code, txID: txIDAsString};

                    if (code !== 'VALID') {
                        console.log('The transaction was invalid, code = ' + code);
                        resolve(returnStatus);
                    } else {
                        console.log('The transaction has been commited on peer ' + eventHub._ep._endpoint.addr);
                        resolve(returnStatus);
                    }
                }, (err) => {
                    // reject if the event hub received an error
                    reject(new Error('There was a problem with the eventHub: ' + err));
                });
            });

            // push the tx promise on to the array, this gives us 0 = sent request,
            // and 1 = the response for the transaction
            promises.push(txPromise);
            console.log('return the resolved promises ');
            // return resolve all the promises, and return an array of the results
            return Promise.all(promises);
        } else {
            console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
            throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');            
        }
    }

    async invoke(chaincodeId, fcn, args) {
        this.ccId = chaincodeId;
        this.func = fcn;
        this.args = args;
        
        // submit the transaction 
        await this.sendTransaction().then((results) => {
            var sentResponse, transactionResponse;
            // was the request sent OK?
            sentResponse = results[0].status == 'SUCCESS' ? 'Transaction Sent Successfully' : 'Issue with send request';
            console.log(sentResponse);
            // was the transaction commited?
            transactionResponse = results[1].eventStatus == 'VALID' ? 'Transaction Commited Successfully' : 'Issue with commit';
            console.log(transactionResponse);
        }).catch((error) => {
            console.log('Failed to invoke the chaincode successfully ' + error);
        });
    }

}

module.exports = FabricConnector;
