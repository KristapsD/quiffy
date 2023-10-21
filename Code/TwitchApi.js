class TwitchApi {
    constructor(clientId, clientSecret, redirectUri = undefined) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.access_token = undefined;

        this.initialize();
    }

    async initialize() {
        await this.authorize();
    }

    async authorize() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", this.clientId);
        urlencoded.append("client_secret", this.clientSecret);
        urlencoded.append("grant_type", "client_credentials");
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded,
          redirect: 'follow'
        };
        
        return await fetch("https://id.twitch.tv/oauth2/token", requestOptions)
          .then(response => response.json())
          .then((result) => {
            this.access_token = result.access_token;
            return result.access_token;
           })
          .catch(error => console.log('error', error));
    }

    async getStream(streamLogin) {
        var myHeaders = new Headers();
        myHeaders.append("Client-Id", this.clientId);
        myHeaders.append("Authorization", `Bearer ${this.access_token}`);

        var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
        };

        return await fetch(`https://api.twitch.tv/helix/streams?user_login=${streamLogin}`, requestOptions)
        .then(response => response.json())
        .then((result) => {
            return result.data;
        })
        .catch(error => console.log('error', error));
    }

    async dispose() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", this.clientId);
        urlencoded.append("token", this.access_token);
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded,
          redirect: 'follow'
        };
        
        return await fetch("https://id.twitch.tv/oauth2/revoke", requestOptions)
          .then((response) =>  {
            if(response.status === 200)
                this.access_token = undefined;
            })
          .catch(error => console.log('error', error));
    }
}

module.exports = TwitchApi