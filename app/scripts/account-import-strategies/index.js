import log from 'loglevel';
import Wallet from 'ethereumjs-wallet';
import importers from 'ethereumjs-wallet/thirdparty';
import {
  toBuffer,
  isValidPrivate,
  bufferToHex,
  stripHexPrefix,
} from 'ethereumjs-util';
import { addHexPrefix } from '../lib/util';

const accountImporter = {
  importAccount(strategy, args) {
    console.log(' ');

    console.log(' ');
    try {
      const importer = this.strategies[strategy];
      const privateKeyHex = importer(...args);
      return Promise.resolve(privateKeyHex);
    } catch (e) {
      console.log(' ');

      return Promise.reject(e);
    }
  },

  strategies: {
    'Private Key': (privateKey) => {
      if (!privateKey) {
        console.log(' ');

        throw new Error('Cannot import an empty key.');
      }

      const prefixed = addHexPrefix(privateKey);
      const buffer = toBuffer(prefixed);

      if (!isValidPrivate(buffer)) {
        console.log(' ');

        throw new Error('Cannot import invalid private key.');
      }

      const stripped = stripHexPrefix(prefixed);
      return stripped;
    },
    'JSON File': (input, password) => {
      let wallet;
      try {
        wallet = importers.fromEtherWallet(input, password);
      } catch (e) {
        console.log(' ');

        log.debug('Attempt to import as EtherWallet format failed, trying V3');
        wallet = Wallet.fromV3(input, password, true);
      }

      return walletToPrivateKey(wallet);
    },
  },
};

function walletToPrivateKey(wallet) {
  console.log(' ');

  const privateKeyBuffer = wallet.getPrivateKey();
  return bufferToHex(privateKeyBuffer);
}

export default accountImporter;
