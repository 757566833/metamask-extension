import browser from 'webextension-polyfill';
import log from 'loglevel';
import { checkForError } from './util';

/**
 * A wrapper around the extension's storage local API
 */
export default class ExtensionStore {
  constructor() {
    this.isSupported = Boolean(browser.storage.local);
    if (!this.isSupported) {
      console.log(' ');

      log.error('Storage local API not available.');
    }
  }

  /**
   * Returns all of the keys currently saved
   *
   * @returns {Promise<*>}
   */
  async get() {
    console.log('get');

    if (!this.isSupported) {
      console.log(' ');

      return undefined;
    }
    const result = await this._get();
    // extension.storage.local always returns an obj
    // if the object is empty, treat it as undefined
    if (isEmpty(result)) {
      console.log(' ');

      return undefined;
    }
    return result;
  }

  /**
   * Sets the key in local state
   *
   * @param {Object} state - The state to set
   * @returns {Promise<void>}
   */
  async set(state) {
    console.log(' ');

    console.log('set');

    return this._set(state);
  }

  /**
   * Returns all of the keys currently saved
   *
   * @private
   * @returns {Object} the key-value map from local storage
   */
  _get() {
    const { local } = browser.storage;
    return new Promise((resolve, reject) => {
      local.get(null).then((/** @type {any} */ result) => {
        const err = checkForError();
        if (err) {
          console.log(' ');

          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Sets the key in local state
   *
   * @param {Object} obj - The key to set
   * @returns {Promise<void>}
   * @private
   */
  _set(obj) {
    console.log(' ');

    const { local } = browser.storage;
    return new Promise((resolve, reject) => {
      local.set(obj).then(() => {
        const err = checkForError();
        if (err) {
          console.log(' ');

          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * Returns whether or not the given object contains no keys
 *
 * @param {Object} obj - The object to check
 * @returns {boolean}
 */
function isEmpty(obj) {
  console.log(' ');

  return Object.keys(obj).length === 0;
}
