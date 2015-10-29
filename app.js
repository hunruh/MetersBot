var twilio = require('twilio'),
    client = twilio('ACddbbe028de40ffa8ba37215f5fcb9f2d', '81ed19e7d0e7a0dc1a1bd77633af54d8');
 
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
 
var spreadsheet = require('edit-google-spreadsheet');




var kerberisms = [
	"Be the human adjustment.",
	"Be the human adjustment.",
	"You are the system.",
	"You are the system.",
	"Pull harder"
];

var creds = require('./google-creds.json');

app.post('/', function (req, res) {

  console.log("hit");
  var resp = new twilio.TwimlResponse();
  var fromNum = req.body.From;
  var body = req.body.Body;
  var i = Math.floor((Math.random() * 4));
  console.log(fromNum);
  addToSheet(2,2,body);
  resp.message("You must be: " + identity_map[fromNum] + ". " + kerberisms[i]);

  res.writeHead(200, {
    'Content-Type':'text/xml'
  });
  res.end(resp.toString());
});


app.get('/', function(req, res) {
  res.send('hello world');
});

 
var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port %d', server.address().port);
});


function bodyDecode(message){

}

function addToSheet(i, j, x){
	spreadsheet.load({
	    debug: true,
	    spreadsheetId: '1KBDbaY2OQ83Aoy2zjEIBmFmysWlgGJSm4g-UMuKdgJo',
	    worksheetName: 'Meters',

	    oauth : {
	        email: '28228689032-cigacjpu3j12joi32l71d1e0q1vt60kk@developer.gserviceaccount.com',
	        keyFile: 'keys.pem'
	    }

	}, function sheetReady(err, spreadsheet) {

	    if (err) throw err;
	 
	    spreadsheet.add({ 2: { 2: x } });

	    spreadsheet.send(function(err) {
	    if(err) throw err;
	    });

	});
}

//used to parse incoming messages and generate meaningful commands
filterInt = function (value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
}

function bodyParse(message){
    var patt = new RegExp("[0-9]*k");
	var parsed = message.split(" ");
	
	//single word command (stats, add, or clear)
	if (parsed.length == 1){

		//message is a stats command
	    if(message == "stats"){
	        return ["stats","user"];
	    }

	    //cleae
	    if(message == "stats"){
	        return ["clear","0"];
	    }

	    // add comand using "k" notation 
	    if(patt.test(parsed[0])){
	        var dist = parsed[0].replace('k','000');
	        return ["add",dist];
	    }

	    // add command using strict notation 
	    if(!isNaN(filterInt(parsed[0]))){
	        return ["add",message];
	    }

	    //error 
	    else{
	        return ["error"];
	    }
	}
	
	return parsed;
}

var identity_map = {
'+17204700939' : 'Adam Tavel',
'+18457415780' : 'Alan Held',
'+14692585797' : 'Alex Chang',
'+17817998788' : 'Alex LaViolette',
'+12066604215' : 'Andrew Broom',
'+14438678954' : 'Andrew Thomas',
'+14693210006' : 'Andy Kim',
'+16092343421' : 'Ben Gassaway',
'+16073424575' : 'Bill Brumsted',
'+12533304875' : 'Brynn Munday',
'+18606725827' : 'Callie Carew-Miller',
'+17039556736' : 'Cameron Schultz',
'+15165877410' : 'Carl Finkbeiner',
'+17326145244' : 'Chris Mayro',
'+17085673221' : 'Christ Dineff',
'+12072729861' : 'Christopher Kerber',
'+14126522887' : 'Connor Hayes',
'+17044883861' : 'Conor Jones',
'+15187648929' : 'Danny Janeczko',
'+16316552811' : 'Danny O\'Neill',
'+19086982342' : 'Ed Bao',
'+17753035556' : 'Erik Johnson',
'+19186063232' : 'Gabrielle Steinl',
'+15188218234' : 'Hannah Cashen',
'+18012449440' : 'Harrison Unruh',
'+16072806062' : 'Henry Ellis',
'+15165927321' : 'Ian Sigal',
'+17819279838' : 'Jack Evitts',
'+18589453793' : 'Jack Piegza',
'+16177104466' : 'Jack Ruske',
'+18588298363' : 'Jake Morrison',
'+12037310783' : 'Jake Snyder',
'+16105853672' : 'James McManus',
'+16122478571' : 'Joe Hassler',
'+12679072554' : 'Joe Pinnola-Vizza',
'+12818652555' : 'Johnnie Sinclair',
'+17738964413' : 'Lukasz Rzycki',
'+18457022769' : 'Luke Sendelbach',
'+13055885040' : 'Manny Sanchez',
'+12623574715' : 'Marco Bustamante',
'+17049999791' : 'Matt White',
'+17329968109' : 'Maxx McClelland',
'+15858312246' : 'Molly Rochford',
'+17168640330' : 'Michael Battaglia',
'+14012191176' : 'Nathan Lambert',
'+17135012181' : 'Nick Anderson',
'+17817081121' : 'Nigel Harriman',
'+19017363880' : 'Olav Imsdahl',
'+17322413445' : 'Paul Clauss',
'+19139408877' : 'Peter Shelton',
'+12037278113' : 'Peter Solazzo',
'+15087336749' : 'Reid Williamson',
'+16077938332' : 'Rori Henderson',
'+12067241787' : 'Rowan Callahan',
'+15167329495' : 'Ryan Peters',
'+12039188738' : 'Trevor Frey',
'+17818794455' : 'Trevor Kahl',
'+18572948734' : 'Victor Ordóñez',
'+15167495433' : 'Will Oprea'
};
