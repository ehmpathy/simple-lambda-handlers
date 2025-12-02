import type middy from '@middy/core';

import type { LogMethods } from '../../domain/general';

/**
 * ioLoggingMiddleware simply logs a debug message for the input and output of a lambda
 */
export const ioLoggingMiddleware = <I = any, O = any>({
  logDebug,
  logTranslate,
}: {
  logDebug: LogMethods['debug'];
  logTranslate: {
    input: (event: I) => Record<string, any>;
    output: (result: O) => Record<string, any>;
  };
}): {
  before: middy.MiddlewareFunction<any, any>;
  after: middy.MiddlewareFunction<any, any>;
  onError: middy.MiddlewareFunction<any, any>;
} => {
  const before: middy.MiddlewareFunction<any, any> = async (handler) => {
    logDebug('handler.input', logTranslate.input(handler.event));
  };
  const after: middy.MiddlewareFunction<any, any> = async (handler) => {
    logDebug('handler.output', logTranslate.output(handler.response));
  };
  const onError: middy.MiddlewareFunction<any, any> = async (handler) => {
    // if there is a response, we must have handled the error already, so just log debug w/ response
    if (handler.response) {
      logDebug('handler.output', logTranslate.output(handler.response));
      return handler.error; // return error to pass it up the chain, since we're not handling it here
    }

    // if no response, then never handled, log the error
    logDebug('handler.output', {
      errorMessage: handler.error.message,
      stackTrace: handler.error.stack,
    });
    return handler.error; // return error to pass it up the chain, since we're not handling it here
  };
  return {
    before,
    after,
    onError,
  };
};
