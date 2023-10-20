const tmi = require('tmi.js');

class botLogic {
    constructor(envvars, channels) {
        this.envvars = envvars;
        this.channels = channels;
        this.client;
    }

    start() {
        const opts = {
            identity: {
                username: this.envvars.usn,
                password: `oauth:${this.envvars.upn}`
            },
            channels: this.channels
        };
    
        // Create a client with our options
        const client = new tmi.client(opts);

        return client;
    }
}

module.exports = botLogic