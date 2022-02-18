// eslint-disable-next-line import/no-extraneous-dependencies
import { APIGatewayProxyEventV2, APIGatewayProxyEvent } from 'aws-lambda'; // only importing types -> dev dep

/**
 * detects whether the event is a V2 APIGatewayEvent
 */
export const isV2APIGatewayEvent = (event: APIGatewayProxyEvent | APIGatewayProxyEventV2): event is APIGatewayProxyEventV2 =>
  (event as any)?.version?.startsWith('2');

/**
 * detects whether the event is a V1 APIGatewayEvent
 */
export const isV1APIGatewayEvent = (event: APIGatewayProxyEvent | APIGatewayProxyEventV2): event is APIGatewayProxyEvent =>
  !isV2APIGatewayEvent(event);
