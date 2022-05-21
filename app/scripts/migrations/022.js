/*

This migration adds submittedTime to the txMeta if it is not their

*/

import { cloneDeep } from 'lodash';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

const version = 22;

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
      if (
        txMeta.status !== TRANSACTION_STATUSES.SUBMITTED ||
        txMeta.submittedTime
      ) {
        return txMeta;
      }
      txMeta.submittedTime = new Date().getTime();
      return txMeta;
    });
  }
  return newState;
}
