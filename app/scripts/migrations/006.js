/*

This migration moves KeyringController.selectedAddress to PreferencesController.selectedAddress

*/

import { cloneDeep } from 'lodash';

const version = 6;

export default {
  version,

  migrate(originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      const state = versionedData.data;
      const newState = migrateState(state);
      versionedData.data = newState;
    } catch (err) {
      console.log(' ');

      console.warn(`MetaMask Migration #${version}${err.stack}`);
    }
    return Promise.resolve(versionedData);
  },
};

function migrateState(state) {
  console.log(' ');

  const keyringSubstate = state.KeyringController;

  // add new state
  const newState = {
    ...state,
    PreferencesController: {
      selectedAddress: keyringSubstate.selectedAccount,
    },
  };

  // rm old state
  delete newState.KeyringController.selectedAccount;

  return newState;
}
