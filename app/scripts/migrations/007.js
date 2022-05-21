/*

This migration breaks out the TransactionManager substate

*/

import { cloneDeep } from 'lodash';

const version = 7;

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

  const newState = {
    ...state,
    TransactionManager: {
      transactions: state.transactions || [],
      gasMultiplier: state.gasMultiplier || 1,
    },
  };
  delete newState.transactions;
  delete newState.gasMultiplier;

  return newState;
}
