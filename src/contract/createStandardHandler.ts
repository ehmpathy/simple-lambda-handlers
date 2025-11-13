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
  log:
    | LogMethods
    | {
        /**
         * .what = the log methods to use
         */
        methods: LogMethods;
        /**
         * .what = how to translate the input before logging it
         * .why = sanitize noisey or sensitive info, out of the logs
         */
        input?: (event: I) => Record<string, any>;

        /**
         * .what = how to translate the output before logging it
         * .why = sanitize noisey or sensitive info, out of the logs
         */
        output?: (result: O) => Record<string, any>;
      }; // for standard logging
}): middy.Middy<I, O, Context> => {
  // extract log methods and optional translators from the log parameter
  const logMethods: LogMethods =
    'debug' in log ? log : (log as { methods: LogMethods }).methods;
  const logTranslate = {
    input: 'input' in log ? log.input! : (event: I) => ({ event }),
    output:
      'output' in log ? log.output! : (result: O) => ({ response: result }),
  };

  return middy(logic)
    .use(
      // return an error object, instead of the lambda throwing an error, if it is a "bad request error"
      badRequestErrorMiddleware(),
    )
    .use(
      // log that we had an error loudly, if we had an error
      internalServiceErrorMiddleware({ logError: logMethods.error }),
    )
    .use(
      // log the input and output to the lambda, for debugging
      ioLoggingMiddleware({
        logDebug: logMethods.debug,
        logTranslate,
      }),
    )
    .use(joiEventValidationMiddleware({ schema })); // validate the input against a schema
};
