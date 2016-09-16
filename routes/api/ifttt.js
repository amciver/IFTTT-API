var express = require('express');
var router = express.Router();

//set up azure storage
var azure = require('azure-storage');
var storageTable = 'vehicle';
var storagePartition = 'speed';

//set up the azure table service based on server credentials
var tableSvc = azure.createTableService('blah', 'blah');
var entityGenerator = azure.TableUtilities.entityGenerator;

//used to generate uuid for the table RowKey
var uuid = require('node-uuid');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BMW IFTTT API' });
});

/* GET BMW IFTTT definition */
router.get('/v1', function(req, res) {
  res.send('You are using v1 of the BMW IFTTT API');
});
  
/* GET BMW IFTTT API status */
router.get('/v1/status', function(req, res) {
  res.json({"status": "available"});
});

/* POST speed to BMW IFTTT API via body */
router.post('/v1/speed', function(req, res) {
    var speed = req.body.speed;
    var triggeredTime = req.body.triggered;
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
});

module.exports = router;
