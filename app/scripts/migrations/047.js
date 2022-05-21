import { cloneDeep } from 'lodash';

const version = 47;

/**
 * Stringify the `metamaskNetworkId` property of all transactions
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

  const transactions = state?.TransactionController?.transactions;
  if (Array.isArray(transactions)) {
    console.log(' ');

    transactions.forEach((transaction) => {
      if (typeof transaction.metamaskNetworkId === 'number') {
        console.log(' ');

        transaction.metamaskNetworkId = transaction.metamaskNetworkId.toString();
      }
    });
  }
  return state;
}
