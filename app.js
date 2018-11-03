const bodyParser = require('body-parser');
const express = require('express');
const twilio = require('twilio');

const twilioAccountSid = 'ACe6a1a777cc67750ff7e84f03b89006f2';
const twilioAuthToken = 'd45318fa3e944ac0c0f81bebbcb7c743';
const client = twilio(twilioAccountSid, twilioAuthToken);

const parser = require('./message-parser');
const sheetUpdater = require('./sheet-updater');

const kerberisms = [
	''
];


const under5 = [
	''
]

const app = express();
const server = app.listen(process.env.PORT || 3000, function() {
	console.log('Listening on port %d', server.address().port);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function (request, response) {
	// Parse the received message
	const body = request.body.Body.toLowerCase();
	const command = parser.messageParse(body)

	// Execution
	const originPhoneNumber = request.body.From.replace('+','');
	const retBody = execute(originPhoneNumber, command);

	// Creating the message to be sent back
	const responseMessage = new twilio.TwimlResponse();
	responseMessage.message(retBody);

	// Send the response
	response.writeHead(200, {
		'Content-Type':'text/xml'
	});
	response.end(responseMessage.toString());
});

function execute(originPhoneNumber, request){
	if (request[0] == parser.ADD_COMMAND) {
		const numMeters = request[1];
		sheetUpdater.updateCell(originPhoneNumber, numMeters);

		if (numMeters < 5000){
			const i = Math.floor(Math.random() * under5.length);
			return (under5[i] + 'I successfully logged your ' + String(numMeters) + ' meters');
		} else {
			return ('I successfully logged your ' + String(numMeters) + ' meters');
		}
	}
	else if (request[0] == parser.RESET_COMMAND) {
		sheetUpdater.resetCell(originPhoneNumber, cellLocation);
		return 'Your meters for today have been set to 0';
	}
	else if (request[0] == parser.STATS_COMMAND) {
		stats(user, exe[1]);
		return 'Stats is not currently implemented. Yell at Matt to fix it.';
	}
	else if (request[0] == parser.ERROR) {
		return "I didn't understand that. Check the google-doc for instructions, or simply text me the number or meters you would like me to log."
	}
}

//stats function 
function stats(arg){

}
