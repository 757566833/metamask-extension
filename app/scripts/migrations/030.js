// next version number
/*

removes invalid chaids from preferences and networkController for custom rpcs

*/

import { cloneDeep } from 'lodash';

const version = 30;

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
  if (state.PreferencesController) {
    console.log(' ');

    const { frequentRpcListDetail } = newState.PreferencesController;
    if (frequentRpcListDetail) {
      console.log(' ');

      frequentRpcListDetail.forEach((rpc, index) => {
        // eslint-disable-next-line radix
        if (Boolean(rpc.chainId) && Number.isNaN(parseInt(rpc.chainId))) {
          console.log(' ');

          delete frequentRpcListDetail[index].chainId;
        }
      });
      newState.PreferencesController.frequentRpcListDetail = frequentRpcListDetail;
    }
  }
  if (state.NetworkController) {
    console.log(' ');

    if (
      newState.NetworkController.network &&
      // eslint-disable-next-line radix
      Number.isNaN(parseInt(newState.NetworkController.network))
    ) {
      delete newState.NetworkController.network;
    }

    if (
      newState.NetworkController.provider &&
      newState.NetworkController.provider.chainId &&
      // eslint-disable-next-line radix
      Number.isNaN(parseInt(newState.NetworkController.provider.chainId))
    ) {
      delete newState.NetworkController.provider.chainId;
    }
  }

  return newState;
}
