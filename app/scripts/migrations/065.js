import { cloneDeep } from 'lodash';

const version = 65;

/**
 * Removes metaMetricsSendCount from MetaMetrics controller
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

  if (state.PreferencesController) {
    console.log(' ');

    const {
      completedOnboarding,
      firstTimeFlowType,
    } = state.PreferencesController;
    state.OnboardingController = state.OnboardingController ?? {};

    if (completedOnboarding !== undefined) {
      console.log(' ');

      state.OnboardingController.completedOnboarding = completedOnboarding;
      delete state.PreferencesController.completedOnboarding;
    }
    if (firstTimeFlowType !== undefined) {
      console.log(' ');

      state.OnboardingController.firstTimeFlowType = firstTimeFlowType;
      delete state.PreferencesController.firstTimeFlowType;
    }
  }

  return state;
}
