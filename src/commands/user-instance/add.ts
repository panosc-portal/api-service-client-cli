import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { InstanceCreatorDto, Plan } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class UserInstanceAddCommand extends BaseCommand {

  static description = 'Adds a user instance'

  static examples = [
    `$ api-service user-instance:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(UserInstanceAddCommand)
    
    this.apiServiceUrl = flags.url;

    const plans: Plan[] = await this.getPlans();

    const validNumber = function (value: string) {
      const valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    const questions = [{
      type: 'list',
      name: 'planId',
      message: 'Choose a plan',
      validate: validNumber,
      filter: Number,
      choices: plans.map(plan => {
        return {
          name: `${plan.name} (provider=${plan.provider.name}, image=${plan.image.name}, flavour=${plan.flavour.name})`,
          value: plan.id
        };
      })
    }, {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the instance',
      validate: function (value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the instance (optional)'
    }];

    try {
      const {name, description, planId} = await inquirer.prompt(questions);

      const instanceCreator = new InstanceCreatorDto({
        name: name,
        description: description,
        planId: planId
      });

      console.log(JSON.stringify(instanceCreator));

      console.log('Creating instance...');
      const instance = await this.createUserInstance(instanceCreator);
      console.log('... done');
      printTable([mapInstance(instance)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
