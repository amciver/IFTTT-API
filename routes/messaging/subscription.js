var express = require('express');
var router = express.Router();
var azure = require('azure');

// set up azure storage
var azure_storage = require('azure-storage');
var entityGenerator = azure_storage.TableUtilities.entityGenerator;
var storageTable = 'vehicle';
var storagePartition = 'speed';
var tableSvc = azure.createTableService('comexperimentapis', '');

//used to generate uuid for the table RowKey
var uuid = require('node-uuid');

// set up service bus topic/subscription
var connectionString = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=RootManagerSharedAccessKey;SharedAccessKey=";
var topic = "ifttt_messages_topic";
var subscription = "ifttt_messages_subscription";

var serviceBusService = azure.createServiceBusService(connectionString);

/* GET messages. */
router.get('/v1/messages/retrieve', function (req, res, next) {
    serviceBusService.receiveSubscriptionMessage(topic, subscription, function (error, receivedMessage) {
        if (!error) {
            var messageId = receivedMessage.brokerProperties.MessageId
            console.log("message [" + messageId + "] being returned [" + JSON.stringify(receivedMessage) + "]")

            res.status(200).send(receivedMessage);
        }
        else {
            console.error(error)
            res.status(500).send(error)
        }

        //res.status(200).send("{\"messageId\":\"" + task.MessageId._ + "\"}")
        //var message = JSON.parse(receivedMessage.body)

    })});

module.exports = router;