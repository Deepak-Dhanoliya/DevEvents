# Running Tests

This project uses Jest for unit testing.

## Installation

First, install the testing dependencies:

```bash
npm install
```

## Running Tests

Run all tests once:
```bash
npm test
```

Run tests in watch mode (reruns on file changes):
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

## Test Files

- `lib/mongodb.test.ts` - Unit tests for the MongoDB connection utility

## Test Coverage

The tests cover the following scenarios for the `connectDB` function:

1. **Successful connection**: Returns a mongoose instance when the connection is successful
2. **Missing environment variable**: Throws an error if `MONGODB_URI` is not defined
3. **Connection caching**: Returns the cached connection on subsequent calls without reconnecting
4. **Error recovery**: Resets the promise cache if the connection fails, allowing for retries
