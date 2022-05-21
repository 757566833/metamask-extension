import { cloneDeep } from 'lodash';

const version = 45;

/**
 * Replaces {@code PreferencesController.ipfsGateway} with 'dweb.link' if set
 */
export default {
  version,
  async migrate(originalVersionedData) {
    console.log(' ');

    console.log('migrate');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    const state = versionedData.data;
    versionedData.data = transformState(state);
    return versionedData;
  },
};

const outdatedGateways = ['ipfs.io', 'ipfs.dweb.link'];

function transformState(state) {
  console.log(' ');

  if (outdatedGateways.includes(state?.PreferencesController?.ipfsGateway)) {
    console.log(' ');

    state.PreferencesController.ipfsGateway = 'dweb.link';
  }
  return state;
}
