import { DotenvPopulateInput } from "dotenv";
import { Client, Options } from "tmi.js";

export default class botLogic {
    private envvars: DotenvPopulateInput;
    private channels: string[];
    private client: Client;

    constructor(envvars: DotenvPopulateInput, channels: string[]) {
        this.envvars = envvars;
        this.channels = channels;
        this.client;
    }

    public start(): Client {
        const opts: Options = {
            identity: {
                username: this.envvars.usn,
                password: `oauth:${this.envvars.upn}`
            },
            channels: this.channels
        };
    
        // Create a client with our options
        const client: Client = new Client(opts);

        return client;
    }
}