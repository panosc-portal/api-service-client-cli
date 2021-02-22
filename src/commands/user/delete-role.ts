import { User, Role } from '../../models';
import { BaseCommand, validNumber } from '../../utils';
import { mapUser } from '../../views/model.view';
import { printTable } from 'console-table-printer';
import * as inquirer from 'inquirer';

export default class UserDeleteRoleCommand extends BaseCommand {
  static description = 'Deletes a role from a user';

  static examples = [`$ api-service user:delete-role`];

  static flags = Object.assign({}, BaseCommand.baseFlags);

  async run() {
    const { args, flags } = this.parse(UserDeleteRoleCommand);

    this.apiServiceUrl = flags.url;

    // Checks that the accounts database has at least one entry
    const users: User[] = await this.getUsers();
    if (users.length === 0) {
      console.log('No user found in users database.');
      return;
    }
    // Checks that the roles database has at least one entry
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

      console.log('Delete role from user...');
      const user = await this.deleteUserRole(
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
