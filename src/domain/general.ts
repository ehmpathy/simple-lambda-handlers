import type { Context } from 'aws-lambda';
import type { Schema as JoiSchema } from 'joi';

// only importing types -> dev dep

export type HandlerLogic<I, O, C = Context> = (
  event: I,
  context: C,
) => Promise<O>;

export type EventSchema = JoiSchema;

export interface LogMethods {
  debug: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
}
