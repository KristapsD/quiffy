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
async function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    if(context.username.toLowerCase() === "quifenadine") {
        if(await checkPyramid(msg)){
            client.say(target, "Tssk").catch((err)=> {console.log(err)});
        }
    }
}

function checkPyramid(msg) {
    const allEqual = arr => arr.every(val => val === arr[0]);

    let seperatedPyramid = msg.split(' ');
    console.log(seperatedPyramid)
    seperatedPyramid = seperatedPyramid.filter((str) => { return /^\w+$/g.test(str); }); // just for safety
    console.log(seperatedPyramid)
    console.log(seperatedPyramid.length)
    console.log(allEqual(seperatedPyramid))
    if(seperatedPyramid.length >= 5 && allEqual(seperatedPyramid)) {
        return true
    } else {
        return false
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}