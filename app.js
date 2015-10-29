var twilio = require('twilio'),
    client = twilio('ACddbbe028de40ffa8ba37215f5fcb9f2d', '81ed19e7d0e7a0dc1a1bd77633af54d8'),
    cronJob = require('cron').CronJob;
 
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
 
 
var kerberisms = [
	"Be the human adjustment",
	"Swing the body",
	"Get your fucking blade in",
	"There's no helping you. I'm not sorry",
	"Just learn how to fucking pull"
];

app.post('/', function (req, res) {
  var resp = new twilio.TwimlResponse();
  var fromNum = req.body.From;
  var body = req.body.Body;
  console.log(fromNum);
  console.log(body);

  var i = Math.floor((Math.random() * 4));
  resp.message(kerberisms[i]);
  res.writeHead(200, {
    'Content-Type':'text/xml'
  });
  res.end(resp.toString());
});


app.get('/', function(req, res) {
  res.send('hello world');
});

 
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});