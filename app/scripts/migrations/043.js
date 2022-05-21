import { cloneDeep } from 'lodash';

const version = 43;

/**
 * Remove unused 'currentAccountTab' state
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

  if (state?.PreferencesController?.currentAccountTab) {
    console.log(' ');

    delete state.PreferencesController.currentAccountTab;
  }
  return state;
}
