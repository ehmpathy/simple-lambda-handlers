import middy from '@middy/core';

import { validateAgainstSchema } from '../validation/validateAgainstSchema';
import { EventSchema } from '../../domain/general';

export const joiEventValidationMiddleware = ({ schema }: { schema: EventSchema }) => {
  const before: middy.MiddlewareFunction<any, any> = async (handler) => validateAgainstSchema({ event: handler.event, schema });
  return {
    before,
  };
};
