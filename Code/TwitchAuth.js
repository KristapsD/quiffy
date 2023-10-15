var XMLHttpRequest = require('xhr2');

class TwitchAuth {
    constructor(clientId, clientSecret, redirectUri) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    authorize() {
        const data = `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
        }
        });

        xhr.open("POST", "https://id.twitch.tv/oauth2/token");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.send(data);
    }
}

module.exports = TwitchAuth