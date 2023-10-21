const botLogic = require('./Code/botLogic.js');
const twitchAuth = require('./Code/TwitchAuth.js');
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
    if (!checkIfLive(target.replace('#', ''))) { return; }; //ignore if channel is live

    console.log(context['user-id']);
    //me or awakenedgarou
    if(context['user-id'].toLowerCase() === '135624254' || context['user-id'].toLowerCase() === '63633617') {
        if(await checkPyramid(msg)){
            client.say(target, "Tssk").catch((err)=> {console.log(err)});
        }
    }
}

function checkPyramid(msg) {
    const allEqual = arr => arr.every(val => val === arr[0]);

    let seperatedPyramid = msg.split(' ');
    seperatedPyramid = seperatedPyramid.filter((str) => { return /^\w+$/g.test(str); }); // just for safety
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

async function checkIfLive(target) {
    const ta = new twitchAuth(EnvVars.client_id, EnvVars.client_secret);
    await ta.initialize();
    let data = await ta.getStream(target)
    await ta.dispose();
    return data.length != 0;
}