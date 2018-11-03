const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// Initialize authentication client for the application
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const credentials = JSON.parse(fs.readFileSync('google-creds.json'));
const jwtClient = new google.auth.JWT(
	credentials.client_email,
	null,
	credentials.private_key,
	SCOPES,
	null
);

/**
 * Get the column in the spreadsheet correlating to the current date
 */
function findCol() {
	date = Date();
	date = date.substring(4,10);
	return(colMap[date]);
}

/**
 * Get the row in the spreadsheet correlating to the origin phone number
 * @param {string} phoneNumber origin number to query on
 * @param {function} callback function to be called with row result
 */
getCellLocation = function(phoneNumber, callback) {
	jwtClient.authorize((authErr) => {
		if (authErr) {
		  console.log(authErr);
		  return;
		}

		const sheets = google.sheets({version: 'v4'});
		sheets.spreadsheets.values.get({
			auth: jwtClient,
			spreadsheetId: '1vVfhQ5ln7YzWYDiGwYH-cslW4gT_B8Uaa3f89HrYTQ4',
			range: 'Meters!B8:B48'
		}, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err);

			const rows = res.data.values;
			if (rows.length) {
				for (var key in rows){
					if(rows[key][0] == phoneNumber) {
						// First row is number 8
						const rowId = (parseInt(key) + 8).toString();
						const columnId = findCol();
						if (!columnId || !rowId) {
							console.log('Cell not found for phone number: ' + phoneNumber);
							return;
						}
						callback(columnId + rowId); 
						return;
					}
				};
			} else {
				console.log('No rows returned on query for phone number');
			}
		});
	});
}

getCellValue = function(cellLocation, callback) {
	jwtClient.authorize((authErr) => {
		if (authErr) {
			console.log(authErr);
			return;
		}

		const sheets = google.sheets({version: 'v4'});
		sheets.spreadsheets.values.get({
			auth: jwtClient,
			spreadsheetId: '1vVfhQ5ln7YzWYDiGwYH-cslW4gT_B8Uaa3f89HrYTQ4',
			range: 'Meters!' + cellLocation,
		}, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err);
			if (!res.data.values) {
				callback(0);
			} else {
				callback(res.data.values[0][0]);
			}
		});
	});
}

writeCellValue = function(cellLocation, value) {
	jwtClient.authorize((authErr) => {
		if (authErr) {
		  console.log(authErr);
		  return;
		}

		const sheets = google.sheets({version: 'v4'});
		sheets.spreadsheets.values.update({
			auth: jwtClient,
			spreadsheetId: '1vVfhQ5ln7YzWYDiGwYH-cslW4gT_B8Uaa3f89HrYTQ4',
			range: 'Meters!' + cellLocation,
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: [[value]]
			}
		}, (err) => {
			if (err) return console.log('The API returned an error: ' + err);
		});
	});
}

updateCell = function(phoneNumber, value) {
	getCellLocation(
		phoneNumber,
		(cellLocation) => getCellValue(cellLocation,
			(existingValue) => {
				const newValue = (parseInt(existingValue) + parseInt(value)).toString();
				writeCellValue(cellLocation, newValue)
			}
		)
	);
}

resetCell = function(phoneNumber) {
	getCellLocation(
		phoneNumber,
		(cellLocation) => writeCellValue(cellLocation, '0')
	);
}

var colMap = {
	'Nov 02' : 'F',
	'Nov 03' : 'F',
	'Nov 04' : 'F',
	'Nov 05' : 'F',
	'Nov 06' : 'G',
	'Nov 07' : 'H',
	'Nov 08' : 'I',
	'Nov 09' : 'J',
    'Nov 10' : 'K',
	'Nov 11' : 'L',
	'Nov 12' : 'M',
	'Nov 13' : 'N',
	'Nov 14' : 'O',
	'Nov 15' : 'P',
	'Nov 16' : 'Q',
	'Nov 17' : 'R',
	'Nov 18' : 'S',
	'Nov 19' : 'T',
	'Nov 20' : 'U',
	'Nov 21' : 'V',
	'Nov 22' : 'W',
	'Nov 23' : 'X',
	'Nov 24' : 'Y',
	'Nov 25' : 'Z',
	'Nov 26' : 'AA',
	'Nov 27' : 'AB',
	'Nov 28' : 'AC',
	'Nov 29' : 'AD',
	'Nov 30' : 'AE',
	'Dec 01' : 'AF',
	'Dec 02' : 'AG',
	'Dec 03' : 'AH',
	'Dec 04' : 'AI',
	'Dec 05' : 'AJ',
	'Dec 06' : 'AK',
	'Dec 07' : 'AL',
	'Dec 08' : 'AM',
	'Dec 09' : 'AN',
	'Dec 10' : 'AO',
	'Dec 11' : 'AP',
	'Dec 12' : 'AQ',
	'Dec 13' : 'AR',
	'Dec 14' : 'AS',
	'Dec 15' : 'AT',
	'Dec 16' : 'AU',
	'Dec 17' : 'AV',
	'Dec 18' : 'AW',
	'Dec 19' : 'AX',
	'Dec 20' : 'AY',
	'Dec 21' : 'AZ',
	'Dec 22' : 'BA',
	'Dec 23' : 'BB',
	'Dec 24' : 'BC',
	'Dec 25' : 'BD',
	'Dec 26' : 'BE',
	'Dec 27' : 'BF',
	'Dec 28' : 'BG',
	'Dec 29' : 'BH',
	'Dec 30' : 'BI',
	'Dec 31' : 'BJ',
	'Jan 01' : 'BK',
	'Jan 02' : 'BL',
	'Jan 03' : 'BM',
	'Jan 04' : 'BN',
	'Jan 05' : 'BO',
	'Jan 06' : 'BO'
}

module.exports = {
	updateCell,
	resetCell
}
