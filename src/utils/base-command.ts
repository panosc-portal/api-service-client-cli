import {Command, flags} from '@oclif/command'
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Plan, Instance, InstanceCreatorDto, InstanceActionDto, AuthorisationToken } from '../models';
import { TokenManager } from './token-manager';

export abstract class BaseCommand extends Command {

  static baseFlags = {
    help: flags.help({char: 'h'}),
    url: flags.string({char: 'u', description: 'URL of the api service', default: 'http://localhost:3000'}),
    config: flags.string({char: 'c', description: 'JSON Config file', default: 'config.json'}),
  }

  private _apiClient: AxiosInstance;
  private _apiServiceUrl: string;
  private _tokenManager: TokenManager = new TokenManager();

  protected set apiServiceUrl(value: string) {
    this._apiServiceUrl = value;
  }

  protected set configFilename(value: string) {
    this._tokenManager.configFilename = value;
  }

  protected get apiClient(): AxiosInstance {
    if (this._apiClient == null) {
      this._apiClient = Axios.create({
        baseURL: `${this._apiServiceUrl}/api/v1`,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Decorate apiClient to get token first and add it to the headers
    const getFunc = this._apiClient.get;
    const postFunc = this._apiClient.post;
    const deleteFunc = this._apiClient.delete;
    
    this._apiClient.get = async (url: string, config?: AxiosRequestConfig) => {
      try {
        config = await this.setHeaderAccessToken(config);

        return getFunc(url, config);
      
      } catch (error) {
        throw error;
      }
    }
    
    this._apiClient.post = async (url: string, data?: any, config?: AxiosRequestConfig) => {
      try {
        config = await this.setHeaderAccessToken(config);

        return postFunc(url, data, config);
      
      } catch (error) {
        throw error;
      }
    }
    
    this._apiClient.delete = async (url: string, config?: AxiosRequestConfig) => {
      try {
        config = await this.setHeaderAccessToken(config);

        return deleteFunc(url, config);
      
      } catch (error) {
        throw error;
      }
    }

    return this._apiClient;
  }

  async getPlans(): Promise<Plan[]> {
    const response = await this.apiClient.get('plans');
    return response.data;
  }

  async getUserInstances(): Promise<Instance[]> {
    const response = await this.apiClient.get('account/instances');
    return response.data;
  }

  async createUserInstance(instance: InstanceCreatorDto): Promise<Instance> {
    const response = await this.apiClient.post('account/instances', instance);
    return response.data;
  }

  async deleteUserInstance(instanceId: number): Promise<boolean> {
    const response = await this.apiClient.delete(`account/instances/${instanceId}`);
    return response.data;
  }

  async startUserInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'START'});
    const response = await this.apiClient.post(`account/instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async stopUserInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'SHUTDOWN'});
    const response = await this.apiClient.post(`account/instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async rebootUserInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'REBOOT'});
    const response = await this.apiClient.post(`account/instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async getUserInstanceAuthorisationToken(instanceId: number): Promise<AuthorisationToken> {
    const response = await this.apiClient.post(`account/instances/${instanceId}/token`);
    return response.data;
  }


  private async setHeaderAccessToken(config?: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    try {
      const token = await this._tokenManager.getToken();
      config = config || {};
      config.headers = { access_token: token.access_token };
  
      return config;

    } catch (error) {
      throw error;
    }
  }

}
