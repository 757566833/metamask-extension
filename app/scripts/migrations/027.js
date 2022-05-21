// next version number
/*

normalizes txParams on unconfirmed txs

*/
import { cloneDeep } from 'lodash';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

const version = 27;

export default {
  version,

  async migrate(originalVersionedData) {
    console.log(' ');

    console.log('migrate');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    const state = versionedData.data;
    const newState = transformState(state);
    versionedData.data = newState;
    return versionedData;
  },
};

function transformState(state) {
  console.log(' ');

  const newState = state;

  if (newState.TransactionController) {
    console.log(' ');

    if (newState.TransactionController.transactions) {
      console.log(' ');

      const { transactions } = newState.TransactionController;
      newState.TransactionController.transactions = transactions.filter(
        (txMeta) => txMeta.status !== TRANSACTION_STATUSES.REJECTED,
      );
    }
  }

  return newState;
}
