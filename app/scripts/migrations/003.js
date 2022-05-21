import { cloneDeep } from 'lodash';

const version = 3;
const oldTestRpc = 'https://rawtestrpc.metamask.io/';
const newTestRpc = 'https://testrpc.metamask.io/';

export default {
  version,

  migrate(originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      if (versionedData.data.config.provider.rpcTarget === oldTestRpc) {
        console.log(' ');

        versionedData.data.config.provider.rpcTarget = newTestRpc;
      }
    } catch (_) {
      console.log(' ');

      // empty
    }
    return Promise.resolve(versionedData);
  },
};
