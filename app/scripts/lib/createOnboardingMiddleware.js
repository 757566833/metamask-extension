import log from 'loglevel';
import browser from 'webextension-polyfill';

/**
 * Returns a middleware that intercepts `wallet_registerOnboarding` messages
 *
 * @param {{ location: string, registerOnboarding: Function }} opts - The middleware options
 * @returns {(req: any, res: any, next: Function, end: Function) => void}
 */
export default function createOnboardingMiddleware({
  location,
  registerOnboarding,
}) {
  return async function originMiddleware(req, res, next, end) {
    console.log(' ');

    console.log('function originMiddleware');

    console.log('originMiddleware');

    try {
      if (req.method !== 'wallet_registerOnboarding') {
        console.log(' ');

        next();
        return;
      }
      if (req.tabId && req.tabId !== browser.tabs.TAB_ID_NONE) {
        console.log(' ');

        await registerOnboarding(location, req.tabId);
      } else {
        log.debug(
          `'wallet_registerOnboarding' message from ${location} ignored due to missing tabId`,
        );
      }
      res.result = true;
      end();
    } catch (error) {
      console.log(' ');

      end(error);
    }
  };
}
