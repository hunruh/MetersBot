# MetersBot
Automatically records meters via SMS during the million meters challenge. 

Please refer to the brief use-guide below. Feel free to ask me any questions regarding the development of this bot, or
let me know if there are any other features you would like to see implemented. 

## Adding meters
General erg meters: simply text the bot the number of meters you wish to add. You can either send the exact number of
meters or use "k" notation. For instance:
-       10k
-       10000

This will increment your daily total by 10,000 meters. Please do not include commas or decimal points in your number.
Message parsing is fairly primitive and “10,000” will NOT be recognized, nor will “10.3k”. Instead try “10000” or
“10300”.

Automatic conversions: To add cross training meters simply text the bot with the format:
-       cross 75 30

This will log a cross training workout at 75% max heartrate with a duration of 30 minutes.

## Removing meters
Simply texting the bot as follows will reset your daily total to 0:
-       clear
