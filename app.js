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
	""
];


var under5 = [
	""
]

var personalResp = [
	""
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

	//cross <Hr> <time>|

	if (parsed.length == 2){
		//stats
		if  (parsed[0] == "stats" || parsed[0] == "stat"){
            num = lastName2Num[parsed[1]];
            if (isNaN(num)){
                return ['error'];
            }
            return ["stats",num];
		}

	};
	console.log(parsed)
	if (parsed.length == 3){
		if (parsed[0] == "cross"){
			console.log("HERREHRE")
			hr = parseFloat(parsed[1]); 
			time = parsed[2].replace("min","");
			console.log(hr)
			if(hr >= 65 && hr < 75){
				dist = parseInt(parseInt(time) * 240); 
				return messageParse(String(dist));
			}
			if(hr >= 75 && hr < 85){
				dist = parseInt(parseInt(time) * 250);
				console.log(dist)
				return messageParse(String(dist));
			}
			if(hr >= 85){
				dist = parseInt(parseInt(time) * 285.714);
				return messageParse(String(dist));
			}
		}
	}
	
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
	    spreadsheetId: '1qJJHt6QCVSt7vBh5HQ-jN4hTmNuCr2eTtd6bLsUXRqs',
	    worksheetId: 'od6',

	    oauth : {
	        email: '28228689032-cigacjpu3j12joi32l71d1e0q1vt60kk@developer.gserviceaccount.com',
	        keyFile: 'keys.pem'
	    }

	}, function sheetReady(err, spreadsheet) {

	    if (err) throw err;

	    spreadsheet.receive(function(err, rows, info) {
	    	if(err) throw err;
	    	console.log(user)
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

	      	console.log(rowNum)


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
	    spreadsheetId: '1qJJHt6QCVSt7vBh5HQ-jN4hTmNuCr2eTtd6bLsUXRqs',
	    worksheetId: 'od6',

	    oauth : {
	        email: '28228689032-cigacjpu3j12joi32l71d1e0q1vt60kk@developer.gserviceaccount.com',
	        keyFile: 'keys.pem'
	    }

	}, function sheetReady(err, spreadsheet) {

	    if (err) throw err;

	    spreadsheet.receive(function(err, rows, info) {
	    	if(err) throw err;
	    	console.log(user)
	      	rowNum = findRow(user,rows);
	      	colNum = findCol();

	      	console.log(rowNum)

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
	 '+17135012181' : 'anderson' ,
	 '+19086982342' : 'bao' ,
	 '+17168640330' : 'battaglia' ,
	 '+12066604215' : 'broom' ,
	 '+12623574715' : 'bustamante' ,
	 '+12067241787' : 'callahan' ,
	 '+14692585797' : 'chang' ,
	 '+16072806062' : 'ellis' ,
	 '+17819279838' : 'evitts' ,
	 '+15165877410' : 'finkbeiner' ,
	 '+16092971660' : 'fleurial' ,
	 '+12152068111' : 'foley' ,
	 '+12039188738' : 'frey' ,
	 '+16092343421' : 'gassaway' ,
	 '+14158528816' : 'giannini' ,
	 '+12064278288' : 'gibbons' ,
	 '+16122478571' : 'hassler' ,
	 '+18457415780' : 'held' ,
	 '+16077938332' : 'henderson' ,
	 '+19017363880' : 'imsdahl' ,
	 '+15187648929' : 'janeczko' ,
	 '+17753035556' : 'johnson' ,
	 '+12672728352' : 'keiper' ,
	 '+16505440660' : 'kost' ,
	 '+13132150708' : 'koszyk' ,
	 '+14012191176' : 'lambert' ,
	 '+17817998788' : 'laviolette' ,
	 '+16143072426' : 'lecorgne' ,
	 '+19178854730' : 'lee' ,
	 '+16783320754' : 'lipsky' ,
	 '+12158723329' : 'lunney' ,
	 '+17326145244' : 'mayro' ,
	 '+16105853672' : 'mcmanus' ,
	 '+12146498401' : 'mencke' ,
	 '+19412661604' : 'michel' ,
	 '+18482105095' : 'miksic' ,
	 '+12533304875' : 'munday' ,
	 '+16316552811' : 'o\'neill' ,
	 '+18572948737' : 'ordonez' ,
	 '+15167329495' : 'peters' ,
	 '+15168081310' : 'petrakis' ,
	 '+18589453793' : 'piegza' ,
	 '+12679072554' : 'pinnola-vizza' ,
	 '+18603913834' : 'richartz' ,
	 '+15858312246' : 'rochford' ,
	 '+16177104466' : 'ruske' ,
	 '+13055885040' : 'sanchez' ,
	 '+15187234529' : 'schmidt' ,
	 '+18457022769' : 'sendelbach' ,
	 '+19139408877' : 'shelton' ,
	 '+18562987001' : 'small' ,
	 '+12038230110' : 'sofair' ,
	 '+19186063232' : 'steinl' ,
	 '+17204700939' : 'tavel' ,
	 '+14438678954' : 'thomas' ,
	 '+18012449440' : 'unruh' ,
	 '+17049999791' : 'white' ,
};

var lastName2Num = {
	'anderson' : '+17135012181',
	'bao' : '+19086982342',
	'battaglia' : '+17168640330',
	'broom' : '+12066604215',
	'bustamante' : '+12623574715',
	'callahan' : '+12067241787',
	'chang' : '+14692585797',
	'ellis' : '+16072806062',
	'evitts' : '+17819279838',
	'finkbeiner' : '+15165877410',
	'fleurial' : '+16092971660',
	'foley' : '+12152068111',
	'frey' : '+12039188738',
	'gassaway' : '+16092343421',
	'giannini' : '+14158528816',
	'gibbons' : '+12064278288',
	'hassler' : '+16122478571',
	'held' : '+18457415780',
	'henderson' : '+16077938332',
	'imsdahl' : '+19017363880',
	'janeczko' : '+15187648929',
	'johnson' : '+17753035556',
	'keiper' : '+12672728352',
	'kost' :  '+16505440660',
	'koszyk' : '+13132150708',
	'lambert' : '+14012191176',
	'laviolette' : '+17817998788',
	'lecorgne' : '+16143072426',
	'lee' :  '+19178854730',
	'lipsky' :  '+16783320754',
	'lunney' :  '+12158723329',
	'mayro' : '+17326145244',
	'mcmanus' : '+16105853672',
	'mencke' :  '+12146498401',
	'michel' :  '+19412661604',
	'miksic' :  '+18482105095',
	'munday' : '+12533304875',
	'o\'neill' : '+16316552811',
	'ordonez' :  '+18572948737',
	'peters' : '+15167329495',
	'petrakis' :  '+15168081310',
	'piegza' : '+18589453793',
	'pinnola-vizza' : '+12679072554',
	'richartz' : '+18603913834',
	'rochford' : '+15858312246',
	'ruske' : '+16177104466',
	'sanchez' : '+13055885040',
	'schmidt' :  '+15187234529',
	'sendelbach' : '+18457022769',
	'shelton' : '+19139408877',
	'small' :  '+18562987001',
	'sofair' : '+12038230110',
	'steinl' : '+19186063232',
	'tavel' : '+17204700939',
	'thomas' : '+14438678954',
	'unruh' : '+18012449440',
	'white' : '+17049999791'
}

var colMap = {
	'Nov 04' : 6,
	'Nov 05' : 6,
	'Nov 06' : 6,
	'Nov 07' : 6,
	'Nov 08' : 7,
    'Nov 09' : 8,
	'Nov 10' : 9,
	'Nov 11' : 10,
	'Nov 12' : 11,
	'Nov 13' : 12,
	'Nov 14' : 13,
	'Nov 15' : 14,
	'Nov 16' : 15,
	'Nov 17' : 16,
	'Nov 18' : 17,
	'Nov 19' : 18,
	'Nov 20' : 19,
	'Nov 21' : 20,
	'Nov 22' : 21,
	'Nov 23' : 22,
	'Nov 24' : 23,
	'Nov 25' : 24,
	'Nov 26' : 25,
	'Nov 27' : 26,
	'Nov 28' : 27,
	'Nov 29' : 28,
	'Nov 30' : 29,
	'Dec 01' : 30,
	'Dec 02' : 31,
	'Dec 03' : 32,
	'Dec 04' : 33,
	'Dec 05' : 34,
	'Dec 06' : 35,
	'Dec 07' : 36,
	'Dec 08' : 37,
	'Dec 09' : 38,
	'Dec 10' : 39,
	'Dec 11' : 40,
	'Dec 12' : 41,
	'Dec 13' : 42,
	'Dec 14' : 43,
	'Dec 15' : 44,
	'Dec 16' : 45,
	'Dec 17' : 46,
	'Dec 18' : 47,
	'Dec 19' : 48,
	'Dec 20' : 49,
	'Dec 21' : 50,
	'Dec 22' : 51,
	'Dec 23' : 52,
	'Dec 24' : 53,
	'Dec 25' : 54,
	'Dec 26' : 55,
	'Dec 27' : 56,
	'Dec 28' : 57,
	'Dec 29' : 58,
	'Dec 30' : 59,
	'Dec 31' : 60,
	'Jan 01' : 61,
	'Jan 02' : 62,
	'Jan 03' : 63,
	'Jan 04' : 64,
	'Jan 05' : 65,
	'Jan 06' : 66,
	'Jan 07' : 67,
	'Jan 08' : 68,
	'Jan 09' : 69
}

