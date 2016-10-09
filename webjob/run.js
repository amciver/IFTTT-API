//var express = require('express');
//var router = express.Router();
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

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'BMW IFTTT SUBSCRIPTION' });
// });

// router.get('/v1/messages/purge', function(req, res, next) {
//   res.sendStatus(200);
// });

/* GET messages. */
router.get('/v1/messages/retrieve', function(req, res, next) {
    checkMessages();
//getMessages(res);
//res.sendStatus(200);
});

var checkMessages = function () {
    serviceBusService.receiveSubscriptionMessage(topic, subscription)
        //serviceBusService.receiveSubscriptionMessage(topic, subscription, function (error, receivedMessage))
        .then(processMessage)
        .catch(processError)
        .finally(setNextCheck);
};

var processMessage = function (error, receivedMessage) {
    if (!error) {
        console.log("message [" + receivedMessage.brokerProperties.MessageId + "] received [" + JSON.stringify(receivedMessage) + "]")

        var message = JSON.parse(receivedMessage.body)
        var speed = message.speed
        var triggeredTime = message.triggeredTime
        var messageId = message.brokerProperties.MessageId

        console.log("data extracted speed:[" + speed + "], triggeredTime:[" + triggeredTime + "]")

        var task = {
            PartitionKey: entityGenerator.String(storagePartition),
            RowKey: entityGenerator.String(uuid.v4()),
            MessageId: entityGenerator.String(messageId),
            Data: entityGenerator.String(speed),
            Triggered: entityGenerator.String(triggeredTime)
        }
        console.log("task created for table insertion [" + task.stringify + "]")

        tableSvc.insertEntity(storageTable, task, function (error) {
            if (!error) {
                console.log("message [" + task.MessageId + "] successfully processed + inserted")
                res.status(200).send("{\"messageId\":\"" + task.MessageId + "\"}")
            }
            else {
                console.log("message [" + task.MessageId + "] processed; insertion failed")
                console.error(error)
                res.sendStatus(500)
            }
        })
    }
    else {
        console.error(error)
    }
}

var processError = function (reason) {
    console.log("Error:");
    console.log(reason);
}

var setNextCheck = function () {
    setTimeout(checkMessages, 1000);
}

checkMessages();