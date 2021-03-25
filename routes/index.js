var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/user', function(req, res, next) {
  res.json({ name: 'xx' });
});

router.get('/userList', function(req, res, next) {
  res.json({ success: true, message: '', data: [] });
})

module.exports = router;
