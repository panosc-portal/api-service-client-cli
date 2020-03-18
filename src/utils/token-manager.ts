import Axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
var querystring = require('querystring');


interface SSOConfig {
  host: string;
  realm: string;
  clientId: string;
}

interface Config {
  sso: SSOConfig;
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
  expiresAtMs: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  savedToDisk: boolean;
}

export class TokenManager {
  private static TOKEN_FILENAME = '.token.json';
  private _ssoClient: AxiosInstance;
  private _currentToken: Token;
  private _configFilename: string = 'config.json';
  private _config: Config;

  set configFilename(value: string) {
    this._configFilename = value;
  }

  private get ssoClient(): AxiosInstance {
    if (this._ssoClient == null) {

      const url = `https://${this.config.sso.host}/auth`;

      this._ssoClient = Axios.create({
        baseURL: url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }

    return this._ssoClient;
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
      console.warn(`No scheduler config file has been provided`);
    }

    return null;
  }

  async getToken(): Promise<Token> {
    if (this._currentToken == null) {
      const tokenFromFile = this._readToken();

      if (tokenFromFile != null) {
        const now = new Date();
        console.log(`Token read from ${TokenManager.TOKEN_FILENAME}`);

        if (now.getTime() < tokenFromFile.expiresAtMs) {
          this._currentToken = tokenFromFile;
          console.log(`Token is still valid`);

        } else {
          console.log('Token has expired: refreshing...');

          const tokenRequest = new TokenRequest({
            client_id: this.config.sso.clientId,
            scope: 'openid',
            grant_type: 'refresh_token',
            refresh_token: tokenFromFile.refresh_token
          });

          try {
            this._currentToken = await this._getTokenFromServer(tokenRequest);
            console.log(`... token refreshed successfully`);
            if (this._currentToken.savedToDisk) {
              console.log(`Token saved to ${TokenManager.TOKEN_FILENAME}`);
            }
          
          } catch (error) {
            console.error('... failed to refresh token');
          }
        }
      }

      if (this._currentToken == null) {
        const credentials = await this._getCredentials();

        console.log('Getting token from SSO...');

        const tokenRequest = new TokenRequest({
          client_id: this.config.sso.clientId,
          scope: 'openid',
          grant_type: 'password',
          username: credentials.username,
          password: credentials.password
        });
  
        try {
          this._currentToken = await this._getTokenFromServer(tokenRequest);
          console.log('... token obtained successfully');
          if (this._currentToken.savedToDisk) {
            console.log(`Token saved to ${TokenManager.TOKEN_FILENAME}`);
          }

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
      const data = querystring.stringify(tokenRequest);

      const now = new Date();
      const response = await this.ssoClient.post(`/realms/${this.config.sso.realm}/protocol/openid-connect/token`, data);
      const tokenFromServer = response.data;

      tokenFromServer.expiresAtMs = now.getTime() + tokenFromServer.expires_in * 1000;

      tokenFromServer.savedToDisk = this._saveToken(tokenFromServer);

      return tokenFromServer;

    } catch (error) {
      console.error(`Error getting token from SSO: ${error.message}`);
      throw new Error(`Error getting token from SSO: ${error.message}`);
    }
  }

  private async _getCredentials(): Promise<Credentials> {
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