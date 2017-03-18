//var express = require('express');
//var router = express.Router();
var azure_sb = require('azure-sb');

// set up azure storage
var azure_storage = require('azure-storage');
var entityGenerator = azure_storage.TableUtilities.entityGenerator;
var storageTable = 'vehicle';
var storagePartition = 'speed';
var tableSvc = azure.createTableService('comexperimentapis', 'key');

//used to generate uuid for the table RowKey
var uuid = require('node-uuid');

// set up service bus topic/subscription
var connectionStringManage = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=ifttt_policy_manage;SharedAccessKey=key";
var topic = "ifttt_messages_topic";
var subscription = "ifttt_messages_subscription";

var serviceBusService = azure_sb.createServiceBusService(connectionStringManage);

function checkMessages() {
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
        console.log("task created for table insertion [" + task.stringify + "]")

        tableSvc.insertEntity(storageTable, task, function (error) {
            if (!error) {
                console.log("message [" + task.MessageId + "] successfully processed + inserted")
            }
            else {
                console.log("message [" + task.MessageId + "] processed; insertion failed")
                console.error(error)
            }
        })
    }
    else {
        console.error(error)
    }
})};

checkMessages();