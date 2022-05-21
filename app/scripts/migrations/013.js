/*

This migration modifies the network config from ambiguous 'testnet' to explicit 'ropsten'

*/

import { cloneDeep } from 'lodash';

const version = 13;

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
  const { config } = newState;
  if (config && config.provider) {
    console.log(' ');

    if (config.provider.type === 'testnet') {
      console.log(' ');

      newState.config.provider.type = 'ropsten';
    }
  }
  return newState;
}
