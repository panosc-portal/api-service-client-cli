import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { BaseCommand } from '../../utils';

export default class UserInstanceListCommand extends BaseCommand {

  static description = 'List user instances'

  static examples = [
    `$ api-service user-instance:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(UserInstanceListCommand)
    
    this.apiServiceUrl = flags.url;

    const instances = await this.getUserInstances();

    if (instances.length > 0) {
      const instanceTableData = instances.map(instance => mapInstance(instance));

      printTable(instanceTableData);
      
    } else {
      console.log('You currently have no instances');
    }
  }
}
