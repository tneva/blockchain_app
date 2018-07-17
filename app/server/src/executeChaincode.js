const FabricConnector = require('./FabricConnector');

var fabricConnect = new FabricConnector();
var channel = 'mychannel';
var peerUrl = 'grpc://localhost:7051';
var ordererUrl = 'grpc://localhost:7050';

fabricConnect.configure(channel, ordererUrl, peerUrl);

// fabricConnect.getUser()
// .then((resp) => {
//     console.log(resp);
// })
// .catch((err) => {
//     console.log(err);
// });

const exec = async function() {
    console.log('before');
    var user = await fabricConnect.getUser('user1');
    // console.log('user: ' + user);
    var device = {
        id: '100',
        manufacturer: 'Hotpoint',
        status: 1,
    };
    // var tx = await fabricConnect.invoke('mycc', 'createDevice', [JSON.stringify(device)]);
    var response = await fabricConnect.query('mycc', 'getDeviceByID', ['100']);
    response = JSON.parse(response);
    console.log('response is ' + response);
    console.log('id is ' + response.id);
    console.log('end');
};

exec();
