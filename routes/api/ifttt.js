var express = require('express');
var router = express.Router();
var azure = require('azure');

//used to generate uuid for MessageId
var uuid = require('node-uuid');

//set up the azure table service based on server credentials
var tableSvc = azure.createTableService('comexperimentapis', '');

var connectionStringManage = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=ifttt_policy_manage;SharedAccessKey=GS91W8OBbkxAUS4wlHNNyZO0Ud7KAjqqGXTL2lkhGe0="
var topic = "ifttt_messages_topic";

var connectionStringSend = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=ifttt_policy_send;SharedAccessKey=EHp9GRr27PaXl62RQ7cuEQOf9QVss7t42ODnjafziWI=";

//make sure that the topic exists and was not removed; creation taking place within portal
var serviceBusService = azure.createServiceBusService(connectionStringManage);
serviceBusService.createTopicIfNotExists(topic ,function(error){
    if(!error){
        console.log('topic [' + topic  + '] successfully created and/or already exists');
    }
    else {
        console.error('topic [' + topic  + '] creation has failed; [' + error + ']');
    }
})

/* ROUTES DEFS  --------------------------------------------------------------------------*/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IFTTT' });
});

router.get('/testing', function(req, res, next) {
  res.send('TESTING');
});

/* GET IFTTT definition */
router.get('/v1', function(req, res) {
  res.send('You are using v1 of the IFTTT API');
});
  
/* GET IFTTT API status */
router.get('/v1/status', function(req, res) {
  res.json({"status": "available"});
});

/* POST speed to IFTTT API via body */
router.post('/v1/speed', function(req, res) {
    var speed = req.body.speed;
    var triggeredTime = req.body.triggered;
    var message = {
      body: "{\"speed\":\"" + speed + "\", \"triggeredTime\":\"" + triggeredTime + "\"}",
      brokerProperties: {
        MessageId: uuid.v4()
      }
    }    

    console.log("posting message ["+ message.brokerProperties.MessageId +"] with body [" + message.body + "]")

    //place a message on service bus to get consumed
    serviceBusService.sendTopicMessage(topic, message, function(error) {
      if (error) {
        console.log("error sending message [" + message.brokerProperties.MessageId + "]");
        console.error(error);
      }
      else {
        console.log("message [" + message.brokerProperties.MessageId + "] successfully posted");
        res.sendStatus(200);
      }
    });
});

module.exports = router;
