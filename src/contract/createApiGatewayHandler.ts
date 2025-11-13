import middy from '@middy/core';
import httpCors from '@middy/http-cors';
import httpRequestJsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import httpSecurityHeaders from '@middy/http-security-headers';
import type {
  APIGatewayEventRequestContext,
  APIGatewayEventRequestContextV2,
  Context,
} from 'aws-lambda';

import { HTTPStatusCode } from '../domain/constants';
import { EventSchema, HandlerLogic, LogMethods } from '../domain/general';
import { apiGatewayEventShapeNormalizationMiddleware } from '../logic/middlewares/apiGatewayEventShapeNormalizationMiddleware';
import { badRequestErrorMiddleware } from '../logic/middlewares/badRequestErrorMiddleware';
import { internalServiceErrorMiddleware } from '../logic/middlewares/internalServiceErrorMiddleware';
import { ioLoggingMiddleware } from '../logic/middlewares/ioLoggingMiddleware';
import { joiEventValidationMiddleware } from '../logic/middlewares/joiEventValidationMiddleware';

export type ApiGatewayHandlerLogic<
  I,
  O,
  IH extends Record<string, string>,
> = HandlerLogic<
  {
    httpMethod: any;
    headers: IH;
    body: I;
    path: string;
    isBase64Encoded: boolean;
    pathParameters: { [name: string]: string } | null;
    queryStringParameters: { [name: string]: string } | null;
  },
  {
    statusCode: HTTPStatusCode;
    headers?: Record<string, string>;
    multiValueHeaders?: Record<string, string[]>;
    body?: O;
  },
  APIGatewayEventRequestContext | APIGatewayEventRequestContextV2
>;

export interface CORSOptions {
  /**
   * Specifies which origins to accept, setting the `Access-Control-Allow-Origin` header.
   *
   * This header notifies clients (i.e., browsers) that this server expects and accounts for cross-origin-requests from specific domains.
   *
   * Requiring the server to "opt-in" to requests from specific origins protects the users from cross-site attacks.
   *  - for example
   *    - an attacker clones your website and publishes it at `evil.attacker.com`
   *      - without CORS, your user's browser would happily send requests to your server from `evil.attacker.com`
   *      - with CORS, your user's browser will see that your server does not expect requests from `evil.attacker.com` and will protect the user
   *
   * You should make the origin as restrictive as possible, to enable the browser to best help users.
   *
   * Special options:
   * - `*`, if set to `*`, the browser will be notified that this server expects requests from all origins, telling the browser that you have considered the cross-site-security concerns that CORS prevents and are ok with the risk
   *
   * Refs:
   * - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
   */
  origins: '*' | string[];

  /**
   * When true, sets `Access-Control-Allow-Credentials=true` header, telling browsers to send/accept cookies to/from this server.
   *
   * This header notifies clients (i.e., browsers) that this server expects and accounts for cross-origin-request cookies (i.e., credentials) being sent or returned. Requiring the server to "opt-in" to setting and receiving cookies on browsers in cross-site requests protects the user from cross-site attacks.
   *
   * Special considerations:
   * - if the `origins` option is set to `*`, the `Access-Control-Allow-Origin` will be updated to match the request origin. (Browsers do not allow `*` as the origin with credentials turned on)
   *   - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSNotSupportingCredentials
   *
   * refs
   *  - https://stackoverflow.com/a/24689738/3068233
   */
  withCredentials: boolean;

  /**
   * Specifies which HTTP headers can be used in CORS requests, by setting the `Access-Control-Allow-Headers` header.
   *
   * This response is used by preflight requests.
   *
   * Defaults to `content-type,authorization`
   * - `content-type` is present in most requests
   * - `authorization` is a standard header in JWT based authentication patterns
   */
  headers?: string;
}

const corsInputToCorsConfig = (cors: CORSOptions) => {
  return {
    origin: cors.origins === '*' ? '*' : undefined,
    origins: Array.isArray(cors.origins) ? cors.origins : undefined,
    credentials: cors.withCredentials,
    headers: cors.headers ?? 'content-type,authorization', // default to 'content-type,authorization'
    maxAge: undefined,
    cacheControl: undefined,
  };
};

const serializers = [
  {
    regex: /^application\/json$/,
    serializer: ({ body }: { body: any }) => JSON.stringify(body),
  },
];

/**
 * `createApiGatewayHandler` simplifies interacting with AWS' Api Gateway to make it easy to address considerations such as statusCodes, cors, body serialization, and best security practices.
 *
 * A thorough example, with cors and auth tokens, can be found [in the readme](https://github.com/uladkasach/simple-lambda-handlers#api-gateway-handler).
 */
export const createApiGatewayHandler = <
  I,
  O,
  IH extends Record<string, string>,
>({
  log,
  schema,
  logic,
  cors,
  deserialize = { body: true },
}: {
  logic: ApiGatewayHandlerLogic<I, O, IH>;
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
        input?: (
          event: Parameters<ApiGatewayHandlerLogic<I, O, IH>>[0],
        ) => Record<string, any>;

        /**
         * .what = how to translate the output before logging it
         * .why = sanitize noisey or sensitive info, out of the logs
         */
        output?: (
          result: ReturnType<ApiGatewayHandlerLogic<I, O, IH>>,
        ) => Record<string, any>;
      };
  cors?: CORSOptions; // for returning coors if desired; allows a subset of `httpCors` options
  deserialize?: {
    /**
     * defines whether or not the body should be deserialized
     * - e.g., JSON.parse() if the body is a JSON string (i.e., `headers['content-type'].includes('application/json')`)
     *
     * defaults to true; set this to false if you'd like the raw string input
     */
    body: boolean;
  };
}): middy.Middy<
  Parameters<ApiGatewayHandlerLogic<I, O, IH>>[0],
  ReturnType<ApiGatewayHandlerLogic<I, O, IH>>,
  Context
> => {
  // extract log methods and optional translators from the log parameter
  const logMethods: LogMethods =
    'debug' in log ? log : (log as { methods: LogMethods }).methods;
  const logTranslate = {
    input:
      'input' in log
        ? log.input!
        : (event: Parameters<ApiGatewayHandlerLogic<I, O, IH>>[0]) => ({
            event,
          }),
    output:
      'output' in log
        ? log.output!
        : (result: ReturnType<ApiGatewayHandlerLogic<I, O, IH>>) => ({
            response: result,
          }),
  };

  const middlewares = [
    badRequestErrorMiddleware({ apiGateway: true }), // handle BadRequestErrors appropriately (i.e., dont log it as an error, but report to the user what failed)
    internalServiceErrorMiddleware({
      logError: logMethods.error,
      apiGateway: true,
    }), // log that we had an error loudly and cast it into a standard response
    ioLoggingMiddleware({
      logDebug: logMethods.debug,
      logTranslate,
    }), // log the input and output to the lambda, for debugging
    ...(cors ? [httpCors(corsInputToCorsConfig(cors))] : []), // adds cors headers to response, if cors was requested
    httpSecurityHeaders(), // adds best practice headers to the request; (!) note, also handles any uncaught errors to return them as statusCode: 500 responses
    ...(deserialize.body ? [httpRequestJsonBodyParser()] : []), // converts JSON body to object, when present; throws UnprocessableEntity (422 errors) for malformed json
    apiGatewayEventShapeNormalizationMiddleware(), // normalizes some attributes in the request event to make input consistent between ApiGatewayV1 requests and ApiGatewayV2 requests
    joiEventValidationMiddleware({ schema, apiGateway: true }), // validate the input against a schema
    httpResponseSerializer({ serializers, default: 'application/json' }),
  ];
  return middy(
    logic as any, // as any, since ApiGatewayHandlerLogic uses the, correctly, `APIGatewayEventRequestContext` - while middy expects the normal `Context` only (https://github.com/middyjs/middy/issues/540)
  ).use(middlewares) as any;
};
