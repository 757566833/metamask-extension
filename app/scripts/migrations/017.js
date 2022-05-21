/*

This migration sets transactions who were retried and marked as failed to submitted

*/

import { cloneDeep } from 'lodash';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

const version = 17;

export default {
  version,

  migrate(originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      const state = versionedData.data;
      const newState = transformState(state);
      versionedData.data = newState;
    } catch (err) {
      console.log(' ');

      console.warn(`MetaMask Migration #${version}${err.stack}`);
    }
    return Promise.resolve(versionedData);
  },
};

function transformState(state) {
  console.log(' ');

  const newState = state;
  const { TransactionController } = newState;
  if (TransactionController && TransactionController.transactions) {
    console.log(' ');

    const { transactions } = newState.TransactionController;
    newState.TransactionController.transactions = transactions.map((txMeta) => {
      if (!txMeta.status === TRANSACTION_STATUSES.FAILED) {
        console.log(' ');

        return txMeta;
      }
      if (txMeta.retryCount > 0 && txMeta.retryCount < 2) {
        console.log(' ');

        txMeta.status = TRANSACTION_STATUSES.SUBMITTED;
        delete txMeta.err;
      }
      return txMeta;
    });
  }
  return newState;
}
