import middy from '@middy/core';
import { APIGatewayProxyEventV2, APIGatewayProxyEvent } from 'aws-lambda';
import { isV2APIGatewayEvent } from '../normalization/apiGateway';

/**
 * AWS APIGatewayEventV1 and APIGatewayEventV2 have some differences in their shape
 * - some of these differences are backwards incompatible, without adding much value.
 * - this middleware normalizes the shape of the two requests into something that is backwards compatible, for easy upgrades.
 *
 * Specifically:
 * - exposes `eventV1.path` and `eventV2.rawPath` under `path` on the event
 */
export const apiGatewayEventShapeNormalizationMiddleware = () => {
  const before: middy.MiddlewareFunction<any, any> = async (request) => {
    // define the type of the event for usage below
    const event: APIGatewayProxyEvent | APIGatewayProxyEventV2 = request.event as any; // note: this is a reference to the event

    // ensure that the event given to the handler always has a `path` param
    if (isV2APIGatewayEvent(event)) request.event.path = event.rawPath; // for whatever reason, apiGatewayV2 response renamed `path` -> `rawPath`, so add `path` for backwards compatibility
  };
  return {
    before,
  };
};
