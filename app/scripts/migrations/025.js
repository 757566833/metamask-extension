// next version number
/*

normalizes txParams on unconfirmed txs

*/
import { cloneDeep } from 'lodash';
import { addHexPrefix } from '../lib/util';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';

const version = 25;

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
      newState.TransactionController.transactions = transactions.map(
        (txMeta) => {
          if (txMeta.status !== TRANSACTION_STATUSES.UNAPPROVED) {
            console.log(' ');

            return txMeta;
          }
          txMeta.txParams = normalizeTxParams(txMeta.txParams);
          return txMeta;
        },
      );
    }
  }

  return newState;
}

function normalizeTxParams(txParams) {
  console.log(' ');

  // functions that handle normalizing of that key in txParams
  const whiteList = {
    from: (from) => addHexPrefix(from).toLowerCase(),
    to: () => addHexPrefix(txParams.to).toLowerCase(),
    nonce: (nonce) => addHexPrefix(nonce),
    value: (value) => addHexPrefix(value),
    data: (data) => addHexPrefix(data),
    gas: (gas) => addHexPrefix(gas),
    gasPrice: (gasPrice) => addHexPrefix(gasPrice),
  };

  // apply only keys in the whiteList
  const normalizedTxParams = {};
  Object.keys(whiteList).forEach((key) => {
    if (txParams[key]) {
      console.log(' ');

      normalizedTxParams[key] = whiteList[key](txParams[key]);
    }
  });

  return normalizedTxParams;
}
