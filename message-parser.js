const ADD_COMMAND = 'add';
const RESET_COMMAND = 'reset';
const STATS_COMMAND = 'stats';
const ERROR = 'error';

function filterInt(value) { 
	if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
		return Number(value);
	}

	return NaN; 
}

//used to parse incoming messages and generate meaningful commands
function messageParse(message){
    const parsedMessage = message.toLowerCase().trim().replace(/\s\s+/g, ' ').split(' '); 
    const kNotationPattern = new RegExp('[0-9]+k?');

	//single word command (stats, add, or clear)
	if (parsedMessage.length == 1) {
        const command = parsedMessage[0];

		// 'stats' command
	    if (command == 'stats' || command == 'stat') {
	        return [STATS_COMMAND];
        }
        
	    // 'clear' command
	    if (command == 'clear') {
	        return [RESET_COMMAND, '0'];
        }
        
	    // 'add' comand using 'k' notation 
	    if (kNotationPattern.test(command)) {
	        var dist = command.replace('k','000');
            if (isNaN(filterInt(dist))) return(['error']);
            
	        return [ADD_COMMAND, dist];
        }
        
	    // 'add' command using strict notation 
	    if (!isNaN(filterInt(command))) {
	        return [ADD_COMMAND, message];
	    }
	}

	if (parsedMessage.length == 3){
		if (parsedMessage[0] == 'cross'){
			const heartRate = parseFloat(parsedMessage[1]); 
			const duration = parsedMessage[2].replace('min','');
			if(heartRate >= 65 && heartRate < 75) {
				const equivalentDistance = parseInt(parseInt(duration) * 240); 
				return messageParse(String(equivalentDistance));
			}
			else if(heartRate >= 75 && heartRate < 85) {
				const equivalentDistance = parseInt(parseInt(duration) * 250);
				return messageParse(String(equivalentDistance));
			}
		    else if(heartRate >= 85) {
				const equivalentDistance = parseInt(parseInt(duration) * 285.714);
				return messageParse(String(equivalentDistance));
			}
		}
	}
	
	return [ERROR]
}

module.exports = {
    ADD_COMMAND,
    RESET_COMMAND,
    STATS_COMMAND,
    ERROR,
	messageParse
}
