PaNOSC Portal API CLI Client
================================

A CLI client to test the PaNOSC Portal API.

The CLI performs an initial login to an IDP to obtain an access token for the Portal API. The config for the IDP goes in config.json with the following structure:
```
{
  "idp": {
    "url": "https://idp.com/auth/url/to/obtain/token",
    "clientId": "a_client_id"
  }
}
```

The user is requested for a username and password which are passed to the IDP. Having successfully received a token, this is saved locally at .token.json. Following commands verify the validity of the token and refresh it if required. The access token is then forwarded to all portal API requests.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->

Note: The <i>api-service</i> command is equialent to ./bin/run

```sh-session
$ npm install
$ api-service COMMAND
running command...
$ api-service (-v|--version|version)
api-service-cli-client/1.0.0 darwin-x64 node-v10.15.3
$ api-service --help [COMMAND]
USAGE
  $ api-service COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`api-service user-instance:COMMAND`](#api-service-instance-command)

## `api-service user-instance:COMMAND`

perform user-instance related operations

```
USAGE
  $ api-service user-instance:COMMAND

COMMANDS
  user-instance:add     Creates a user instance
  user-instance:delete  Deletes a user instance
  user-instance:list    List all user instances
```

## `api-service help [COMMAND]`

display help for api-service

```
USAGE
  $ api-service help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```


<!-- commandsstop -->
