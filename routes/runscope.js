var express = require('express');
var router = express.Router();

//set up azure storage
var azure = require('azure-storage');
var tableSvc = azure.createTableService();
var entityGenerator = azure.TableUtilities.entityGenerator;

/* GET runscope definition. */
router.get('/', function(req, res) {
  
var task = {
              PartitionKey: entityGenerator.String('status'),
              RowKey: entityGenerator.String('1'),
              data: entityGenerator.String('available'),
             //dueDate: entityGenerator.DateTime(new Date(Date.UTC(2015, 6, 20))),
            };
tableSvc.insertEntity(,task, function (error, result, response) {
  if(!error){
    // Entity inserted
  }
});
  res.send('This is the runscope API');
});

/* GET runscope status. */
router.get('/status', function(req, res) {
  res.json({"status": "available"});
});

module.exports = router;
