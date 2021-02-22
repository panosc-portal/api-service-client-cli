import { mapUser } from '../../views/model.view';
import { printTable } from 'console-table-printer';
import { User, Role } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand, validNumber } from '../../utils';

export default class UserAddRoleCommand extends BaseCommand {
  static description = 'Adds a role to a user';

  static examples = [`$ api-service user:add-role`];

  static flags = Object.assign({}, BaseCommand.baseFlags);

  async run() {
    const { args, flags } = this.parse(UserAddRoleCommand);

    this.apiServiceUrl = flags.url;

    const users: User[] = await this.getUsers();
    if (users.length === 0) {
      console.log('No user found in users database.');
      return;
    }

    const roles: Role[] = await this.getRoles();
    if (roles.length === 0) {
      console.log('No role found in roles database.');
      return;
    }

    const questions = [
      {
        type: 'list',
        name: 'userId',
        message: 'Choose a user',
        filter: Number,
        choices: users.map(user => {
          return {
            name: `${user.firstName} ${user.lastName} (id=${user.id})`,
            value: user.id
          };
        })
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Choose a role',
        validate: validNumber,
        filter: Number,
        choices: roles.map(role => {
          return {
            name: `${role.name} (${role.description})`,
            value: role.id
          };
        })
      }
    ];

    try {
      const answers = await inquirer.prompt<{
        userId: number;
        roleId: number;
      }>(questions);

      console.log('Add role to user...');
      const user = await this.addUserRole(
        answers.userId,
        answers.roleId
      );
      console.log('... done');
      printTable([mapUser(user)]);
    } catch (error) {
      console.error(error.message);
    }
  }
}
