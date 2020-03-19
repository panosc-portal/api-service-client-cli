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

      // Use interceptor to add access_token
      this._apiClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
        try {
          const token = await this._tokenManager.getToken();
          config.headers = { access_token: token.access_token };
      
          return config;
    
        } catch (error) {
          console.error('Failed to add access token to request headers');
          throw error;
        }
      });
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
}
