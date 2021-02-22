import {Instance, Image, Flavour, Provider, Plan, Role, User} from "../models"

export function mapInstance(instance: Instance): any {
  return {
    Id: instance.id,
    Name: instance.name,
    'Cloud Provider': instance.plan.provider.name,
    'Cloud Id': instance.cloudId,
    Status: instance.state.status,
    Plan: instance.plan.name,
    Image: instance.image.name,
    Flavour: `${instance.flavour.name} (${instance.flavour.cpu} Cores, ${instance.flavour.memory}MB RAM)`,
    Host: instance.hostname,
    Protocols: instance.protocols ? instance.protocols.map(protocol => `${protocol.name} (${protocol.port})`).join(', ') : ''
  }
}

export function mapPlan(plan: Plan): any {
  return {
    Id: plan.id,
    Name: plan.name,
    Provider: plan.provider.name,
    Image: plan.image.name,
    Flavour: plan.flavour.name
  }
}


export function mapRole(role: Role): any {
  return {
    Id: role.id,
    Name: role.name,
    Description: role.description
  };
}

export function mapUser(user: User): any {
  const roleNames = user.roles.map(({ name }) => name);

  return {
    Id: user.id,
    Name: `${user.firstName} ${user.lastName}`,
    Email: user.email,
    Activated: user.activated,
    Roles: roleNames
  };
}
