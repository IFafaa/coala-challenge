# observability

This library was generated with [Nx](https://nx.dev).

Provides:
- Global HTTP interceptors for request logging and error logging.
- `UserAccessLogEventPort` to publish user-access-log events to RabbitMQ.
- A consumer that persists user-access-log events into the `UserAccessLog` table.

## Running unit tests

Run `nx test observability` to execute the unit tests via [Jest](https://jestjs.io).
