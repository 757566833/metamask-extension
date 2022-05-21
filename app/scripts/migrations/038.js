import { cloneDeep } from 'lodash';

const version = 38;

/**
 * The purpose of this migration is to assign all users to a test group for the fullScreenVsPopup a/b test
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

  const { ABTestController: ABTestControllerState = {} } = state;
  const { abTests = {} } = ABTestControllerState;

  if (abTests.fullScreenVsPopup) {
    console.log(' ');

    return state;
  }

  return {
    ...state,
    ABTestController: {
      ...ABTestControllerState,
      abTests: {
        ...abTests,
        fullScreenVsPopup: 'control',
      },
    },
  };
}
