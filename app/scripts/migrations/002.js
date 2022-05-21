import { cloneDeep } from 'lodash';

const version = 2;

export default {
  version,

  migrate(originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      if (versionedData.data.config.provider.type === 'etherscan') {
        console.log(' ');

        versionedData.data.config.provider.type = 'rpc';
        versionedData.data.config.provider.rpcTarget =
          'https://rpc.metamask.io/';
      }
    } catch (_) {
      console.log(' ');

      // empty
    }
    return Promise.resolve(versionedData);
  },
};
