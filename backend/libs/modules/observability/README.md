# observability

This library was generated with [Nx](https://nx.dev).

Provides:
- Global HTTP interceptors for request logging and error logging.
- `UserAccessEventPort` to publish user-access events to RabbitMQ.
- A consumer that persists user-access events into the `UserAccess` table.

## Running unit tests

Run `nx test observability` to execute the unit tests via [Jest](https://jestjs.io).
