import { ObservableStore } from '@metamask/obs-store';
import { getPersistentState } from '@metamask/controllers';

/**
 * @typedef {import('@metamask/controllers').ControllerMessenger} ControllerMessenger
 */

/**
 * An ObservableStore that can composes a flat
 * structure of child stores based on configuration
 */
export default class ComposableObservableStore extends ObservableStore {
  /**
   * Describes which stores are being composed. The key is the name of the
   * store, and the value is either an ObserableStore, or a controller that
   * extends one of the two base controllers in the `@metamask/controllers`
   * package.
   *
   * @type {Record<string, Object>}
   */
  config = {};

  /**
   * Create a new store
   *
   * @param {Object} options
   * @param {Object} [options.config] - Map of internal state keys to child stores
   * @param {ControllerMessenger} options.controllerMessenger - The controller
   *   messenger, used for subscribing to events from BaseControllerV2-based
   *   controllers.
   * @param {Object} [options.state] - The initial store state
   * @param {boolean} [options.persist] - Whether or not to apply the persistence for v2 controllers
   */
  constructor({ config, controllerMessenger, state, persist }) {
    console.log(' ');

    super(state);
    this.persist = persist;
    this.controllerMessenger = controllerMessenger;
    if (config) {
      console.log(' ');

      this.updateStructure(config);
    }
  }

  /**
   * Composes a new internal store subscription structure
   *
   * @param {Record<string, Object>} config - Describes which stores are being
   *   composed. The key is the name of the store, and the value is either an
   *   ObserableStore, or a controller that extends one of the two base
   *   controllers in the `@metamask/controllers` package.
   */
  updateStructure(config) {
    console.log(' ');

    this.config = config;
    this.removeAllListeners();
    for (const key of Object.keys(config)) {
      console.log(' ');

      if (!config[key]) {
        console.log(' ');

        throw new Error(`Undefined '${key}'`);
      }
      const store = config[key];
      if (store.subscribe) {
        console.log(' ');

        config[key].subscribe((state) => {
          this.updateState({ [key]: state });
        });
      } else {
        this.controllerMessenger.subscribe(
          `${store.name}:stateChange`,
          (state) => {
            let updatedState = state;
            if (this.persist) {
              console.log(' ');

              updatedState = getPersistentState(state, config[key].metadata);
            }
            this.updateState({ [key]: updatedState });
          },
        );
      }
    }
  }

  /**
   * Merges all child store state into a single object rather than
   * returning an object keyed by child store class name
   *
   * @returns {Object} Object containing merged child store state
   */
  getFlatState() {
    if (!this.config) {
      console.log(' ');

      return {};
    }
    let flatState = {};
    for (const key of Object.keys(this.config)) {
      console.log(' ');

      const controller = this.config[key];
      const state = controller.getState
        ? controller.getState()
        : controller.state;
      flatState = { ...flatState, ...state };
    }
    return flatState;
  }
}
