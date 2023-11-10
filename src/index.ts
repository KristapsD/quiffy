import botLogic from "./Code/classes/botLogic.js";
import TwitchApi from "./Code/classes/TwitchApi.js";
import { default as responsesArray } from "./Code/Store/Responses.json";
import * as dotenv from "dotenv";
import { ChatUserstate } from "tmi.js";
import { streamInfo } from "./Code/types/twitchApitypes.js";
import { isPyramid } from "./Code/types/miscTypes.js";
import { allEqual, getRandomInt, fiveConsecutive } from "./Code/helper.js";

const EnvVars: dotenv.DotenvPopulateInput = {};
let connected: boolean = false;
let streamLive = false;
let last5MessagesMaybePyramid: isPyramid = {
    "pyramid": false,
    "count": 0,
    "last5Senders": []
};

dotenv.config({ path: "././Environments/local.env", processEnv: EnvVars  });

const bot: botLogic = new botLogic(EnvVars, ['quifenadine']);
const client = bot.start();

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

//bot listeners

// Called every time a message comes in
async function onMessageHandler (target: string, context: ChatUserstate, msg: string, self: boolean): Promise<void> {
    //add everyone to the last 5 senders array
    last5MessagesMaybePyramid.last5Senders.push(context["user-id"]);

    if(last5MessagesMaybePyramid.last5Senders.length > 5)
        last5MessagesMaybePyramid.last5Senders.shift();

    if (self) { return; }
    const msgIsPotentialPyramid: boolean = await fiveConsecutive(msg);

    if(msgIsPotentialPyramid) {
        last5MessagesMaybePyramid.pyramid = true;
        last5MessagesMaybePyramid.count = 5;
    }

    if(last5MessagesMaybePyramid.pyramid && last5MessagesMaybePyramid.count > 0) {
        last5MessagesMaybePyramid.count--;

        if(last5MessagesMaybePyramid.last5Senders.length == 5 && allEqual(last5MessagesMaybePyramid.last5Senders)) {
            const response: string = responsesArray[getRandomInt(responsesArray.length)];
            client.say(target, response).catch((err)=> {console.log(err)});
        }

        if(last5MessagesMaybePyramid.count == 0){
            last5MessagesMaybePyramid.pyramid = false;
        }
    }

    console.log(last5MessagesMaybePyramid)
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr: string, port: number): void {
    console.log(`* Connected to ${addr}:${port}`);
    onConnection();
}

async function onConnection(): Promise<void> {
    connected = true;
    streamLive = await isStreamLive("quifenadine");
    if(streamLive) {
        client.disconnect();
        connected = false;
    }
}

async function isStreamLive(target: string): Promise<boolean> {
    const ta = new TwitchApi(EnvVars.client_id, EnvVars.client_secret);
    await ta.authorize();
    let streamInfo: streamInfo[] = await ta.getStream(target);
    await ta.dispose();
    return streamInfo.length != 0;
}

// check every 15 mins
setInterval(async function(): Promise<void> {
    streamLive = await isStreamLive('quifenadine');

    console.log(`Current time: ${new Date()}`);
    console.log(`Am i connected: ${connected}.`);
    console.log(`Is the stream live: ${streamLive}.`);

    if(streamLive && connected) {
        console.log("I think the stream is live, and i am connected, disconnecting.")
        client.disconnect();
        connected = false;
    } else if (!streamLive && !connected) {
        console.log("I think the stream is not live, and i am not connected, connecting.")
        client.connect();
        connected = true;
    } else {
        console.log("No actions needed.")
    }
}, 15 * 60 * 1000);