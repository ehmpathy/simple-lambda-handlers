import { BadRequestError } from 'helpful-errors';

import { decideIsBadRequestError } from './badRequestErrorMiddleware';

describe('decideIsBadRequestError', () => {
  it('should return true for an instance of BadRequestError', () => {
    const error = new BadRequestError('test');
    expect(decideIsBadRequestError({ error })).toBe(true);
  });

  it('should return true for an error with constructor name "BadRequestError"', () => {
    // simulate a class named BadRequestError from a different package/realm
    class BadRequestError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
      }
    }
    const error = new BadRequestError('test');
    expect(decideIsBadRequestError({ error })).toBe(true);
  });

  it('should return true for an error that extends a class named "BadRequestError"', () => {
    // simulate a class named BadRequestError from a different package/realm
    class BadRequestError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
      }
    }
    class CustomBadRequestError extends BadRequestError {
      constructor(message: string) {
        super(message);
        this.name = 'CustomBadRequestError';
      }
    }
    const error = new CustomBadRequestError('test');
    expect(decideIsBadRequestError({ error })).toBe(true);
  });

  it('should return true for an error that extends BadRequestError from helpful-errors', () => {
    class CustomBadRequestError extends BadRequestError {
      constructor(message: string) {
        super(message);
        this.name = 'CustomBadRequestError';
      }
    }
    const error = new CustomBadRequestError('test');
    expect(decideIsBadRequestError({ error })).toBe(true);
  });

  it('should return true for a deeply nested extension of BadRequestError', () => {
    // simulate a class named BadRequestError from a different package/realm
    class BadRequestError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
      }
    }
    class Level1Error extends BadRequestError {}
    class Level2Error extends Level1Error {}
    class Level3Error extends Level2Error {}
    const error = new Level3Error('test');
    expect(decideIsBadRequestError({ error })).toBe(true);
  });

  it('should return false for a generic Error', () => {
    const error = new Error('test');
    expect(decideIsBadRequestError({ error })).toBe(false);
  });

  it('should return false for a custom error that does not extend BadRequestError', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }
    const error = new CustomError('test');
    expect(decideIsBadRequestError({ error })).toBe(false);
  });
});
