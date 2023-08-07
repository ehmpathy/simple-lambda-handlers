import middy from '@middy/core';

import { validateAgainstSchema } from '../validation/validateAgainstSchema';
import { EventSchema } from '../../domain/general';
import { ApiGatewayHandlerLogic } from '../..';

export const joiEventValidationMiddleware = ({ schema, apiGateway }: { schema: EventSchema; apiGateway?: boolean }) => {
  const before: middy.MiddlewareFunction<any, any> = async (request) => {
    const eventToValidate = (() => {
      if (apiGateway) {
        /**
         * if its an api gateway event, sanitize the event payload before validating it to ensure there's no risk of sensitive info being leaked to the client
         *
         * background:
         * - api gateway sends lots of info on the api gateway event
         *   - some of which contains sensitive info that we dont want to leak publically
         *      - e.g., event.requestContext has awsAccountId, apiGatewayHost, etc
         * - the error that the validation logic throws includes the full event that failed in its error message
         *   - this is desired because it aids in debugging
         *   - this causes a problem in this case though, because aws adds sensitive data into the api gateway event (data which is typically reserved for a separate context object)
         * - only a subset of the api gateway event is actually exposed for users of simple-lambda-handlers to use, by type def
         *   - this is because its bad practice to rely on metadata for your contract (that metadata is provider specific and may change over time)
         *   - this gives us the flexibility of also excluding it from event validation
         *
         * solution:
         * - carefully pick which attributes we want to expose through validation
         * - only run those attributes through validation -> only risk returning that data to the client
         */
        const sanitizedApiGatewayEvent: Parameters<ApiGatewayHandlerLogic<any, any>>[0] = {
          httpMethod: request.event.httpMethod,
          headers: request.event.headers,
          body: request.event.body,
          path: request.event.path,
          isBase64Encoded: request.event.isBase64Encoded,
          pathParameters: request.event.pathParameters,
          queryStringParameters: request.event.queryStringParameters,
          // note that we specifically do NOT include the requestContext - since the request context has info we dont want to leak (including awsAccountId)
        };
        return JSON.parse(JSON.stringify(sanitizedApiGatewayEvent)); // stringify and parse to remove undefined properties; safe to do since events must be serializable in order to reach the lambda over wire anyway
      }

      // otherwise, just return the full event. no sanitation required
      return request.event;
    })();

    // and run validation on the event
    return validateAgainstSchema({
      event: eventToValidate,
      schema,
    });
  };
  return {
    before,
  };
};
