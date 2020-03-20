import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class UserInstanceGetCommand extends BaseCommand {

  static description = 'Get a user instances'

  static examples = [
    `$ api-service user-instance:get`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(UserInstanceGetCommand)
    
    this.apiServiceUrl = flags.url;


    try {
      const {instanceId} = await inquirer.prompt<{instanceId: number}>([{
        type: 'number',
        name: 'instanceId',
        message: 'Enter an instance id',
        filter: Number,
      }]);

      const instance = await this.getUserInstance(instanceId);

      if (instance != null) {
        const mappedInstance = mapInstance(instance);
  
        printTable([mappedInstance]);
        
      } else {
        console.log('You do not have an instance corresponding to the given Id');
      }

    } catch (error) {
      if (error.response.status === 404) {
        console.log('You do not have an instance corresponding to the given Id');

      } else {
        console.error(error.message);
      }
    }

  }
}
