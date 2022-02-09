# simple-lambda-handlers

a simple and opinionated lambda handler library, built with [middy](https://github.com/middyjs/middy).

# installation

```
npm install --save simple-lambda-handlers
```

# usage

### Standard Handler

Here is a quick example that shows how you can wrap your handler logic, do additional validation beyond the input validation schema, and return a response.

```ts
// e.g., in `src/handlers/sendUserNotification.ts
import { createStandardHandler, BadRequestError } from 'simple-lambda-handlers';
import Joi from 'joi';

const schema = Joi.object().keys({
  userUuid: Joi.string().uuid().required(),
  message: Joi.string().uuid().required(),
});

const handle = async ({
  event,
}: {
  event: {
    userUuid: string;
    message: string;
  };
}) => {
  // any additional validation you may want
  if (message.includes(PROFANITY)) throw new BadRequestError('message should not include profanity'); // wont show up as cloudwatch error, but will return user an error, since `instanceof BadRequestError`

  // do your business logic here (e.g., call your logic layer)
  const awesomeResponse = await sendUserNotification();

  // return something
  return { awesomeResponse };
};

export const handler = createStandardHandler({
  log,
  schema,
  logic: handle,
});
```

### Api Gateway Handler

Interacting with an APIGateway involves lots of additional concerns beyond those of a standard handler. This library exposes `createApiGatewayHandler` to quickly considerations such as statusCodes, cors, body serialization, and best security practices for headers.

Here is an example that supports CORS with credentials as well as an auth token passed in the header.

```ts
// e.g., in `src/handlers/sendUserNotification.ts
import { ApiGatewayHandlerLogic, createApiGatewayHandler, BadRequestError } from 'simple-lambda-handlers';
import Joi from 'joi';

const schema = Joi.object()
  .keys({
    httpMethod: Joi.string().valid('POST').required(), // if you only allow certain http methods, you can enforce that here
    headers: Joi.object()
      .keys({
        authorization: Joi.string().required(), // if your api requires an auth token, you can enforce that its sent here
      })
      .required()
      .unknown(),
    body: Joi.object()
      .keys({
        userUuid: Joi.string().uuid().required(),
        message: Joi.string().uuid().required(),
      })
      .required(),
  })
  .unknown(true); // api gateway object will have more keys - we just care about the ones above in this example

const handle: ApiGatewayHandlerLogic = async ({
  headers,
  body,
}: {
  headers: { authorization: string };
  body: { userId: string; message: string };
}): Promise<{ statusCode: 200; body: { awesomeResponse } }> => {
  // any additional validation you may want
  if (message.includes(PROFANITY)) throw new BadRequestError('message should not include profanity'); // will result in a `{ statusCode: 400, body: { errorMessage: 'message should not include profanity' } }` response and wont showup in cloudwatch as an error, since `instanceof BadRequestError`

  // do your business logic here (e.g., call your logic layer)
  const awesomeResponse = await sendUserNotification();

  // if your code had an error somewhere along the code path
  if (codeHadError) throw new Error('just to show what would happen if there is an internal service error'); // will result in a `{ statusCode: 500 }` response, without any details of the error, to ensure no secrets are leaked in unexpected error stacks

  // return something
  return { statusCode: 200, body: { awesomeResponse } };
};

export const handler = createApiGatewayHandler({
  log,
  schema,
  logic: handle,
  cors: {
    origins: ['yoursite.com', 'yoursite.dev'], // e.g., allow requests only from these two domains
    withCredentials: true, // e.g., with credentials, so that the browser will send cookies
  },
});
```

# features

### Input Output Logging

Whats the first thing you want to know when something goes wrong? "What went wrong?". Whats next? "Why?". And after that? "How can I reproduce it?".

By logging the inputs, outputs, and errors - we answer these questions. Logging the inputs lets us reproduce the problem, logging the outputs lets us debug downstream responses, and logging errors tells us what and why things went wrong.

Specifically:

```ts
// on input
log.debug('handler.input', { event: handler.event });

// on output
log.debug('handler.output', { response: handler.response });

// on error
log.error('handler.output', { errorMessage: handler.error.message, stackTrace: handler.error.stack });
```

### Bad Request Error

Sometimes users make requests that are invalid - or don't make logical sense. These should not be reported in cloudwatch as errors with your lambda, but should still return an error to your users.

This library takes care of that, so that the only errors that are reported as invocation errors in cloudwatch are those that were unexpected or really were internal service errors.

Example:

```ts
import { BadRequestError } from 'simple-lambda-handlers';
// ...
const user = await findUserByUuid({ uuid });
if (!user) throw new BadRequestError(`user not found for uuid '${uuid}'`);
```

In this example, the user would receive an error response in their payload - but we would not report this as an error with your lambda to cloudwatch.

Why? Because in this case, nothing is going wrong with your service - the user simply gave us a uuid that doesn't relate to a real user, and we want to tell the user thats invalid.

### Input Validation

Run time type validation is not given by default in typescript (or javascript) - but can be added explicitly. This is one of the best things you can do to help developers debug and "fail fast".

By validating the inputs that your users pass in, you can make sure that your services wont throw ambiguous errors and do strange things - just because of some unexpected input. Additionally, by constraining your input thoroughly like this, you make it easy for users of your services to debug what is wrong with their request.

This libraries validation error returns a very explicit definition of exactly why their inputs failed validation, making debugging easy.

Example:

```ts
const schema = Joi.object().keys({
  userUuid: Joi.string().uuid().required(),
  message: Joi.string().uuid().required(),
});

interface SendUserNotificationEvent {
  userUuid: string;
  message: string;
}
const handle = ({ event }: { event: SendUserNotificationEvent }) => {
  // do things here...
};

export const handler = createStandardHandler({
  log,
  schema,
  logic: handle,
});
```

In this example, if the user passes in a `uuid` instead of a `userUuid`, they would be told that they are missing a required input, `userUuid`, with a `BadRequestError`.

### Extensibility

This library is built upon middy - and can be extended like any middy chain. For example:

```ts
export const handler = createStandardHandler({
  log,
  schema,
  logic: handle,
})
  .use(middleware1)
  .use(middleware2);
```
