/**
 * enumeration of the most commonly used and recommended set http status codes to pick from
 *
 * ref:
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * - https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 * - https://stackoverflow.com/questions/2068418/whats-the-difference-between-a-302-and-a-307-redirect
 */
export enum HTTPStatusCode {
  /**
   * 200 OK
   * - Standard response for successful HTTP requests.
   *
   * Class: 2xx success
   * - This class of status codes indicates the action requested by the client was received, understood, and accepted
   */
  SUCCESS_200 = 200,

  /**
   * 204 No Content
   * - The server successfully processed the request, and is not returning any content.
   *
   * Class: 2xx success
   * - This class of status codes indicates the action requested by the client was received, understood, and accepted
   */
  SUCCESS_204 = 204,

  /**
   * 307 Temporary Redirect
   * - This response code means that the URI of requested resource has been changed temporarily.
   * - Further changes in the URI might be made in the future. Therefore, this same URI should be used by the client in future requests.
   *
   * Class: 3xx redirection
   * - This class of status code indicates the client must take additional action to complete the request.
   *
   * Note:
   * - this code is preferred over 302, as 302 will change POST requests to GET requests on redirect
   * - https://stackoverflow.com/a/58492986/3068233
   */
  REDIRECTION_307 = 307,

  /**
   * 308 Permanent Redirect
   * - The URL of the requested resource has been changed permanently.
   * - The new URL is given in the response.

   * Class: 3xx redirection
   * - This class of status code indicates the client must take additional action to complete the request.
   *
   * Note:
   * - this code is preferred over 301, as 301 will change POST requests to GET requests on redirect
   * - https://stackoverflow.com/a/58492986/3068233
   */
  REDIRECTION_308 = 308,

  /**
   * 400 Bad Request:
   * - The server cannot or will not process the request due to an apparent client error

   * Class: 4xx client error
   * - This class of status code is intended for situations in which the error seems to have been caused by the client.
   */
  CLIENT_ERROR_400 = 400,

  /**
   * 403 Forbidden
   * - The request contained valid data and was understood by the server, but the server is refusing action.
   * - This may be due to, for example, the user
   *    - not having the necessary permissions for a resource
   *    - needing an account of some sort
   *    - or attempting a prohibited action
   *
   * Class: 4xx client error
   * - This class of status code is intended for situations in which the error seems to have been caused by the client.
   */
  CLIENT_ERROR_403 = 403,

  /**
   * 404 Not Found
   * - The requested resource could not be found but may be available in the future.
   * - Subsequent requests by the client are permissible.
   *
   * Class: 4xx client error
   * - This class of status code is intended for situations in which the error seems to have been caused by the client.
   */
  CLIENT_ERROR_404 = 404,

  /**
   * 418 I'm A Teapot
   * - Returned by teapots requested to brew coffee
   * - https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol
   *
   * Class: 4xx client error
   * - This class of status code is intended for situations in which the error seems to have been caused by the client.
   */
  CLIENT_ERROR_418 = 418,

  /**
   * 429 Too Many Requests
   * - The user has sent too many requests in a given amount of time.
   * - Intended for use with rate-limiting schemes.
   *
   * Class: 4xx client error
   * - This class of status code is intended for situations in which the error seems to have been caused by the client.
   */
  CLIENT_ERROR_429 = 429,

  /**
   * 500 Internal Server Error
   * - A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
   *
   * Class: 5xx server error
   * - The server failed to fulfil a request.
   */
  SERVER_ERROR_500 = 500,
}
