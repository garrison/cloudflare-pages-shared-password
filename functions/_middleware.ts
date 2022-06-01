// Mash-up of https://developers.cloudflare.com/workers/examples/basic-auth/ and
// https://developers.cloudflare.com/pages/platform/functions#exporting-middleware

/**
 * Shows how to restrict access using the HTTP Basic schema.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
 * @see https://tools.ietf.org/html/rfc7617
 *
 * A user-id containing a colon (":") character is invalid, as the
 * first colon in a user-pass string separates user and password.
 */
const BASIC_USER = 'admin';
const BASIC_PASS = 'admin';

/**
 * Receives a HTTP request and replies with a response.
 * @param {Context} context
 * @returns {Promise<Response>}
 */
export async function onRequest({ request, next }) {
  const { protocol, pathname } = new URL(request.url);

  // In the case of a Basic authentication, the exchange
  // MUST happen over an HTTPS (TLS) connection to be secure.
  if ('https:' !== protocol || 'https' !== request.headers.get('x-forwarded-proto')) {
    return new Response('Please use a HTTPS connection.', { status: 403 });
  }

  if (pathname == '/logout') {
    // Invalidate the "Authorization" header by returning a HTTP 401.
    // We do not send a "WWW-Authenticate" header, as this would trigger
    // a popup in the browser, immediately asking for credentials again.
    return new Response('Logged out.', { status: 401 });
  }

  // The "Authorization" header is sent when authenticated.
  if (request.headers.has('Authorization')) {
    const { user, pass } = basicAuthentication(request);
    if (user === BASIC_USER && pass === BASIC_PASS) {
      const response = await next();
      const newResponse = response.clone();
      newResponse.headers.set('Cache-Control', 'no-store');
      return newResponse;
    }
  }

  // Not authenticated.
  return new Response('You need to login.', {
    status: 401,
    headers: {
      // Prompts the user for credentials.
      'WWW-Authenticate': 'Basic realm="my scope", charset="UTF-8"',
    },
  });
}

/**
 * Parse HTTP Basic Authorization value.
 * @param {Request} request
 * @throws {BadRequestException}
 * @returns {{ user: string, pass: string }}
 */
function basicAuthentication(request) {
  const Authorization = request.headers.get('Authorization');

  const [scheme, encoded] = Authorization.split(' ');

  // The Authorization header must start with Basic, followed by a space.
  if (!encoded || scheme !== 'Basic') {
    throw new BadRequestException('Malformed authorization header.');
  }

  // Decodes the base64 value and performs unicode normalization.
  // @see https://datatracker.ietf.org/doc/html/rfc7613#section-3.3.2 (and #section-4.2.2)
  // @see https://dev.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
  const buffer = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  const decoded = new TextDecoder().decode(buffer).normalize();

  // The username & password are split by the first colon.
  //=> example: "username:password"
  const index = decoded.indexOf(':');

  // The user & password are split by the first colon and MUST NOT contain control characters.
  // @see https://tools.ietf.org/html/rfc5234#appendix-B.1 (=> "CTL = %x00-1F / %x7F")
  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    throw new BadRequestException('Invalid authorization value.');
  }

  return {
    user: decoded.substring(0, index),
    pass: decoded.substring(index + 1),
  };
}

class BadRequestException extends Error {
  constructor(reason) {
    super(reason);
    this.status = 400;
    this.statusText = 'Bad Request';
    this.reason = reason;
  }
}
