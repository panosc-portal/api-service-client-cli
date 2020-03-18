import { mapPlan } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { BaseCommand } from '../../utils';

export default class PlanListCommand extends BaseCommand {

  static description = 'List plans of the api service'

  static examples = [
    `$ api-service plan:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(PlanListCommand)
    
    this.apiServiceUrl = flags.url;

    const plans = await this.getPlans();

    if (plans.length > 0) {
      const planTableData = plans.map(plan => mapPlan(plan));

      printTable(planTableData);
      
    } else {
      console.log('The api service contains no plans');
    }
  }
}
