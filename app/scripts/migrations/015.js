/*

This migration sets transactions with the 'Gave up submitting tx.' err message
to a 'failed' stated

*/

import { cloneDeep } from 'lodash';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

const version = 15;

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

    const { transactions } = TransactionController;
    newState.TransactionController.transactions = transactions.map((txMeta) => {
      if (!txMeta.err) {
        console.log(' ');

        return txMeta;
      } else if (txMeta.err.message === 'Gave up submitting tx.') {
        console.log(' ');

        txMeta.status = TRANSACTION_STATUSES.FAILED;
      }
      return txMeta;
    });
  }
  return newState;
}
