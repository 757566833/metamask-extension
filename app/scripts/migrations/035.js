// next version number
/*

Removes the deprecated 'seedWords' state

*/

import { cloneDeep } from 'lodash';

const version = 35;

export default {
  version,

  async migrate(originalVersionedData) {
    console.log(' ');

    console.log('migrate');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    versionedData.data = transformState(versionedData.data);
    return versionedData;
  },
};

function transformState(state) {
  console.log(' ');

  if (
    state.PreferencesController &&
    state.PreferencesController.seedWords !== undefined
  ) {
    delete state.PreferencesController.seedWords;
  }
  return state;
}
