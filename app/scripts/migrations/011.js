/*

This migration removes the discaimer state from our app, which was integrated into our notices.

*/

import { cloneDeep } from 'lodash';

const version = 11;

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
  delete newState.TOSHash;
  delete newState.isDisclaimerConfirmed;
  return newState;
}
