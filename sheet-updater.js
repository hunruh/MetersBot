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

// Meters spreadsheet details
const spreadsheetId = '1vVfhQ5ln7YzWYDiGwYH-cslW4gT_B8Uaa3f89HrYTQ4';
const spreadsheetName = 'Meters';

/**
 * Get the column in the spreadsheet correlating to the current date
 */
function findCol() {
	const date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
	const dateSr = date.split(',')[0];
	return(colMap[dateSr]);
}

/**
 * Get the cell location in the spreadsheet correlating to the origin phone number
 * @param {string} phoneNumber origin number to query on
 * @param {function} callback function to be called with cell location result
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
			spreadsheetId: spreadsheetId,
			range: spreadsheetName + '!B8:B48'
		}, (err, res) => {
			if (err) return err;

			const rows = res.data.values;
			if (rows.length) {
				for (var key in rows) {
					if(rows[key][0] == phoneNumber) {
						// First row is number 8
						const rowId = (parseInt(key) + 8).toString();
						const columnId = findCol();
						if (!columnId || !rowId) {
							return 'Error: Could not find a cell for that phone number and date in the spreadsheet.';
						}
						return callback(columnId + rowId); 
					}
				}

				return 'Error: Phone number does not exist in spreadsheet.';
			} else {
				return 'Error: No phone numbers were found.'
			}
		});
	});
}

/**
 * Get the value of a cell in the spreadsheet
 * @param {string} cellLocation the location within the 'Meters' spreadsheet
 * @param {function} callback function to be called with value result
 */
getCellValue = function(cellLocation, callback) {
	jwtClient.authorize((authErr) => {
		if (authErr) {
			console.log(authErr);
			return;
		}

		const sheets = google.sheets({version: 'v4'});
		sheets.spreadsheets.values.get({
			auth: jwtClient,
			spreadsheetId: spreadsheetId,
			range: spreadsheetName + '!' + cellLocation,
		}, (err, res) => {
			if (err) return err;
			if (!res.data.values) {
				return callback(0);
			} else {
				return callback(res.data.values[0][0]);
			}
		});
	});
}

/**
 * Write a value to the spreadsheet
 * @param {string} the location within the 'Meters' spreadsheet to update
 * @param {string} the value to write to the specified cell
 */
writeCellValue = function(cellLocation, value) {
	jwtClient.authorize((authErr) => {
		if (authErr) {
		  console.log(authErr);
		  return;
		}

		const sheets = google.sheets({version: 'v4'});
		sheets.spreadsheets.values.update({
			auth: jwtClient,
			spreadsheetId: spreadsheetId,
			range: spreadsheetName + '!' + cellLocation,
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: [[value]]
			}
		}, (err, res) => {
			if (err) return err;

			return 'Success';
		});
	});
}

/**
 * Helper (and exportable) function to chain together the operations for fetching
 * a cell location from the spreadsheet and updating it
 * @param {string} phoneNumber the number of the requester
 * @param {string} value the value to write in the appropriate cell (per phone number and date)
 */
updateCell = function(phoneNumber, value) {
	return getCellLocation(
		phoneNumber,
		(cellLocation) => getCellValue(cellLocation,
			(existingValue) => {
				const newValue = (parseInt(existingValue) + parseInt(value)).toString();
				writeCellValue(cellLocation, newValue)
			}
		)
	);
}

/**
 * Helper (and exportable) function to chain together the operations for zeroing out a cell
 * @param {string} phoneNumber the number of the requester
 */
resetCell = function(phoneNumber) {
	return getCellLocation(
		phoneNumber,
		(cellLocation) => writeCellValue(cellLocation, '0')
	);
}

var colMap = {
	'11/5/2018' : 'F',
	'11/6/2018' : 'G',
	'11/7/2018' : 'H',
	'11/8/2018' : 'I',
	'11/9/2018' : 'J',
    '11/10/2018' : 'K',
	'11/11/2018' : 'L',
	'11/12/2018' : 'M',
	'11/13/2018' : 'N',
	'11/14/2018' : 'O',
	'11/15/2018' : 'P',
	'11/16/2018' : 'Q',
	'11/17/2018' : 'R',
	'11/18/2018' : 'S',
	'11/19/2018' : 'T',
	'11/20/2018' : 'U',
	'11/21/2018' : 'V',
	'11/22/2018' : 'W',
	'11/23/2018' : 'X',
	'11/24/2018' : 'Y',
	'11/25/2018' : 'Z',
	'11/26/2018' : 'AA',
	'11/27/2018' : 'AB',
	'11/28/2018' : 'AC',
	'11/29/2018' : 'AD',
	'11/30/2018' : 'AE',
	'12/1/2018' : 'AF',
	'12/2/2018' : 'AG',
	'12/3/2018' : 'AH',
	'12/4/2018' : 'AI',
	'12/5/2018' : 'AJ',
	'12/6/2018' : 'AK',
	'12/7/2018' : 'AL',
	'12/8/2018' : 'AM',
	'12/9/2018' : 'AN',
	'12/10/2018' : 'AO',
	'12/11/2018' : 'AP',
	'12/12/2018' : 'AQ',
	'12/13/2018' : 'AR',
	'12/14/2018' : 'AS',
	'12/15/2018' : 'AT',
	'12/16/2018' : 'AU',
	'12/17/2018' : 'AV',
	'12/18/2018' : 'AW',
	'12/19/2018' : 'AX',
	'12/20/2018' : 'AY',
	'12/21/2018' : 'AZ',
	'12/22/2018' : 'BA',
	'12/23/2018' : 'BB',
	'12/24/2018' : 'BC',
	'12/25/2018' : 'BD',
	'12/26/2018' : 'BE',
	'12/27/2018' : 'BF',
	'12/28/2018' : 'BG',
	'12/29/2018' : 'BH',
	'12/30/2018' : 'BI',
	'12/31/2018' : 'BJ',
	'1/1/2019' : 'BK',
	'1/2/2019' : 'BL',
	'1/3/2019' : 'BM',
	'1/4/2019' : 'BN',
	'1/5/2019' : 'BO',
	'1/6/2019' : 'BO'
}

module.exports = {
	updateCell,
	resetCell
}
