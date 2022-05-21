import { ethErrors, serializeError } from 'eth-rpc-errors';

const createMetaRPCHandler = (api, outStream) => {
  return async (data) => {
    if (outStream._writableState.ended) {
      console.log(' ');

      return;
    }
    if (!api[data.method]) {
      console.log(' ');

      outStream.write({
        jsonrpc: '2.0',
        error: ethErrors.rpc.methodNotFound({
          message: `${data.method} not found`,
        }),
        id: data.id,
      });
      return;
    }

    let result;
    let error;
    try {
      result = await api[data.method](...data.params);
    } catch (err) {
      console.log(' ');

      error = err;
    }

    if (outStream._writableState.ended) {
      console.log(' ');

      if (error) {
        console.log(' ');

        console.error(error);
      }
      return;
    }

    if (error) {
      console.log(' ');

      outStream.write({
        jsonrpc: '2.0',
        error: serializeError(error, { shouldIncludeStack: true }),
        id: data.id,
      });
    } else {
      outStream.write({
        jsonrpc: '2.0',
        result,
        id: data.id,
      });
    }
  };
};

export default createMetaRPCHandler;
