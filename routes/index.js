var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Mix Music Api \n\nhello world!');
});

module.exports = router;