var express = require('express');
var router = express.Router();

//set up azure storage
var azure = require('azure-storage');
var storageAccount = 'comexperimentapis'; 
var storageTable = 'vehicle';
var storagePartition = 'status';
var accessKey = '5GLcDhmszAV59vzEMXljPizHtmFWp0x+d+Srzxtg5ShgYRJDjP66EM7zL4YQHqZDh5BHExnSF9MnWMx0Zdbpcg==';

//set up the azure table service based on credentials
var tableSvc = azure.createTableService(storageAccount, accessKey);
var entityGenerator = azure.TableUtilities.entityGenerator;

//used to generate uuid for the table RowKey
var uuid = require('node-uuid');

/* GET runscope definition. */
router.get('/', function(req, res) {
  
var task = {
              PartitionKey: entityGenerator.String(storagePartition),
              RowKey: entityGenerator.String(uuid.v4()),
              data: entityGenerator.String('available'),
             //dueDate: entityGenerator.DateTime(new Date(Date.UTC(2015, 6, 20))),
            };
tableSvc.insertEntity(storageTable ,task, function (error, result, response) {
  if(!error){
    // Entity inserted
      res.json({"status": "available"});
  }
});
  //res.send('This is the runscope API');
});

/* GET runscope status. */
router.get('/status', function(req, res) {
  res.json({"status": "available"});
});

module.exports = router;
