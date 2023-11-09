import botLogic from "./Code/botLogic.js";
import TwitchApi from "./Code/TwitchApi.js";
import * as responsesArray from "./Code/Store/Responses.json";
import * as dotenv from "dotenv";
import { ChatUserstate } from "tmi.js";
import { streamInfo } from "./Code/types/twitchApitypes.js";

interface isPyramid {
    pyramid: boolean,
    count: number
}
const EnvVars: dotenv.DotenvPopulateInput = {};
let connected: boolean = false;
let last5MessageSenders: (string | undefined)[];
let last5MessagesMaybePyramid: isPyramid = {
    "pyramid": false,
    "count": 0
};

dotenv.config({ path: "Environments/local.env", processEnv: EnvVars  });

const bot: botLogic = new botLogic(EnvVars, ['elajjaz']);
const client = bot.start();

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();



setInterval(async function(): Promise<void> {
    //check if stream is live every 15 mins, if live disconnect, otherwise connect
    const streamLive = await isStreamLive('elajjaz');

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
}, 30 * 60 * 1000);
  

// Called every time a message comes in
async function onMessageHandler (target: string, context: ChatUserstate, msg: string, self: boolean): Promise<void> {
    const streamLive: boolean = await isStreamLive(target.replace('#', '')); // double check stream live
    if (streamLive) { return; }; //ignore if channel is live

    //add everyone to the last 5 senders array
    last5MessageSenders.push(context["user-id"]);

    if(last5MessageSenders.length > 5)
        last5MessageSenders.shift();

    if (self) { return; }

    let response: string = responsesArray[getRandomInt(responsesArray.length)];
    const isPyramid: boolean = await checkPyramid(msg);

    if(isPyramid) {
        last5MessagesMaybePyramid["pyramid"] = true;
        last5MessagesMaybePyramid["count"] = 5;
    } else if(last5MessagesMaybePyramid["count"] >= 0) {
        last5MessagesMaybePyramid["count"] = last5MessagesMaybePyramid["count"] - 1;
        if(last5MessagesMaybePyramid["count"] <= 0) {
            last5MessagesMaybePyramid["pyramid"] = false;
        }
    }

    console.log(context['user-id']);
    console.log(last5MessagesMaybePyramid)

    if(last5MessageSenders.length === 5 && allEqual(last5MessageSenders) && last5MessageSenders[0] === "135624254"){
        if(last5MessagesMaybePyramid["pyramid"]) {
            console.log(response)
            client.say(target, response).catch((err)=> {console.log(err)});
        }
    }

    if(last5MessageSenders.length === 5 && isPyramid && allEqual(last5MessageSenders)){
        console.log(response)
        client.say(target, response).catch((err)=> {console.log(err)});
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr: string, port: number): void {
    console.log(`* Connected to ${addr}:${port}`);
    connected = true;
}

function checkPyramid(msg: string): boolean {
    let seperatedPyramid: string[] = msg.split(' ');
    seperatedPyramid = seperatedPyramid.filter((str) => { return /^\w+$/g.test(str); }); // just for safety

    return seperatedPyramid.length >= 5 && allEqual(seperatedPyramid)
}

async function isStreamLive(target: string): Promise<boolean> {
    const ta = new TwitchApi(EnvVars.client_id, EnvVars.client_secret);
    let streamInfo: streamInfo[] = await ta.getStream(target);
    await ta.dispose();
    return streamInfo.length != 0;
}

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

function allEqual(arr: (string | undefined)[]): boolean  {
    return arr.every(val => val === arr[0]);
}