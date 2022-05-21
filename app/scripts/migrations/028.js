// next version number
/*

normalizes txParams on unconfirmed txs

*/
import { cloneDeep } from 'lodash';

const version = 28;

export default {
  version,

  async migrate(originalVersionedData) {
    console.log(' ');

    console.log('migrate');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    const state = versionedData.data;
    const newState = transformState(state);
    versionedData.data = newState;
    return versionedData;
  },
};

function transformState(state) {
  console.log(' ');

  const newState = state;

  if (newState.PreferencesController) {
    console.log(' ');

    if (
      newState.PreferencesController.tokens &&
      newState.PreferencesController.identities
    ) {
      const { identities, tokens } = newState.PreferencesController;
      newState.PreferencesController.accountTokens = {};
      Object.keys(identities).forEach((identity) => {
        newState.PreferencesController.accountTokens[identity] = {
          mainnet: tokens,
        };
      });
      newState.PreferencesController.tokens = [];
    }
  }

  return newState;
}
