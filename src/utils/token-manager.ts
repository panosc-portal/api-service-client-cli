import * as fs from 'fs';
import * as inquirer from 'inquirer';
var querystring = require('querystring');
const axios = require('axios');


interface IDPConfig {
  host: string;
  endpoint: string;
  url: string;
  clientId: string;
}

interface Config {
  idp: IDPConfig;
}

class TokenRequest {
  scope: string;
  grant_type: string;
  client_id: string;
  username: string;
  password: string;
  refresh_token: string;

  constructor(data?: Partial<TokenRequest>) {
    Object.assign(this, data);
  }
}

interface Credentials {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  savedToDisk: boolean;
  timestampMs: number;
}

export class TokenManager {
  private static TOKEN_FILENAME = 'token.json';
  private _currentToken: Token;
  private _configFilename: string = 'config.json';
  private _config: Config;

  set configFilename(value: string) {
    this._configFilename = value;
  }

  private get config(): Config {
    if (this._config == null) {
      this._config = this.readConfig();
    }

    return this._config;
  }

  private readConfig() {
    if (fs.existsSync(this._configFilename)) {
      try {
        const data = fs.readFileSync(this._configFilename);
        const config = JSON.parse(data.toString()) as Config;

        return config;

      } catch (err) {
        console.error(`Unable to read config file '${this._configFilename}': ${err.message}`);
      }

    } else {
      console.warn(`No IDP config file has been provided`);
    }

    return null;
  }

  async getToken(): Promise<Token> {
    if (this._currentToken == null) {
      const tokenFromFile = this._readToken();

      if (tokenFromFile != null) {
        const now = new Date();
        console.log(`Token read from ${TokenManager.TOKEN_FILENAME}`);

        if (now.getTime() < (tokenFromFile.timestampMs + tokenFromFile.expires_in * 1000)) {
          this._currentToken = tokenFromFile;

        } else if (now.getTime() < (tokenFromFile.timestampMs + tokenFromFile.refresh_expires_in * 1000)) {
          console.log('Refreshing token...');

          const tokenRequest = new TokenRequest({
            client_id: this.config.idp.clientId,
            scope: 'openid',
            grant_type: 'refresh_token',
            refresh_token: tokenFromFile.refresh_token
          });

          try {
            this._currentToken = await this._getTokenFromServer(tokenRequest);
            console.log('... token refreshed successfully' + (this._currentToken.savedToDisk ? ` (saved to ${TokenManager.TOKEN_FILENAME})` : ''));
          
          } catch (error) {
            console.error(`... failed to refresh token: ${error.message}`);
          }

        } else {
          console.log('Token has expired');
        }
      }

      if (this._currentToken == null) {
        const credentials = await this._getCredentials();

        console.log('Getting token from IDP...');

        const tokenRequest = new TokenRequest({
          client_id: this.config.idp.clientId,
          scope: 'openid',
          grant_type: 'password',
          username: credentials.username,
          password: credentials.password
        });
  
        try {
          this._currentToken = await this._getTokenFromServer(tokenRequest);
          console.log('... token obtained successfully' + (this._currentToken.savedToDisk ? ` (saved to ${TokenManager.TOKEN_FILENAME})` : ''));

        } catch (error) {
          console.error('... failed to obtain token');
          throw error;
        }
      }
    }

    return this._currentToken;
  }

  private async _getTokenFromServer(tokenRequest: TokenRequest): Promise<Token>{
    try {
      // Stringify the request body parameters
      const data = querystring.stringify(tokenRequest);
      const now = new Date();

      // Call to IDP
      const response = await axios({
        method: 'POST',
        url: this.config.idp.url,
        data: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const tokenFromServer = response.data;
      tokenFromServer.timestampMs = now.getTime();
      tokenFromServer.savedToDisk = this._saveToken(tokenFromServer);

      return tokenFromServer;

    } catch (error) {
      throw new Error(`Error getting token from IDP: ${error.message}`);
    }
  }

  private async _getCredentials(): Promise<Credentials> {
    console.log('login:')
    const credentials = await inquirer.prompt<{username: string, password: string}>([{
      type: 'input',
      name: 'username',
      message: 'Enter a username'
    }, {
      type: 'password',
      name: 'password',
      mask: '*',
      message: 'Enter a password'
    }]);

    return credentials;
  }

  private _readToken(): Token {
    if (fs.existsSync(TokenManager.TOKEN_FILENAME)) {
      try {
        const data = fs.readFileSync(TokenManager.TOKEN_FILENAME);
        const token = JSON.parse(data.toString()) as Token;

        return token;

      } catch (error) {
        console.error(`Unable to read token file '${TokenManager.TOKEN_FILENAME}': ${error.message}`);
      }

      return null;
    }
  }

  private _saveToken(token: Token): boolean {
    try {
      const tokenString = JSON.stringify(token, null, 2);
      fs.writeFileSync(TokenManager.TOKEN_FILENAME, tokenString);
      return true;
  
    } catch (error) {
      console.warn(`Couldn't save token to ${TokenManager.TOKEN_FILENAME}: ${error.message}`);
    }

    return false;
  }

}