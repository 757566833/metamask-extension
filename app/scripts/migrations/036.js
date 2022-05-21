import { cloneDeep } from 'lodash';

const version = 36;

/**
 * The purpose of this migration is to remove the {@code privacyMode} feature flag.
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

  const { PreferencesController } = state;

  if (PreferencesController) {
    console.log(' ');

    const featureFlags = PreferencesController.featureFlags || {};

    if (typeof featureFlags.privacyMode !== 'undefined') {
      console.log(' ');

      delete featureFlags.privacyMode;
    }
  }

  return state;
}
