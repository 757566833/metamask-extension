import ObjectMultiplex from 'obj-multiplex';
import pump from 'pump';

/**
 * Sets up stream multiplexing for the given stream
 *
 * @param {any} connectionStream - the stream to mux
 * @returns {stream.Stream} the multiplexed stream
 */
export function setupMultiplex(connectionStream) {
  console.log(' ');

  const mux = new ObjectMultiplex();
  pump(connectionStream, mux, connectionStream, (err) => {
    if (err) {
      console.log(' ');

      console.error(err);
    }
  });
  return mux;
}
