import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class UserInstanceRebootCommand extends BaseCommand {

  static description = 'Reboots a user instance'

  static examples = [
    `$ api-service user-instance:reboot`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(UserInstanceRebootCommand)
    
    this.apiServiceUrl = flags.url;

    const instances: Instance[] = await this.getUserInstances();
    const activeInstances = instances.filter(instance => instance.state.status === 'ACTIVE');
    if (activeInstances.length > 0) {
      const questions = [{
        type: 'list',
        name: 'instanceId',
        message: 'Choose an instance to reboot',
        filter: Number,
        choices: activeInstances.map(instance => {
          return {
            name: `${instance.name} (id=${instance.id}, image=${instance.image.name}, status=${instance.state.status})`,
            value: instance.id
          };
        })
      }];
  
      try {
        const answers = await inquirer.prompt<{instanceId: number}>(questions);
  
        console.log(`Rebooting instance ${answers.instanceId}...`);
        const instance = await this.rebootUserInstance(answers.instanceId);
        console.log('... done');
        printTable([mapInstance(instance)]);
    
      } catch (error) {
        console.error(error.message);
      } 
    
    } else {
      console.log('You currently have no active instances');
    }

  }
}
