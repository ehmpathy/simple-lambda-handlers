import middy from '@middy/core';
import { Context } from 'aws-lambda';
import Joi from 'joi';
import { invokeHandlerForTesting } from 'simple-lambda-testing-methods';

import { BadRequestError } from '../logic/middlewares/badRequestErrorMiddleware';
import { createStandardHandler } from './createStandardHandler';

describe('createStandardHandler', () => {
  beforeEach(() => jest.clearAllMocks());
  let exampleHandler: middy.Middy<any, any, Context>;
  it('should be possible to instantiate a handler', () => {
    exampleHandler = createStandardHandler({
      logic: async (event: {
        throwInternalError: boolean;
        throwBadRequestError: boolean;
      }) => {
        if (event.throwInternalError) throw new Error('internal service error');
        if (event.throwBadRequestError)
          throw new BadRequestError('bad request');
        return 'success';
      },
      schema: Joi.object().keys({
        throwInternalError: Joi.boolean().required(),
        throwBadRequestError: Joi.boolean().required(),
      }),
      log: {
        debug: (message, metadata) => console.log(message, metadata), // eslint-disable-line no-console
        error: (message, metadata) => console.warn(message, metadata), //  eslint-disable-line no-console
      },
    });
  });
  it('should be possible to get the result of a handler', async () => {
    const result = await invokeHandlerForTesting({
      event: { throwInternalError: false, throwBadRequestError: false },
      handler: exampleHandler,
    });
    expect(result).toEqual('success');
  });
  it('should log the input and output of a lambda', async () => {
    const consoleLogMock = jest.spyOn(console, 'log');
    const event = { throwInternalError: false, throwBadRequestError: false };
    await invokeHandlerForTesting({
      event,
      handler: exampleHandler,
    });
    expect(consoleLogMock).toHaveBeenCalledTimes(2);
    expect(consoleLogMock).toHaveBeenNthCalledWith(1, 'handler.input', {
      event,
    });
    expect(consoleLogMock).toHaveBeenNthCalledWith(2, 'handler.output', {
      response: 'success',
    });
  });
  it('should log an error, if an error was thrown', async () => {
    const consoleWarnMock = jest.spyOn(console, 'warn');
    try {
      await invokeHandlerForTesting({
        event: { throwInternalError: true, throwBadRequestError: false },
        handler: exampleHandler,
      });
      throw new Error('should not reach here');
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      expect(error.message).toContain('internal service error');
      expect(consoleWarnMock).toHaveBeenCalledTimes(1);
      expect(consoleWarnMock).toHaveBeenNthCalledWith(
        1,
        'handler.error',
        expect.objectContaining({ errorMessage: 'internal service error' }),
      );
    }
  });
  it('should not report BadRequestErrors as lambda invocation errors and should not log them as an error either', async () => {
    const consoleLogMock = jest.spyOn(console, 'log');
    const consoleWarnMock = jest.spyOn(console, 'warn');
    const result = await invokeHandlerForTesting({
      event: { throwInternalError: false, throwBadRequestError: true },
      handler: exampleHandler,
    });
    expect(result).toMatchObject({
      errorMessage: 'bad request',
      errorType: 'BadRequestError',
    });
    expect(consoleWarnMock).not.toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledTimes(2); // start and end
  });
  it('should return a BadRequestError when joi event validation fails', async () => {
    const result = await invokeHandlerForTesting({
      event: { bananas: true },
      handler: exampleHandler,
    });
    expect(result.errorMessage).toContain(
      'Errors on 1 properties were found while validating properties for lambda invocation event',
    );
  });
});
