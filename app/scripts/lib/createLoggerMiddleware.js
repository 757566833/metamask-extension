import log from 'loglevel';

/**
 * Returns a middleware that logs RPC activity
 *
 * @param {{ origin: string }} opts - The middleware options
 * @returns {Function}
 */
export default function createLoggerMiddleware(opts) {
  console.log(' ');

  return function loggerMiddleware(
    /** @type {any} */ req,
    /** @type {any} */ res,
    /** @type {Function} */ next,
  ) {
    next((/** @type {Function} */ cb) => {
      if (res.error) {
        console.log(' ');

        log.error('Error in RPC response:\n', res);
      }
      if (req.isMetamaskInternal) {
        console.log(' ');

        return;
      }
      log.info(`RPC (${opts.origin}):`, req, '->', res);
      cb();
    });
  };
}
