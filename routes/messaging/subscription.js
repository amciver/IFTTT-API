var express = require('express');
var router = express.Router();
var azure = require('azure');

// set up azure storage
var azure_storage = require('azure-storage');
var entityGenerator = azure_storage.TableUtilities.entityGenerator;
var storageTable = 'vehicle';
var storagePartition = 'speed';
var tableSvc = azure.createTableService();

//used to generate uuid for the table RowKey
var uuid = require('node-uuid');

// set up service bus topic/subscription
var connectionString = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=RootManagerSharedAccessKey;SharedAccessKey=8dhjlMuBYr6ck4QRG0HGttktDZLe6EkcucD0Gjmyp9A=;";
var topic = "iftttmessagestopic";
var subscription = "IFTTTBMWMessagesSubscription";

var serviceBusService = azure.createServiceBusService(connectionString);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BMW IFTTT SUBSCRIPTION' });
});


router.get('/v1/messages/purge', function(req, res, next) {
  res.sendStatus(200);
});

/* GET messages. */
router.get('/v1/messages', function(req, res, next) {
  getMessages(res);
  //res.sendStatus(200);
});

function getMessages(res){

 serviceBusService.receiveSubscriptionMessage(topic, subscription, function(error, receivedMessage){
    if(!error){
            console.log("func:getMessages() message received [" + JSON.stringify(receivedMessage) + "]");
            
            var message = JSON.parse(receivedMessage.body);
            var speed = message.speed;
            var triggeredTime = message.triggeredTime;

            console.log("func:getMessages() data extracted [" + speed + "], [" + triggeredTime + "]");

            var task = {
              PartitionKey: entityGenerator.String(storagePartition),
              RowKey: entityGenerator.String(uuid.v4()),
              data: entityGenerator.String(speed),
              triggered: entityGenerator.String(triggeredTime)
             //entryDate: entityGenerator.DateTime(new Date(Date.UTC(2015, 6, 20))),
            };
    tableSvc.insertEntity(storageTable, task, function (error, result, response) {
      if(!error){
          console.log("func:getMessages() message [" + receivedMessage + "] successfully processed")
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