// handlers

// forward the middy export, to eliminate "This is likely not portable. A type annotation is necessary." errors
export type { default as Middy } from '@middy/core';
export type {
  ApiGatewayHandlerLogic,
  CORSOptions,
} from './contract/createApiGatewayHandler';
export { createApiGatewayHandler } from './contract/createApiGatewayHandler';
export { createStandardHandler } from './contract/createStandardHandler';
export { HTTPStatusCode } from './domain/constants';
// types
export type { EventSchema, HandlerLogic, LogMethods } from './domain/general';
