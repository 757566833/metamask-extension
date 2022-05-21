import { cloneDeep } from 'lodash';

const version = 4;

export default {
  version,

  migrate(versionedData) {
    console.log(' ');

    const safeVersionedData = cloneDeep(versionedData);
    safeVersionedData.meta.version = version;
    try {
      if (safeVersionedData.data.config.provider.type !== 'rpc') {
        console.log(' ');

        return Promise.resolve(safeVersionedData);
      }
      switch (safeVersionedData.data.config.provider.rpcTarget) {
        case 'https://testrpc.metamask.io/':
          safeVersionedData.data.config.provider = {
            type: 'testnet',
          };
          break;
        case 'https://rpc.metamask.io/':
          safeVersionedData.data.config.provider = {
            type: 'mainnet',
          };
          break;
        // No default
      }
    } catch (_) {
      console.log(' ');

      // empty
    }
    return Promise.resolve(safeVersionedData);
  },
};
