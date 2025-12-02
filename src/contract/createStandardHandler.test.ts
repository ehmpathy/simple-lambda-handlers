import type middy from '@middy/core';
import type { Context } from 'aws-lambda';
import { BadRequestError } from 'helpful-errors';
import Joi from 'joi';
import { invokeHandlerForTesting } from 'simple-lambda-testing-methods';

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
      errorMessage: 'BadRequestError: bad request',
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

  describe('with input and output transformers', () => {
    let handlerWithTransformers: middy.Middy<any, any, Context>;
    const debugLogs: Array<{ message: string; metadata: any }> = [];
    const errorLogs: Array<{ message: string; metadata: any }> = [];

    beforeEach(() => {
      debugLogs.length = 0;
      errorLogs.length = 0;
      handlerWithTransformers = createStandardHandler({
        logic: async (event: {
          sensitiveData: string;
          publicData: string;
          throwError?: boolean;
        }) => {
          if (event.throwError) throw new Error('test error');
          return {
            result: 'success',
            secretToken: 'should-be-sanitized',
          };
        },
        schema: Joi.object().keys({
          sensitiveData: Joi.string().required(),
          publicData: Joi.string().required(),
          throwError: Joi.boolean().optional(),
        }),
        log: {
          methods: {
            debug: (message, metadata) => {
              debugLogs.push({ message, metadata });
            },
            error: (message, metadata) => {
              errorLogs.push({ message, metadata });
            },
          },
          input: (event) => ({ event: { publicData: event.publicData } }),
          output: (result) => ({ response: { result: result.result } }),
        },
      });
    });

    it('should use inputTransformer to sanitize input logs', async () => {
      const event = {
        sensitiveData: 'secret-password',
        publicData: 'public-info',
      };
      await invokeHandlerForTesting({
        event,
        handler: handlerWithTransformers,
      });

      const inputLog = debugLogs.find((log) => log.message === 'handler.input');
      expect(inputLog).toBeDefined();
      expect(inputLog?.metadata).toEqual({
        event: { publicData: 'public-info' },
      });
      expect(JSON.stringify(inputLog?.metadata)).not.toContain(
        'secret-password',
      );
    });

    it('should use outputTransformer to sanitize output logs', async () => {
      const event = {
        sensitiveData: 'secret-password',
        publicData: 'public-info',
      };
      await invokeHandlerForTesting({
        event,
        handler: handlerWithTransformers,
      });

      const outputLog = debugLogs.find(
        (log) => log.message === 'handler.output',
      );
      expect(outputLog).toBeDefined();
      expect(outputLog?.metadata).toEqual({
        response: { result: 'success' },
      });
      expect(JSON.stringify(outputLog?.metadata)).not.toContain(
        'should-be-sanitized',
      );
    });

    it('should use outputTransformer on error responses', async () => {
      const event = {
        sensitiveData: 'secret-password',
        publicData: 'public-info',
        throwError: true,
      };

      try {
        await invokeHandlerForTesting({
          event,
          handler: handlerWithTransformers,
        });
        throw new Error('should not reach here');
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        expect(error.message).toContain('test error');

        // The output log should still be created (for the error case)
        const outputLog = debugLogs.find(
          (log) => log.message === 'handler.output',
        );
        expect(outputLog).toBeDefined();
      }
    });

    it('should work with simple LogMethods (backward compatibility)', async () => {
      const simpleLogs: Array<{ message: string; metadata: any }> = [];
      const simpleHandler = createStandardHandler({
        logic: async (_event: { data: string }) => {
          return { result: 'ok' };
        },
        schema: Joi.object().keys({
          data: Joi.string().required(),
        }),
        log: {
          debug: (message, metadata) => {
            simpleLogs.push({ message, metadata });
          },
          error: (message, metadata) => {
            simpleLogs.push({ message, metadata });
          },
        },
      });

      await invokeHandlerForTesting({
        event: { data: 'test' },
        handler: simpleHandler,
      });

      const inputLog = simpleLogs.find(
        (log) => log.message === 'handler.input',
      );
      expect(inputLog).toBeDefined();
      expect(inputLog?.metadata).toEqual({ event: { data: 'test' } });

      const outputLog = simpleLogs.find(
        (log) => log.message === 'handler.output',
      );
      expect(outputLog).toBeDefined();
      expect(outputLog?.metadata).toEqual({ response: { result: 'ok' } });
    });

    it('should use input translator when only input is provided, while still using default output action', async () => {
      const partialTransformLogs: Array<{ message: string; metadata: any }> =
        [];
      const partialTransformHandler = createStandardHandler({
        logic: async (_event: {
          sensitiveData: string;
          publicData: string;
        }) => {
          return {
            result: 'success',
            secretToken: 'should-appear-in-default-output',
          };
        },
        schema: Joi.object().keys({
          sensitiveData: Joi.string().required(),
          publicData: Joi.string().required(),
        }),
        log: {
          methods: {
            debug: (message, metadata) => {
              partialTransformLogs.push({ message, metadata });
            },
            error: (message, metadata) => {
              partialTransformLogs.push({ message, metadata });
            },
          },
          input: (event) => ({ event: { publicData: event.publicData } }),
          // Note: output is intentionally not provided
        },
      });

      const event = {
        sensitiveData: 'secret-password',
        publicData: 'public-info',
      };
      const result = await invokeHandlerForTesting({
        event,
        handler: partialTransformHandler,
      });

      // Verify input transformer was used
      const inputLog = partialTransformLogs.find(
        (log) => log.message === 'handler.input',
      );
      expect(inputLog).toBeDefined();
      expect(inputLog?.metadata).toEqual({
        event: { publicData: 'public-info' },
      });
      expect(JSON.stringify(inputLog?.metadata)).not.toContain(
        'secret-password',
      );

      // Verify output uses default transformer (wraps full result in { response: ... })
      const outputLog = partialTransformLogs.find(
        (log) => log.message === 'handler.output',
      );
      expect(outputLog).toBeDefined();
      expect(outputLog?.metadata).toEqual({
        response: {
          result: 'success',
          secretToken: 'should-appear-in-default-output',
        },
      });
      expect(JSON.stringify(outputLog?.metadata)).toContain(
        'should-appear-in-default-output',
      );

      // Verify the actual result is correct
      expect(result).toEqual({
        result: 'success',
        secretToken: 'should-appear-in-default-output',
      });
    });
  });
});
