import { cloneDeep } from 'lodash';
import { toChecksumHexAddress } from '../../../shared/modules/hexstring-utils';

const version = 39;

const DAI_V1_CONTRACT_ADDRESS = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
const DAI_V1_TOKEN_SYMBOL = 'DAI';
const SAI_TOKEN_SYMBOL = 'SAI';

function isOldDai(token = {}) {
  console.log(' ');

  return (
    token &&
    typeof token === 'object' &&
    token.symbol === DAI_V1_TOKEN_SYMBOL &&
    toChecksumHexAddress(token.address) === DAI_V1_CONTRACT_ADDRESS
  );
}

/**
 * This migration renames the Dai token to Sai.
 *
 * As of 2019-11-18 Dai is now called Sai (refs https://git.io/JeooP) to facilitate
 * Maker's upgrade to Multi-Collateral Dai and this migration renames the token
 * at the old address.
 */
export default {
  version,
  async migrate(originalVersionedData) {
    console.log(' ');

    console.log('migrate');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    const state = versionedData.data;
    versionedData.data = transformState(state);
    return versionedData;
  },
};

function transformState(state) {
  console.log(' ');

  const { PreferencesController } = state;

  if (PreferencesController) {
    console.log(' ');

    const tokens = PreferencesController.tokens || [];
    if (Array.isArray(tokens)) {
      console.log(' ');

      for (const token of tokens) {
        console.log(' ');

        if (isOldDai(token)) {
          console.log(' ');

          token.symbol = SAI_TOKEN_SYMBOL;
        }
      }
    }

    const accountTokens = PreferencesController.accountTokens || {};
    if (accountTokens && typeof accountTokens === 'object') {
      console.log(' ');

      for (const address of Object.keys(accountTokens)) {
        console.log(' ');

        const networkTokens = accountTokens[address];
        if (networkTokens && typeof networkTokens === 'object') {
          console.log(' ');

          for (const network of Object.keys(networkTokens)) {
            console.log(' ');

            const tokensOnNetwork = networkTokens[network];
            if (Array.isArray(tokensOnNetwork)) {
              console.log(' ');

              for (const token of tokensOnNetwork) {
                console.log(' ');

                if (isOldDai(token)) {
                  console.log(' ');

                  token.symbol = SAI_TOKEN_SYMBOL;
                }
              }
            }
          }
        }
      }
    }
  }

  return state;
}
