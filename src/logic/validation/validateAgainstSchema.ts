// eslint-disable-next-line import/no-extraneous-dependencies
import { BadRequestError } from '@ehmpathy/error-fns';
import { ValidationError } from 'joi';

// only importing types -> dev dep
import { EventSchema } from '../../domain/general';

interface EventValidationErrorDetail {
  message: string;
  path: string;
  type: string;
}
export class EventValidationError extends BadRequestError {
  public details: EventValidationErrorDetail[];
  public event: any;

  constructor({ error, event }: { error: ValidationError; event: any }) {
    const details = error.details.map((detail) => ({
      message: detail.message,
      path: detail.path.join('.'),
      type: detail.type,
    }));

    const message = `
Errors on ${
      Object.keys(details).length
    } properties were found while validating properties for lambda invocation event:
${JSON.stringify(details, null, 2)}

Event:
${JSON.stringify(event, null, 2)}
    `.trim();
    super(message);

    this.details = details;
    this.event = event;
  }
}

export const validateAgainstSchema = async ({
  event,
  schema,
}: {
  event: any;
  schema: EventSchema;
}): Promise<void> => {
  // validate the event
  const result = schema.validate(event);

  // if event is invalid, throw error
  if (result.error)
    throw new EventValidationError({ error: result.error, event });
};
