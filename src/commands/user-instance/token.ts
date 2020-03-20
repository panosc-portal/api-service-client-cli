import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class UserInstanceRebootCommand extends BaseCommand {

  static description = 'Gets an authorisation token for a user instance'

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
        message: 'Choose an instance for the authorisation token',
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
  
        console.log(`Getting authorisation token for instance ${answers.instanceId}...`);
        const token = await this.getUserInstanceAuthorisationToken(answers.instanceId);
        console.log(`... token is : '${token.token}'`);
    
      } catch (error) {
        console.error(error.message);
      } 
    
    } else {
      console.log('You currently have no active instances');
    }

  }
}
