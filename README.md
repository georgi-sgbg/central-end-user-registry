# central-end-user-registry

The central end user registry is an example service that shows the power of the [central directory](https://github.com/mojaloop/central-directory). It can be used to register a DFSP's payment URL and receive a user number in return. The user number can then be looked up through the central directory when making a payment.

The following documentation represents the services, APIs and endpoints responsible for various end user registry functions.

Contents:

- [Deployment](#deployment)
- [Configuration](#configuration)
- [API](#api)
- [Logging](#logging)
- [Tests](#tests)

## Deployment

See the [Onboarding guide](Onboarding.md) for running the service locally.

## Configuration

### Environment variables
The central directory has many options that can be configured through environment variables.

| Environment variable | Description | Example values |
| -------------------- | ----------- | ------ |
| CREG\_DATABASE_URI   | The connection string for the database the central end user registry will use. MySQL is currently the only supported database. | mysql://\<username>:\<password>@localhost:3306/central_end_user_registry |
| CREG\_PORT | The port the API server will run on. | 3001 |
| CREG\_HOSTNAME | The URI that will be used to create and validate links to resources on the central directory.  | http://central-directory |

## API

For endpoint documentation, see the [API documentation](API.md).

## Logging

Logs are sent to standard output by default.

## Tests

Tests include unit, functional, and integration. 

Running the tests:


    npm run test:all


Tests include code coverage via istanbul. See the test/ folder for testing scripts.
