var express = require('express');
var router = express.Router();
var azure = require('azure');

// set up azure storage
var azure_storage = require('azure-storage');
var entityGenerator = azure_storage.TableUtilities.entityGenerator;
var storageTable = 'vehicle';
var storagePartition = 'speed';
var tableSvc = azure.createTableService('comexperimentapis', '5GLcDhmszAV59vzEMXljPizHtmFWp0x+d+Srzxtg5ShgYRJDjP66EM7zL4YQHqZDh5BHExnSF9MnWMx0Zdbpcg==');

//used to generate uuid for the table RowKey
var uuid = require('node-uuid');

// set up service bus topic/subscription
var connectionString = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=RootManagerSharedAccessKey;SharedAccessKey=8dhjlMuBYr6ck4QRG0HGttktDZLe6EkcucD0Gjmyp9A=";
var topic = "ifttt_messages_topic";
var subscription = "ifttt_messages_subscription";

var serviceBusService = azure.createServiceBusService(connectionString);

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'BMW IFTTT SUBSCRIPTION' });
// });

// router.get('/v1/messages/purge', function(req, res, next) {
//   res.sendStatus(200);
// });

/* GET messages. */
router.get('/v1/messages/retrieve', function(req, res, next) {
    checkMessages(res);
//getMessages(res);
//res.sendStatus(200);
});

var checkMessages = function (res) {
    //serviceBusService.receiveSubscriptionMessage(topic, subscription)
        serviceBusService.receiveSubscriptionMessage(topic, subscription, function (error, receivedMessage) {
            if (!error) {
                var messageId = receivedMessage.brokerProperties.MessageId

        console.log("message [" + messageId + "] received [" + JSON.stringify(receivedMessage) + "]")
        
        var message = JSON.parse(receivedMessage.body)
        
        console.log("parsed message body ["+JSON.stringify(message)+"]")

        var speed = message.speed
        var triggeredTime = message.triggeredTime

        console.log("data extracted speed:[" + speed + "], triggeredTime:[" + triggeredTime + "]")

        var task = {
            PartitionKey: entityGenerator.String(storagePartition),
            RowKey: entityGenerator.String(uuid.v4()),
            MessageId: entityGenerator.String(messageId),
            Data: entityGenerator.String(speed),
            Triggered: entityGenerator.String(triggeredTime)
        }
        console.log("task created for table insertion [" + JSON.stringify(task) + "]")

        tableSvc.insertEntity(storageTable, task, function (error) {
            if (!error) {
                console.log("message [" + task.MessageId.MessageId._ + "] successfully processed + inserted")
                res.status(200).send("{\"messageId\":\"" + task.MessageId._ + "\"}")
            }
            else {
                console.log("message [" + task.MessageId._ + "] processed; insertion failed")
                console.error(error)
                res.sendStatus(500)
            }
        })
    }
    else {
        console.error(error)
    }
        }
        )};


var processError = function (reason) {
    console.log("Error:");
    console.log(reason);
}

var setNextCheck = function () {
    setTimeout(checkMessages, 1000);
}

//checkMessages();

module.exports = router;