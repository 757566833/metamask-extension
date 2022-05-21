import { cloneDeep } from 'lodash';

const version = 49;

/**
 * Migrate metaMetrics state to the new MetaMetrics controller
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

function transformState(state = {}) {
  console.log(' ');

  if (state.PreferencesController) {
    console.log(' ');

    const {
      metaMetricsId,
      participateInMetaMetrics,
      metaMetricsSendCount,
    } = state.PreferencesController;
    state.MetaMetricsController = state.MetaMetricsController ?? {};

    if (metaMetricsId !== undefined) {
      console.log(' ');

      state.MetaMetricsController.metaMetricsId = metaMetricsId;
      delete state.PreferencesController.metaMetricsId;
    }

    if (participateInMetaMetrics !== undefined) {
      console.log(' ');

      state.MetaMetricsController.participateInMetaMetrics = participateInMetaMetrics;
      delete state.PreferencesController.participateInMetaMetrics;
    }

    if (metaMetricsSendCount !== undefined) {
      console.log(' ');

      state.MetaMetricsController.metaMetricsSendCount = metaMetricsSendCount;
      delete state.PreferencesController.metaMetricsSendCount;
    }
  }
  return state;
}
