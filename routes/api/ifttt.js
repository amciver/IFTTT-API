var express = require('express');
var router = express.Router();
var azure = require('azure');

//set up the azure table service based on server credentials
var tableSvc = azure.createTableService();
//var entityGenerator = azure.TableUtilities.entityGenerator;


//var ns = 'com-experiment-messaging';
//var serviceBusService = azure.createServiceBusService(ns);

var connectionString = "Endpoint=sb://com-experiment-messaging.servicebus.windows.net/;SharedAccessKeyName=RootManagerSharedAccessKey;SharedAccessKey=8dhjlMuBYr6ck4QRG0HGttktDZLe6EkcucD0Gjmyp9A=;";
var topic = "iftttmessagestopic";

//make sure that the topic exists and was not removed; creation taking place within portal
var serviceBusService = azure.createServiceBusService(connectionString);
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
  res.render('index', { title: 'BMW IFTTT' });
});

/* GET BMW IFTTT definition */
router.get('/api/v1', function(req, res) {
  res.send('You are using v1 of the BMW IFTTT API');
});
  
/* GET BMW IFTTT API status */
router.get('/api/v1/status', function(req, res) {
  res.json({"status": "available"});
});

/* POST speed to BMW IFTTT API via body */
router.post('/api/v1/speed', function(req, res) {
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
        console.log("message [" + message.brokerProperties.message + "] successfully posted");
        res.sendStatus(200);
      }
    });
});

module.exports = router;
