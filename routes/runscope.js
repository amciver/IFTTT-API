var express = require('express');
var router = express.Router();

/* GET runscope definition. */
router.get('/', function(req, res) {
  res.send('This is the runscope API');
});

/* GET runscope status. */
router.get('/status', function(req, res) {
  res.json({"status": "available"});
});

module.exports = router;
