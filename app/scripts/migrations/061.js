import { cloneDeep } from 'lodash';

const version = 61;

/**
 * Initialize attributes related to recovery seed phrase reminder
 */
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

  const currentTime = new Date().getTime();
  if (state.AppStateController) {
    console.log(' ');

    state.AppStateController.recoveryPhraseReminderHasBeenShown = false;
    state.AppStateController.recoveryPhraseReminderLastShown = currentTime;
  } else {
    state.AppStateController = {
      recoveryPhraseReminderHasBeenShown: false,
      recoveryPhraseReminderLastShown: currentTime,
    };
  }
  return state;
}
