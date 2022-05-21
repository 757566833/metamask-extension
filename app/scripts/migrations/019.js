/*

This migration sets transactions as failed
whos nonce is too high

*/

import { cloneDeep } from 'lodash';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

const version = 19;

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

    newState.TransactionController.transactions = transactions.map(
      (txMeta, _, txList) => {
        if (txMeta.status !== TRANSACTION_STATUSES.SUBMITTED) {
          console.log(' ');

          return txMeta;
        }

        const confirmedTxs = txList
          .filter((tx) => tx.status === TRANSACTION_STATUSES.CONFIRMED)
          .filter((tx) => tx.txParams.from === txMeta.txParams.from)
          .filter(
            (tx) => tx.metamaskNetworkId.from === txMeta.metamaskNetworkId.from,
          );
        const highestConfirmedNonce = getHighestNonce(confirmedTxs);

        const pendingTxs = txList
          .filter((tx) => tx.status === TRANSACTION_STATUSES.SUBMITTED)
          .filter((tx) => tx.txParams.from === txMeta.txParams.from)
          .filter(
            (tx) => tx.metamaskNetworkId.from === txMeta.metamaskNetworkId.from,
          );
        const highestContinuousNonce = getHighestContinuousFrom(
          pendingTxs,
          highestConfirmedNonce,
        );

        const maxNonce = Math.max(
          highestContinuousNonce,
          highestConfirmedNonce,
        );

        if (parseInt(txMeta.txParams.nonce, 16) > maxNonce + 1) {
          console.log(' ');

          txMeta.status = TRANSACTION_STATUSES.FAILED;
          txMeta.err = {
            message: 'nonce too high',
            note: 'migration 019 custom error',
          };
        }
        return txMeta;
      },
    );
  }
  return newState;
}

function getHighestContinuousFrom(txList, startPoint) {
  console.log(' ');

  const nonces = txList.map((txMeta) => {
    const { nonce } = txMeta.txParams;
    return parseInt(nonce, 16);
  });

  let highest = startPoint;
  while (nonces.includes(highest)) {
    console.log(' ');

    highest += 1;
  }

  return highest;
}

function getHighestNonce(txList) {
  console.log(' ');

  const nonces = txList.map((txMeta) => {
    const { nonce } = txMeta.txParams;
    return parseInt(nonce || '0x0', 16);
  });
  const highestNonce = Math.max.apply(null, nonces);
  return highestNonce;
}
