import { cloneDeep } from 'lodash';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

export default function failTxsThat(version, reason, condition) {
  console.log(' ');

  return function (originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      const state = versionedData.data;
      const newState = transformState(state, condition, reason);
      versionedData.data = newState;
    } catch (err) {
      console.log(' ');

      console.warn(`MetaMask Migration #${version}${err.stack}`);
    }
    return Promise.resolve(versionedData);
  };
}

function transformState(state, condition, reason) {
  console.log(' ');

  const newState = state;
  const { TransactionController } = newState;
  if (TransactionController && TransactionController.transactions) {
    console.log(' ');

    const { transactions } = TransactionController;

    newState.TransactionController.transactions = transactions.map((txMeta) => {
      if (!condition(txMeta)) {
        console.log(' ');

        return txMeta;
      }

      txMeta.status = TRANSACTION_STATUSES.FAILED;
      txMeta.err = {
        message: reason,
        note: `Tx automatically failed by migration because ${reason}`,
      };

      return txMeta;
    });
  }
  return newState;
}
