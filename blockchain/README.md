## Basic Network Config

Note that this basic configuration uses pre-generated certificates and
key material, and also has predefined transactions to initialize a 
channel named "mychannel".

To regenerate this material, simply run ``generate.sh``.

 - Once generated, the private key for the CA will need to be copied from ./crypto-config/peerOrganizations/org1.example.com/ca to the docker-compose config for the CA (line 18)
 - The directory for the chaincode is mapped to the CLI container via the CLI config in the docker-compose (line 118), this path is then matched in the install in the generate.sh for the chaincode install
 - chaincode can be invoked through the Blockchain CLI container like: docker exec cli peer chaincode invoke -o orderer.example.com:7050 -cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mycc -c '{"Args":["create"]}'

To start the network, run ``start.sh``.
To stop it, run ``stop.sh``
To completely remove all incriminating evidence of the network
on your system, run ``teardown.sh``.

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
