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

  //Variable definitons 
  var resp = new twilio.TwimlResponse();
  var fromNum = req.body.From.replace("+","");
  var body =  req.body.Body.toLowerCase();
  var i = Math.floor((Math.random() * 4));
  console.log(fromNum);

  //Parse the received message
  exe = messageParse(body)

  //Execution
  execute(exe);

  //Creating the message to be sent back
  resp.message("You must be: " + identity_map[fromNum] + ". " + kerberisms[i]);
  //Send the message back to the orignal sender 
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



//used to parse incoming messages and generate meaningful commands
filterInt = function (value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
}

function messageParse(message){
    var patt = new RegExp("[0-9]*k");
	var parsed = message.split(" ");
	
	//single word command (stats, add, or clear)
	if (parsed.length == 1){

		//message is a stats command
	    if(message == "stats"){
	        return ["stats","user"];
	    }

	    //clear
	    if(message == "clear"){
	        return ["write","0"];
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

	if (parsed.length == 1){

		//biking
		//tanking 
		//running 
	};
	
	return parsed;
}


function execute(exe){
	//add command 
	if(exe[0] == 'add'){
		add(exe[1]);
		return 'success';
	}
	//write command
	if(exe[0] == 'write'){
		write(exe[1]);
		return 'success';
	}
	//stats command 
	if(exe[0] == 'stats'){
		stats(exe[1]);
		return 'success';
	}
	//error 
	if(exe[0] == 'error'){
		
	}
}

//add function 
function add(arg){
	spreadsheet.load({
	    debug: true,
	    spreadsheetId: '1IkSevctmMuBge3ORcrp_LAvnaFX9ssel_JsUHdbWGcA',
	    worksheetId: 'od6',

	    oauth : {
	        email: '28228689032-cigacjpu3j12joi32l71d1e0q1vt60kk@developer.gserviceaccount.com',
	        keyFile: 'keys.pem'
	    }

	}, function sheetReady(err, spreadsheet) {

	    if (err) throw err;

	    spreadsheet.receive(function(err, rows, info) {
	    	if(err) throw err;
	      	rowNum = findRow(17049999791,rows);
	      	colNum = findCol();

	      	//getting the current value 
	      	val = parseInt(rows[rowNum][colNum]);

	      	if(isNaN(val)){
	      		val = 0; 
	      	}

	      	console.log(arg);
	      	arg = parseInt(arg) + val;
	      	console.log(arg);

	 	 	//creating what will be sent 

	 	 	inObj = {};
	 	 	inObj[colNum] = arg;


	 	 	outObj = {};
	 	 	outObj[rowNum] = inObj;

	     	spreadsheet.add(outObj);

	     	//sending to the google sheet
	      	spreadsheet.send(function(err) {
	     	 	if(err) throw err;
	      	});
	    });
	});
}

//write function
function write(arg){
	spreadsheet.load({
	    debug: true,
	    spreadsheetId: '1IkSevctmMuBge3ORcrp_LAvnaFX9ssel_JsUHdbWGcA',
	    worksheetId: 'od6',

	    oauth : {
	        email: '28228689032-cigacjpu3j12joi32l71d1e0q1vt60kk@developer.gserviceaccount.com',
	        keyFile: 'keys.pem'
	    }

	}, function sheetReady(err, spreadsheet) {

	    if (err) throw err;

	    spreadsheet.receive(function(err, rows, info) {
	    	if(err) throw err;
	    	console.log(rows);
	      	rowNum = findRow(17049999791,rows);
	      	colNum = findCol();


	 	 	//creating what will be sent 
	 	 	inObj = {};
	 	 	inObj[colNum] = arg;


	 	 	outObj = {};
	 	 	outObj[rowNum] = inObj;

	     	spreadsheet.add(outObj);

	     	//sending to the google sheet
	      	spreadsheet.send(function(err) {
	     	 	if(err) throw err;
	      	});
	    });
	});
}




//stats function 
function stats(arg){

}


function findRow(number, rows){
	for (var key in rows){
		if(rows[key][1] == number){
			return parseInt(key); 
		}
	};

	return 666;
}

function findCol(){
	date = Date();
	date = date.substring(4,10);
	return(colMap[date]);

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

var colMap = {
	'Nov 04' : 4,
	'Nov 05' : 4,
	'Nov 06' : 4,
	'Nov 07' : 4,
	'Nov 08' : 4,
    'Nov 09' : 5,
	'Nov 10' : 6,
	'Nov 11' : 7,
	'Nov 12' : 8,
	'Nov 13' : 9,
	'Nov 14' : 10,
	'Nov 15' : 11,
	'Nov 16' : 12,
	'Nov 17' : 13,
	'Nov 18' : 14,
	'Nov 19' : 15,
	'Nov 20' : 16,
	'Nov 21' : 17,
	'Nov 22' : 18,
	'Nov 23' : 19,
	'Nov 24' : 20,
	'Nov 25' : 21,
	'Nov 26' : 22,
	'Nov 27' : 23,
	'Nov 28' : 24,
	'Nov 29' : 25,
	'Nov 30' : 26,
	'Dec 01' : 27,
	'Dec 02' : 28,
	'Dec 03' : 29,
	'Dec 04' : 30,
	'Dec 05' : 31,
	'Dec 06' : 32,
	'Dec 07' : 33,
	'Dec 08' : 34,
	'Dec 09' : 35,
	'Dec 10' : 36,
	'Dec 11' : 37,
	'Dec 12' : 38,
	'Dec 13' : 39,
	'Dec 14' : 40,
	'Dec 15' : 41,
	'Dec 16' : 42,
	'Dec 17' : 43,
	'Dec 18' : 44,
	'Dec 19' : 45,
	'Dec 20' : 46,
	'Dec 21' : 47,
	'Dec 22' : 48,
	'Dec 23' : 49,
	'Dec 24' : 50,
	'Dec 25' : 51,
	'Dec 26' : 52,
	'Dec 27' : 53,
	'Dec 28' : 54,
	'Dec 29' : 55,
	'Dec 30' : 56,
	'Dec 31' : 57,
	'Jan 01' : 58,
	'Jan 02' : 59,
	'Jan 03' : 60,
	'Jan 04' : 61,
	'Jan 05' : 62,
	'Jan 06' : 63,
	'Jan 07' : 64,
	'Jan 08' : 65,
	'Jan 09' : 66
}


//spreadsheet.load({
//	    debug: true,
//	    spreadsheetId: '1IkSevctmMuBge3ORcrp_LAvnaFX9ssel_JsUHdbWGcA',
//	    worksheetName: 'Meters',
//
//	    oauth : {
//	        email: '28228689032-cigacjpu3j12joi32l71d1e0q1vt60kk@developer.gserviceaccount.com',
//	        keyFile: 'keys.pem'
//	    }
//
//	}, function sheetReady(err, spreadsheet) {
//
//	    if (err) throw err;
//
//	    spreadsheet.receive(function(err, rows, info) {
//	    if(err) throw err;
//	      tmp = findRow(17049999791,rows);
//	      console.log(tmp);
///	    });
//
//	 
//	    spreadsheet.add({ 10: { 10: 42} });
//
//	    spreadsheet.send(function(err) {
//	    if(err) throw err;
//	    });
//
//	});