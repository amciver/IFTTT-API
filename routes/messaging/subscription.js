var express = require('express');
var router = express.Router();
var azure = require('azure');

// set up azure storage
var azure_storage = require('azure-storage');
var entityGenerator = azure_storage.TableUtilities.entityGenerator;
var storageTable = 'vehicle';
var storagePartition = 'speed';
var tableSvc = azure.createTableService();

// set up service bus topic/subscription
var connectionString = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=RootManagerSharedAccessKey;SharedAccessKey=8dhjlMuBYr6ck4QRG0HGttktDZLe6EkcucD0Gjmyp9A=;";
var topic = "iftttmessagestopic";
var subscription = "IFTTTBMWMessagesSubscription";

var serviceBusService = azure.createServiceBusService(connectionString);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BMW IFTTT SUBSCRIPTION' });
});

/* GET messages. */
router.get('/v1/messages', function(req, res, next) {
  getMessages();
  res.render('index', { title: 'BMW IFTTT' });
});

function getMessages(){

 serviceBusService.receiveSubscriptionMessage(topic, subscription, function(error, receivedMessage){
    if(!error){
            var message = JSON.parse(receivedMessage);
            var speed = message.speed;
            var triggeredTime = message.triggeredTime;

            var task = {
              PartitionKey: entityGenerator.String(storagePartition),
              RowKey: entityGenerator.String(uuid.v4()),
              data: entityGenerator.String(speed),
              triggered: entityGenerator.String(triggeredTime)
             //entryDate: entityGenerator.DateTime(new Date(Date.UTC(2015, 6, 20))),
            };
    tableSvc.insertEntity(storageTable ,task, function (error, result, response) {
      if(!error){
          res.sendStatus(200);
      }
    });
        // message received and deleted
        console.log(receivedMessage);
    }
});
}
   

module.exports = router;





// var message = {
//     body: 'testing 1 2 3',
//     customProperties: {
//         customProp: 0
//     }
// }
// console.log(message);


// var subscriptions = serviceBusService.getSubscription(topic, subscription, function(error) {
//       if (error) {
//         console.log(error);
//       }
//       console.log(subscriptions);
//     });