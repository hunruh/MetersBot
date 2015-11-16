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


var under5 = [
	"Some say that anything less than 20 minutes shouldn't count as a workout. ",
	"Less than 5k? Are you sure that's worth adding? ",
	"You think that's enough to get you to the million? ",
	"Next time try aiming for something north of 5k. ",
	"Christ has more chill than you have pull (on the erg, but also with girls). ",
	"Harvard isn't taking days off. ",
	"Pete Solazzo already did more meters than you. ",
	"I'm going to stop responding to you if you keep logging less than 5k. ",
	"Would Matt Rung be proud of that? ",
	"I know for a fact Kelly Albanir's splits are faster than that. ",
	"You think that's enough meters? I forwarded your transfer app to Dartmouth for you. ",
	"The other day Mav ran 22 miles and you think this is enough? ",
	"Chasity Royer got up at 5am this morning to log meters and this is the best you can do? "
]

var personalResp = [
	"One time Trevor shit all over the second floor of 503. ",
	"Danny J and Claire had anal sex. ",
	"Alex LaViolette had group sex with Andreas. ",
	"Sometimes I hear Lambo's bed shake when he jerks off late at night.",
	"Is that video of Olav on the 502 couch still around? "
]

var creds = require('./google-creds.json');

app.post('/', function (req, res) {

  console.log("hit");

  //Variable definitons 
  var resp = new twilio.TwimlResponse();
  var fromNum = req.body.From.replace("+","");
  var body =  req.body.Body.toLowerCase();
  console.log(fromNum);

  //Parse the received message
  exe = messageParse(body)
  console.log('exe');
  //Execution
  retBody = execute(fromNum, exe);

  //Creating the message to be sent back
 

  resp.message(retBody);

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


filterInt = function (value) { 
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
     return Number(value); 
  }
   return NaN; 
}

//used to parse incoming messages and generate meaningful commands
function messageParse(message){
    
    message = message.toLowerCase();
    message = message.trim();
    message = message.replace(/\s\s+/g, ' ');
    
    var patt = new RegExp("[0-9]+k?");
	var parsed = message.split(" ");

    
	
	//single word command (stats, add, or clear)
	if (parsed.length == 1){

		//message is a stats command
	    if(message == "stats" || message == "stat"){
	        return ["stats"];
	    }

	    //clear
	    if(message == "clear"){
	        return ["write","0"];
	    }

	    // add comand using "k" notation 
	    if(patt.test(parsed[0])){
	        var dist = parsed[0].replace('k','000');
	        if(isNaN(filterInt(dist)))
	        {
	            return(['error']);
	        }
	        return ["add",dist];
	    }

	    // add command using strict notation 
	    if(!isNaN(filterInt(parsed[0]))){
	        return ["add",message];
	    }
	}

	if (parsed.length == 2){
		//stats
		if  (parsed[0] == "stats" || parsed[0] == "stat"){
            num = lastName2Num[parsed[1]];
            if (isNaN(num)){
                return ['error'];
            }
            return ["stats",num];
		}
		//biking

		if  (parsed[0] == "bike"){
            time = parsed[1].replace("min","");
            dist = parseInt(time) * 200;
            return messageParse(String(dist));
		}
		//tanking 
		if  (parsed[0] == "tank"){
            time = parsed[1].replace("min","");
            dist = parseInt(time) * 240;
            return messageParse(String(dist));
		}
		//running 
		if  (parsed[0] == "run"){
            time = parsed[1].replace("min","");
            dist = parseInt(time) * 240;
            return messageParse(String(dist));
		}
	};
	
	return ["error"]
}


function execute(user, exe){
	//add command 
	if(exe[0] == 'add'){
		ret = add(user, exe[1]);
		return ret;
	}
	//write command
	if(exe[0] == 'write'){
		write(user, exe[1]);
		return 'Your meters for today have been set to 0';
	}
	//stats command 
	if(exe[0] == 'stats'){
		stats(user, exe[1]);
		return 'Stats is not currently implemented. Yell at Matt to fix it.';
	}
	//error 
	if(exe[0] == 'error'){
		return "I didn't understand that. Check the google-doc for instructions, or simply text me the number or meters you would like me to log."
	}
}

//add function 
function add(user,arg){
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
	      	rowNum = findRow(user,rows);
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

	if (user == "15188218234"){
		return ("Alan won a medal at sprints last year. Your medal. Also, I logged your meters.")
	}

	if (user == "15187648929" || user == "17753035556" || user == "17817998788" || user == "12039188738" || user == "17049999791"){
		var i = Math.floor(Math.random()*personalResp.length);
		return (personalResp[i] + "I successfully logged your " + String(arg) + " meters");
	}

	if (arg < 5000){
		var i = Math.floor(Math.random()*under5.length);
		return (under5[i] + "I successfully logged your " + String(arg) + " meters");
	}
	return ("I successfully logged your " + String(arg) + " meters");


}

//write function
function write(user, arg){
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
	      	rowNum = findRow(user,rows);
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
		if(rows[key][2] == number){
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
	'17204700939' : 'Adam Tavel',
	'18457415780' : 'Alan Held',
	'14692585797' : 'Alex Chang',
	'17817998788' : 'Alex LaViolette',
	'12066604215' : 'Andrew Broom',
	'14438678954' : 'Andrew Thomas',
	'14693210006' : 'Andy Kim',
	'16092343421' : 'Ben Gassaway',
	'16073424575' : 'Bill Brumsted',
	'12533304875' : 'Brynn Munday',
	'18606725827' : 'Callie Carew-Miller',
	'17039556736' : 'Cameron Schultz',
	'15165877410' : 'Carl Finkbeiner',
	'17326145244' : 'Chris Mayro',
	'17085673221' : 'Christ Dineff',
	'12072729861' : 'Christopher Kerber',
	'14126522887' : 'Connor Hayes',
	'17044883861' : 'Conor Jones',
	'15187648929' : 'Danny Janeczko',
	'16316552811' : 'Danny O\'Neill',
	'19086982342' : 'Ed Bao',
	'17753035556' : 'Erik Johnson',
	'19186063232' : 'Gabrielle Steinl',
	'15188218234' : 'Hannah Cashen',
	'18012449440' : 'Harrison Unruh',
	'16072806062' : 'Henry Ellis',
	'15165927321' : 'Ian Sigal',
	'17819279838' : 'Jack Evitts',
	'18589453793' : 'Jack Piegza',
	'16177104466' : 'Jack Ruske',
	'18588298363' : 'Jake Morrison',
	'12037310783' : 'Jake Snyder',
	'16105853672' : 'James McManus',
	'16122478571' : 'Joe Hassler',
	'12679072554' : 'Joe Pinnola-Vizza',
	'12818652555' : 'Johnnie Sinclair',
	'17738964413' : 'Lukasz Rzycki',
	'18457022769' : 'Luke Sendelbach',
	'13055885040' : 'Manny Sanchez',
	'12623574715' : 'Marco Bustamante',
	'17049999791' : 'Matt White',
	'17329968109' : 'Maxx McClelland',
	'15858312246' : 'Molly Rochford',
	'17168640330' : 'Michael Battaglia',
	'14012191176' : 'Nathan Lambert',
	'17135012181' : 'Nick Anderson',
	'17817081121' : 'Nigel Harriman',
	'19017363880' : 'Olav Imsdahl',
	'17322413445' : 'Paul Clauss',
	'19139408877' : 'Peter Shelton',
	'12037278113' : 'Peter Solazzo',
	'15087336749' : 'Reid Williamson',
	'16077938332' : 'Rori Henderson',
	'12067241787' : 'Rowan Callahan',
	'15167329495' : 'Ryan Peters',
	'12039188738' : 'Trevor Frey',
	'17818794455' : 'Trevor Kahl',
	'18572948734' : 'Victor Ordóñez',
	'15167495433' : 'Will Oprea'
};

var lastName2Num = {
	'harriman' : '+17817081121',
	'williamson' : '+15087336749',
	'ruske' : '+16177104466',
	'evitts' : '+17819279838',
	'ordonez' : '+18572948734',
	'monica ordonez' : '+18572948737',
	'laviolette' : '+17817998788',
	'richartz' : '+18603913834',
	'frey' : '+12039188738',
	'solazzo' : '+12037278113',
	'carew-miller' : '+18606725827',
	'snyder' : '+12037310783',
	'sofair' : '+12038230110',
	'lambert' : '+14012191176',
	'o\'neill' : '+16316552811',
	'oprea' : '+15167495433',
	'finkbeiner' : '+15165877410',
	'peters' : '+15167329495',
	'sigal' : '+15165927321',
	'sourial' : '+15166508498',
	'cashen' : '+15188218234',
	'ellis' : '+16072806062',
	'held' : '+18457415780',
	'janeczko' : '+15187648929',
	'sendelbach' : '+18457022769',
	'henderson' : '+16077938332',
	'rochford' : '+15858312246',
	'szegletes' : '+12014033213',
	'battaglia' : '+17168640330',
	'clauss' : '+17322413445',
	'mayro' : '+17326145244',
	'gassaway' : '+16092343421',
	'royer' : '+19738006498',
	'hayes' : '+14126522887',
	'pinnola-vizza' : '+12679072554',
	'keiper' : '+12672728352',
	'mcmanus' : '+16105853672',
	'bao' : '+19086982342',
	'sanchez' : '+13055885040',
	'schultz' : '+17039556736',
	'jones' : '+17044883861',
	'kim' : '+14693210006',
	'chang' : '+14692585797',
	'sinclair' : '+12818652555',
	'anderson' : '+17135012181',
	'shelton' : '+19139408877',
	'dineff' : '+17085673221',
	'steinl' : '+19186063232',
	'bustamante' : '+12623574715',
	'hassler' : '+16122478571',
	'lecorgne' : '+16143072426',
	'ryzcki' : '+17738964413',
	'tavel' : '+17204700939',
	'johnson' : '+17753035556',
	'giannini' : '+14158528816',
	'unruh' : '+18012449440',
	'thomas' : '+14438678954',
	'piegza' : '+18589453793',
	'murphy' : '+13039066240',
	'munday' : '+12533304875',
	'white' : '+17049999791',
	'imsdahl' : '+19017363880',
	'callahan' : '+12067241787',
	'broom' : '+12066604215'
}

var colMap = {
	'Nov 04' : 5,
	'Nov 05' : 5,
	'Nov 06' : 5,
	'Nov 07' : 5,
	'Nov 08' : 5,
    'Nov 09' : 6,
	'Nov 10' : 7,
	'Nov 11' : 8,
	'Nov 12' : 9,
	'Nov 13' : 10,
	'Nov 14' : 11,
	'Nov 15' : 12,
	'Nov 16' : 13,
	'Nov 17' : 14,
	'Nov 18' : 15,
	'Nov 19' : 16,
	'Nov 20' : 17,
	'Nov 21' : 18,
	'Nov 22' : 19,
	'Nov 23' : 20,
	'Nov 24' : 21,
	'Nov 25' : 22,
	'Nov 26' : 23,
	'Nov 27' : 24,
	'Nov 28' : 25,
	'Nov 29' : 26,
	'Nov 30' : 27,
	'Dec 01' : 28,
	'Dec 02' : 29,
	'Dec 03' : 30,
	'Dec 04' : 31,
	'Dec 05' : 32,
	'Dec 06' : 33,
	'Dec 07' : 34,
	'Dec 08' : 35,
	'Dec 09' : 36,
	'Dec 10' : 37,
	'Dec 11' : 38,
	'Dec 12' : 39,
	'Dec 13' : 40,
	'Dec 14' : 41,
	'Dec 15' : 42,
	'Dec 16' : 43,
	'Dec 17' : 44,
	'Dec 18' : 45,
	'Dec 19' : 46,
	'Dec 20' : 47,
	'Dec 21' : 48,
	'Dec 22' : 49,
	'Dec 23' : 50,
	'Dec 24' : 51,
	'Dec 25' : 52,
	'Dec 26' : 53,
	'Dec 27' : 54,
	'Dec 28' : 55,
	'Dec 29' : 56,
	'Dec 30' : 57,
	'Dec 31' : 58,
	'Jan 01' : 59,
	'Jan 02' : 60,
	'Jan 03' : 61,
	'Jan 04' : 62,
	'Jan 05' : 63,
	'Jan 06' : 64,
	'Jan 07' : 65,
	'Jan 08' : 66,
	'Jan 09' : 67
}

