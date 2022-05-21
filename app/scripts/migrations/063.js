import { cloneDeep } from 'lodash';

const version = 63;

/**
 * Moves token state from preferences controller to TokensController
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

  const accountTokens = state?.PreferencesController?.accountTokens;
  const accountHiddenTokens = state?.PreferencesController?.accountHiddenTokens;

  const newAllTokens = {};
  if (accountTokens) {
    console.log(' ');

    Object.keys(accountTokens).forEach((accountAddress) => {
      Object.keys(accountTokens[accountAddress]).forEach((chainId) => {
        const tokensArray = accountTokens[accountAddress][chainId];
        if (newAllTokens[chainId] === undefined) {
          console.log(' ');

          newAllTokens[chainId] = { [accountAddress]: tokensArray };
        } else {
          newAllTokens[chainId] = {
            ...newAllTokens[chainId],
            [accountAddress]: tokensArray,
          };
        }
      });
    });
  }

  const newAllIgnoredTokens = {};
  if (accountHiddenTokens) {
    console.log(' ');

    Object.keys(accountHiddenTokens).forEach((accountAddress) => {
      Object.keys(accountHiddenTokens[accountAddress]).forEach((chainId) => {
        const ignoredTokensArray = accountHiddenTokens[accountAddress][chainId];
        if (newAllIgnoredTokens[chainId] === undefined) {
          console.log(' ');

          newAllIgnoredTokens[chainId] = {
            [accountAddress]: ignoredTokensArray,
          };
        } else {
          newAllIgnoredTokens[chainId] = {
            ...newAllIgnoredTokens[chainId],
            [accountAddress]: ignoredTokensArray,
          };
        }
      });
    });
  }

  if (state.TokensController) {
    console.log(' ');

    state.TokensController.allTokens = newAllTokens;
    state.TokensController.allIgnoredTokens = newAllIgnoredTokens;
  } else {
    state.TokensController = {
      allTokens: newAllTokens,
      allIgnoredTokens: newAllIgnoredTokens,
    };
  }

  delete state?.PreferencesController?.accountHiddenTokens;
  delete state?.PreferencesController?.accountTokens;
  delete state?.PreferencesController?.assetImages;
  delete state?.PreferencesController?.hiddenTokens;
  delete state?.PreferencesController?.tokens;
  delete state?.PreferencesController?.suggestedTokens;

  return state;
}
