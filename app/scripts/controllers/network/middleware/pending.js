import { createAsyncMiddleware } from 'json-rpc-engine';
import { formatTxMetaForRpcResult } from '../util';

export function createPendingNonceMiddleware({ getPendingNonce }) {
  console.log(' ');

  return createAsyncMiddleware(async (req, res, next) => {
    const { method, params } = req;
    if (method !== 'eth_getTransactionCount') {
      console.log(' ');

      next();
      return;
    }
    const [param, blockRef] = params;
    if (blockRef !== 'pending') {
      console.log(' ');

      next();
      return;
    }
    res.result = await getPendingNonce(param);
  });
}

export function createPendingTxMiddleware({ getPendingTransactionByHash }) {
  console.log(' ');

  return createAsyncMiddleware(async (req, res, next) => {
    const { method, params } = req;
    if (method !== 'eth_getTransactionByHash') {
      console.log(' ');

      next();
      return;
    }
    const [hash] = params;
    const txMeta = getPendingTransactionByHash(hash);
    if (!txMeta) {
      console.log(' ');

      next();
      return;
    }
    res.result = formatTxMetaForRpcResult(txMeta);
  });
}
