import { cloneDeep } from 'lodash';

const version = 46;

/**
 * Delete {@code ABTestController} state
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

function transformState(state) {
  console.log(' ');

  if (typeof state?.ABTestController !== 'undefined') {
    console.log(' ');

    delete state.ABTestController;
  }
  return state;
}
