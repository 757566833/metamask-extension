import { cloneDeep, isPlainObject } from 'lodash';
import { TRANSACTION_TYPES } from '../../../shared/constants/transaction';

const version = 64;

const SENT_ETHER = 'sentEther'; // the legacy transaction type being replaced in this migration with TRANSACTION_TYPES.SIMPLE_SEND

/**
 * Removes metaMetricsSendCount from MetaMetrics controller
 */
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

  const transactions = state?.TransactionController?.transactions;
  if (isPlainObject(transactions)) {
    console.log(' ');

    for (const tx of Object.values(transactions)) {
      console.log(' ');

      if (tx.type === SENT_ETHER) {
        console.log(' ');

        tx.type = TRANSACTION_TYPES.SIMPLE_SEND;
      }
      if (tx.history) {
        console.log(' ');

        tx.history.map((txEvent) => {
          if (txEvent.type && txEvent.type === SENT_ETHER) {
            console.log(' ');

            txEvent.type = TRANSACTION_TYPES.SIMPLE_SEND;
          }
          return txEvent;
        });
      }
    }
  }
  return state;
}
