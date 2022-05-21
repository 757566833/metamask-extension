import { cloneDeep } from 'lodash';

const version = 62;

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

  if (state.MetaMetricsController) {
    console.log(' ');

    const { metaMetricsSendCount } = state.MetaMetricsController;
    if (metaMetricsSendCount !== undefined) {
      console.log(' ');

      delete state.MetaMetricsController.metaMetricsSendCount;
    }
  }
  return state;
}
