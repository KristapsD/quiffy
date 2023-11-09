export default class TwitchApi {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private access_token: string;
  private _header: Headers;

    constructor(clientId, clientSecret, redirectUri = "") {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.access_token = "";

        this.authorize();
    }

    private async authorize() {
        let authHeader: Headers = new Headers();
        authHeader.append("Content-Type", "application/x-www-form-urlencoded");
        
        let urlencoded: URLSearchParams = new URLSearchParams();
        urlencoded.append("client_id", this.clientId);
        urlencoded.append("client_secret", this.clientSecret);
        urlencoded.append("grant_type", "client_credentials");
        
        let requestOptions: RequestInit = {
          method: 'POST',
          headers: authHeader,
          body: urlencoded,
          redirect: 'follow'
        };
        
        return await fetch("https://id.twitch.tv/oauth2/token", requestOptions)
          .then(response => response.json())
          .then((result) => {
            this.access_token = result.access_token;

            this._header = new Headers({});
            this._header.append("Client-Id", this.clientId);
            this._header.append("Authorization", `Bearer ${this.access_token}`);

            return result.access_token;
           })
          .catch(error => console.log('error', error));
    }

    public async getStream(streamLogin) {
        var requestOptions: RequestInit = {
          method: 'GET',
          headers: this._header,
          redirect: 'follow'
        };

        return await fetch(`https://api.twitch.tv/helix/streams?user_login=${streamLogin}`, requestOptions)
        .then(response => response.json())
        .then((result) => {
            return result.data;
        })
        .catch(error => console.log('error', error));
    }

    public async dispose() {
        var disposeHeader: Headers = new Headers();
        disposeHeader.append("Content-Type", "application/x-www-form-urlencoded");
        
        var urlencoded: URLSearchParams = new URLSearchParams();
        urlencoded.append("client_id", this.clientId);
        urlencoded.append("token", this.access_token);
        
        var requestOptions: RequestInit = {
          method: 'POST',
          headers: disposeHeader,
          body: urlencoded,
          redirect: 'follow'
        };
        
        return await fetch("https://id.twitch.tv/oauth2/revoke", requestOptions)
          .then((response) =>  {
            if(response.status === 200)
                this.access_token = "";
            })
          .catch(error => console.log('error', error));
    }
}