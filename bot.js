const botLogic = require('./Code/botLogic.js');
const EnvVars = {};

require('dotenv').config({ path: "Environments/local.env", processEnv: EnvVars });

const bot = new botLogic(EnvVars, ['quifenadine']);

const client = bot.start();

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    if(context.username.toLowerCase() === "quifenadine") {
        if(checkPyramid(msg)){
            client.say(target, "Tssk");
        }
    }
}

function checkPyramid(msg) {
    const allEqual = arr => arr.every(val => val === arr[0]);
    let seperatedPyramid = msg.split(' ');
    seperatedPyramid = seperatedPyramid.filter(function(entry) { return /\S/.test(entry); }); // just for safety

    
    console.log(seperatedPyramid)
    if(seperatedPyramid.length >= 5 && allEqual(seperatedPyramid)) {
        return "Tssk"
    } else {
        return null
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}