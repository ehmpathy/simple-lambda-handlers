// handlers
export { createApiGatewayHandler } from './contract/createApiGatewayHandler';
export { createStandardHandler } from './contract/createStandardHandler';

// types
export { HandlerLogic, EventSchema, LogMethods } from './domain/general';
export { HTTPStatusCode } from './domain/constants';
export {
  ApiGatewayHandlerLogic,
  CORSOptions,
} from './contract/createApiGatewayHandler';

// forward the middy export, to eliminate "This is likely not portable. A type annotation is necessary." errors
export type { default as Middy } from '@middy/core';
