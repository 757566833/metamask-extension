/*

This migration updates "transaction state history" to diffs style

*/

import { cloneDeep } from 'lodash';
import {
  snapshotFromTxMeta,
  migrateFromSnapshotsToDiffs,
} from '../controllers/transactions/lib/tx-state-history-helpers';

const version = 18;

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
      // no history: initialize
      if (!txMeta.history || txMeta.history.length === 0) {
        console.log(' ');

        const snapshot = snapshotFromTxMeta(txMeta);
        txMeta.history = [snapshot];
        return txMeta;
      }
      // has history: migrate
      const newHistory = migrateFromSnapshotsToDiffs(txMeta.history)
        // remove empty diffs
        .filter((entry) => {
          return !Array.isArray(entry) || entry.length > 0;
        });
      txMeta.history = newHistory;
      return txMeta;
    });
  }
  return newState;
}
