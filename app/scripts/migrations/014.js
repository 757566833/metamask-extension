/*

This migration removes provider from config and moves it too NetworkController.

*/

import { cloneDeep } from 'lodash';

const version = 14;

export default {
  version,

  migrate(originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      const state = versionedData.data;
      const newState = transformState(state);
      versionedData.data = newState;
    } catch (err) {
      console.log(' ');

      console.warn(`MetaMask Migration #${version}${err.stack}`);
    }
    return Promise.resolve(versionedData);
  },
};

function transformState(state) {
  console.log(' ');

  const newState = state;
  newState.NetworkController = {};
  newState.NetworkController.provider = newState.config.provider;
  delete newState.config.provider;
  return newState;
}
