import middy from '@middy/core';
import type { Context } from 'aws-lambda';

import { EventSchema, HandlerLogic, LogMethods } from '../domain/general';
import { badRequestErrorMiddleware } from '../logic/middlewares/badRequestErrorMiddleware';
import { internalServiceErrorMiddleware } from '../logic/middlewares/internalServiceErrorMiddleware';
import { ioLoggingMiddleware } from '../logic/middlewares/ioLoggingMiddleware';
import { joiEventValidationMiddleware } from '../logic/middlewares/joiEventValidationMiddleware';

export const createStandardHandler = <I, O>({
  logic,
  schema,
  log,
}: {
  logic: HandlerLogic<I, O>;
  schema: EventSchema; // for event validation
  log: LogMethods; // for standard logging
}): middy.Middy<I, O, Context> => {
  return middy(logic)
    .use(badRequestErrorMiddleware()) // return an error object, instead of the lambda throwing an error, if it is a "bad request error"
    .use(internalServiceErrorMiddleware({ logError: log.error })) // log that we had an error loudly, if we had an error
    .use(ioLoggingMiddleware({ logDebug: log.debug })) // log the input and output to the lambda, for debugging
    .use(joiEventValidationMiddleware({ schema })); // validate the input against a schema
};
