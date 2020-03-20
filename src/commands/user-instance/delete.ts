import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class UserInstanceDeleteCommand extends BaseCommand {

  static description = 'Deletes a user instance'

  static examples = [
    `$ api-service user-instance:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(UserInstanceDeleteCommand)
    
    this.apiServiceUrl = flags.url;
    try {

      const instances: Instance[] = await this.getUserInstances();

      if (instances.length > 0) {
        const questions = [{
          type: 'list',
          name: 'instanceId',
          message: 'Choose a instance to delete',
          filter: Number,
          choices: instances.map(instance => {
            return {
              name: `${instance.name} (id=${instance.id}, plan=${instance.plan.name}, status=${instance.state.status})`,
              value: instance.id
            };
          })
        }];
        const answers = await inquirer.prompt<{instanceId: number}>(questions);

        console.log(`Deleting instance ${answers.instanceId}...`);
        const done: boolean = await this.deleteUserInstance(answers.instanceId);
        if (done) {
          console.log('... done');

        } else {
          console.error('... failed');
        }
    
      } else {
        console.log('You currently have no instances');
      }
      
    } catch (error) {
      console.error(error.message);
    } 
  }
}
