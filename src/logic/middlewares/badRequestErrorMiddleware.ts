/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestError } from '@ehmpathy/error-fns';
import middy from '@middy/core';

import { HTTPStatusCode } from '../../domain/constants';

/**
 * BadRequestError
 * - thrown when a lambda successfully decides a request was invalid
 * - enables conveniently specifying that
 *    - the lambda invocation executed successfully
 *    - the request was invalid
 *
 * Effect:
 * - exit the code path conveniently when this state is identified
 * - report to the caller that their request has failed
 * - report to aws-lambda infrastructure that this invocation has succeeded
 *    - meaning this invocation will not be marked as an error in aws-cloudwatch
 *    - meaning this invocation will not be retried by any retry mechanisms (e.g., sqs, kinesis, etc)
 *
 * Why? because a BadRequestError means that the problem is with the client's request, not the internal workings of this service.
 * - i.e., this service is functioning as intended and any debugging needs to be done in the client who called this.
 *
 * Tip: Use a lambda client like [simple-lambda-client](https://github.com/uladkasach/simple-lambda-client) to hydrate the error client side if invoking a lambda directly. Otherwise, if invoking an api-gateway backed lambda through rest, your typical rest client will hydrate the error when it sees statusCode != 200.
 */

/**
 * badRequestErrorMiddleware
 * - handles ensuring that bad-request-errors are handled and the lambda successfully returns an error response
 *   - "successfully return" meaning the lambda will not be marked as having a failure, it will successfully execute
 *   - "return an error" meaning the client will get an error object in their response payload, instead of a success response
 *
 * context:
 * - errors that ta service can produce, generically, come in two flavors:
 *   - BadRequestErrors:
 *    - i.e., either in input validation or in business logic, we decide that this is a bad request.
 *   - InternalServiceErrors
 *    - i.e., everything else
 * - for BadRequestErrors
 *   - we SHOULD NOT report that this lambda execution failed.
 *     - it did not. there was nothing wrong with how the lambda was executing.
 *     - i.e., there is no reason to debug this service. its the consumer who is wrong
 * - for InternalServiceErrors (i.e., any error other than "BadRequestError")
 *   - we SHOULD report that this lambda execution failed.
 *   - i.e., for some reason, we were not able to handle a request - and we should look into it
 */
export const badRequestErrorMiddleware = (opts?: { apiGateway?: boolean }) => {
  const onError: middy.MiddlewareFunction<any, any> = async (handler) => {
    // 1. check if the error was due to a bad request from the user. if it was, just return the error object, so its not reported as our lambda breaking in aws cloudwatch
    if (handler.error instanceof BadRequestError) {
      // determine how to format the response, based on whether the response is for api gateway or standard invocation
      const response = opts?.apiGateway
        ? {
            statusCode: HTTPStatusCode.CLIENT_ERROR_400,
            body: {
              errorMessage: handler.error.message,
              errorType: 'BadRequestError',
            },
          }
        : {
            errorMessage: handler.error.message,
            errorType: 'BadRequestError',
            stackTrace: handler.error.stack,
          };

      // report the error to the user in the response
      handler.response = response; // eslint-disable-line no-param-reassign

      // and return nothing so that middy knows we handled the error -> so no one tells cloudwatch about the error
      return;
    }

    // 2. since the error was not due to bad input, do nothing; it will be treated like a lambda invocation error that we will see in cloudwatch
    // eslint-disable-next-line consistent-return
    return handler.error; // return error to pass it up the chain, since we're not handling it here
  };
  return {
    onError,
  };
};
