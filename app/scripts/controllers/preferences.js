import { strict as assert } from 'assert';
import { ObservableStore } from '@metamask/obs-store';
import { normalize as normalizeAddress } from 'eth-sig-util';
import { ethers } from 'ethers';
import log from 'loglevel';
import {
  IPFS_DEFAULT_GATEWAY_URL,
  NETWORK_TYPE_TO_ID_MAP,
} from '../../../shared/constants/network';
import { isPrefixedFormattedHexString } from '../../../shared/modules/network.utils';
import { LEDGER_TRANSPORT_TYPES } from '../../../shared/constants/hardware-wallets';
import { NETWORK_EVENTS } from './network';

export default class PreferencesController {
  /**
   *
   * @typedef {Object} PreferencesController
   * @param {Object} opts - Overrides the defaults for the initial state of this.store
   * @property {Object} store The stored object containing a users preferences, stored in local storage
   * @property {Array} store.frequentRpcList A list of custom rpcs to provide the user
   * @property {boolean} store.useBlockie The users preference for blockie identicons within the UI
   * @property {boolean} store.useNonceField The users preference for nonce field within the UI
   * @property {Object} store.featureFlags A key-boolean map, where keys refer to features and booleans to whether the
   * user wishes to see that feature.
   *
   * Feature flags can be set by the global function `setPreference(feature, enabled)`, and so should not expose any sensitive behavior.
   * @property {Object} store.knownMethodData Contains all data methods known by the user
   * @property {string} store.currentLocale The preferred language locale key
   * @property {string} store.selectedAddress A hex string that matches the currently selected address in the app
   */
  constructor(opts = {}) {
    console.log(' ');

    const initState = {
      frequentRpcListDetail: [],
      useBlockie: false,
      useNonceField: false,
      usePhishDetect: true,
      dismissSeedBackUpReminder: false,

      // set to true means the dynamic list from the API is being used
      // set to false will be using the static list from contract-metadata
      useTokenDetection: Boolean(process.env.TOKEN_DETECTION_V2),
      useCollectibleDetection: false,
      openSeaEnabled: false,
      advancedGasFee: null,

      // WARNING: Do not use feature flags for security-sensitive things.
      // Feature flag toggling is available in the global namespace
      // for convenient testing of pre-release features, and should never
      // perform sensitive operations.
      featureFlags: {
        showIncomingTransactions: true,
      },
      knownMethodData: {},
      currentLocale: opts.initLangCode,
      identities: {},
      lostIdentities: {},
      forgottenPassword: false,
      preferences: {
        autoLockTimeLimit: undefined,
        showFiatInTestnets: false,
        showTestNetworks: false,
        useNativeCurrencyAsPrimaryCurrency: true,
        hideZeroBalanceTokens: false,
      },
      // ENS decentralized website resolution
      ipfsGateway: IPFS_DEFAULT_GATEWAY_URL,
      infuraBlocked: null,
      ledgerTransportType: window.navigator.hid
        ? LEDGER_TRANSPORT_TYPES.WEBHID
        : LEDGER_TRANSPORT_TYPES.U2F,
      theme: 'default',
      ...opts.initState,
    };

    this.network = opts.network;
    this.ethersProvider = new ethers.providers.Web3Provider(opts.provider);
    this.store = new ObservableStore(initState);
    this.store.setMaxListeners(12);
    this.openPopup = opts.openPopup;
    this.migrateAddressBookState = opts.migrateAddressBookState;

    this._subscribeToInfuraAvailability();

    global.setPreference = (key, value) => {
      return this.setFeatureFlag(key, value);
    };
  }
  // PUBLIC METHODS

  /**
   * Sets the {@code forgottenPassword} state property
   *
   * @param {boolean} forgottenPassword - whether or not the user has forgotten their password
   */
  setPasswordForgotten(forgottenPassword) {
    console.log(' ');

    this.store.updateState({ forgottenPassword });
  }

  /**
   * Setter for the `useBlockie` property
   *
   * @param {boolean} val - Whether or not the user prefers blockie indicators
   */
  setUseBlockie(val) {
    console.log(' ');

    this.store.updateState({ useBlockie: val });
  }

  /**
   * Setter for the `useNonceField` property
   *
   * @param {boolean} val - Whether or not the user prefers to set nonce
   */
  setUseNonceField(val) {
    console.log(' ');

    this.store.updateState({ useNonceField: val });
  }

  /**
   * Setter for the `usePhishDetect` property
   *
   * @param {boolean} val - Whether or not the user prefers phishing domain protection
   */
  setUsePhishDetect(val) {
    console.log(' ');

    this.store.updateState({ usePhishDetect: val });
  }

  /**
   * Setter for the `useTokenDetection` property
   *
   * @param {boolean} val - Whether or not the user prefers to use the static token list or dynamic token list from the API
   */
  setUseTokenDetection(val) {
    console.log(' ');

    this.store.updateState({ useTokenDetection: val });
  }

  /**
   * Setter for the `useCollectibleDetection` property
   *
   * @param {boolean} useCollectibleDetection - Whether or not the user prefers to autodetect collectibles.
   */
  setUseCollectibleDetection(useCollectibleDetection) {
    console.log(' ');

    this.store.updateState({ useCollectibleDetection });
  }

  /**
   * Setter for the `openSeaEnabled` property
   *
   * @param {boolean} openSeaEnabled - Whether or not the user prefers to use the OpenSea API for collectibles data.
   */
  setOpenSeaEnabled(openSeaEnabled) {
    console.log(' ');

    this.store.updateState({
      openSeaEnabled,
    });
  }

  /**
   * Setter for the `advancedGasFee` property
   *
   * @param {object} val - holds the maxBaseFee and PriorityFee that the user set as default advanced settings.
   */
  setAdvancedGasFee(val) {
    console.log(' ');

    this.store.updateState({ advancedGasFee: val });
  }

  /**
   * Setter for the `eip1559V2Enabled` property
   *
   * @param {object} val - holds the eip1559V2Enabled that the user set as experimental settings.
   */
  setEIP1559V2Enabled(val) {
    console.log(' ');

    this.store.updateState({ eip1559V2Enabled: val });
  }

  /**
   * Setter for the `theme` property
   *
   * @param {string} val - 'default' or 'dark' value based on the mode selected by user.
   */
  setTheme(val) {
    console.log(' ');

    this.store.updateState({ theme: val });
  }

  /**
   * Add new methodData to state, to avoid requesting this information again through Infura
   *
   * @param {string} fourBytePrefix - Four-byte method signature
   * @param {string} methodData - Corresponding data method
   */
  addKnownMethodData(fourBytePrefix, methodData) {
    console.log(' ');

    const { knownMethodData } = this.store.getState();
    knownMethodData[fourBytePrefix] = methodData;
    this.store.updateState({ knownMethodData });
  }

  /**
   * Setter for the `currentLocale` property
   *
   * @param {string} key - he preferred language locale key
   */
  setCurrentLocale(key) {
    console.log(' ');

    const textDirection = ['ar', 'dv', 'fa', 'he', 'ku'].includes(key)
      ? 'rtl'
      : 'auto';
    this.store.updateState({
      currentLocale: key,
      textDirection,
    });
    return textDirection;
  }

  /**
   * Updates identities to only include specified addresses. Removes identities
   * not included in addresses array
   *
   * @param {string[]} addresses - An array of hex addresses
   */
  setAddresses(addresses) {
    console.log(' ');

    const oldIdentities = this.store.getState().identities;

    const identities = addresses.reduce((ids, address, index) => {
      const oldId = oldIdentities[address] || {};
      ids[address] = { name: `Account ${index + 1}`, address, ...oldId };
      return ids;
    }, {});

    this.store.updateState({ identities });
  }

  /**
   * Removes an address from state
   *
   * @param {string} address - A hex address
   * @returns {string} the address that was removed
   */
  removeAddress(address) {
    console.log(' ');

    const { identities } = this.store.getState();

    if (!identities[address]) {
      console.log(' ');

      throw new Error(`${address} can't be deleted cause it was not found`);
    }
    delete identities[address];
    this.store.updateState({ identities });

    // If the selected account is no longer valid,
    // select an arbitrary other account:
    if (address === this.getSelectedAddress()) {
      console.log(' ');

      const selected = Object.keys(identities)[0];
      this.setSelectedAddress(selected);
    }
    return address;
  }

  /**
   * Adds addresses to the identities object without removing identities
   *
   * @param {string[]} addresses - An array of hex addresses
   */
  addAddresses(addresses) {
    console.log(' ');

    const { identities } = this.store.getState();
    addresses.forEach((address) => {
      // skip if already exists
      if (identities[address]) {
        console.log(' ');

        return;
      }
      // add missing identity
      const identityCount = Object.keys(identities).length;

      identities[address] = { name: `Account ${identityCount + 1}`, address };
    });
    this.store.updateState({ identities });
  }

  /**
   * Synchronizes identity entries with known accounts.
   * Removes any unknown identities, and returns the resulting selected address.
   *
   * @param {Array<string>} addresses - known to the vault.
   * @returns {Promise<string>} selectedAddress the selected address.
   */
  syncAddresses(addresses) {
    console.log(' ');

    if (!Array.isArray(addresses) || addresses.length === 0) {
      console.log(' ');

      throw new Error('Expected non-empty array of addresses. Error #11201');
    }

    const { identities, lostIdentities } = this.store.getState();

    const newlyLost = {};
    Object.keys(identities).forEach((identity) => {
      if (!addresses.includes(identity)) {
        console.log(' ');

        newlyLost[identity] = identities[identity];
        delete identities[identity];
      }
    });

    // Identities are no longer present.
    if (Object.keys(newlyLost).length > 0) {
      console.log(' ');

      // store lost accounts
      Object.keys(newlyLost).forEach((key) => {
        lostIdentities[key] = newlyLost[key];
      });
    }

    this.store.updateState({ identities, lostIdentities });
    this.addAddresses(addresses);

    // If the selected account is no longer valid,
    // select an arbitrary other account:
    let selected = this.getSelectedAddress();
    if (!addresses.includes(selected)) {
      console.log(' ');

      selected = addresses[0];
      this.setSelectedAddress(selected);
    }

    return selected;
  }

  /**
   * Setter for the `selectedAddress` property
   *
   * @param {string} _address - A new hex address for an account
   */
  setSelectedAddress(_address) {
    console.log(' ');

    const address = normalizeAddress(_address);

    const { identities } = this.store.getState();
    const selectedIdentity = identities[address];
    if (!selectedIdentity) {
      console.log(' ');

      throw new Error(`Identity for '${address} not found`);
    }

    selectedIdentity.lastSelected = Date.now();
    this.store.updateState({ identities, selectedAddress: address });
  }

  /**
   * Getter for the `selectedAddress` property
   *
   * @returns {string} The hex address for the currently selected account
   */
  getSelectedAddress() {
    return this.store.getState().selectedAddress;
  }

  /**
   * Sets a custom label for an account
   *
   * @param {string} account - the account to set a label for
   * @param {string} label - the custom label for the account
   * @returns {Promise<string>}
   */
  setAccountLabel(account, label) {
    console.log(' ');

    if (!account) {
      console.log(' ');

      throw new Error(
        `setAccountLabel requires a valid address, got ${String(account)}`,
      );
    }
    const address = normalizeAddress(account);
    const { identities } = this.store.getState();
    identities[address] = identities[address] || {};
    identities[address].name = label;
    this.store.updateState({ identities });
    return Promise.resolve(label);
  }

  /**
   * updates custom RPC details
   *
   * @param {Object} newRpcDetails - Options bag.
   * @param {string} newRpcDetails.rpcUrl - The RPC url to add to frequentRpcList.
   * @param {string} newRpcDetails.chainId - The chainId of the selected network.
   * @param {string} [newRpcDetails.ticker] - Optional ticker symbol of the selected network.
   * @param {string} [newRpcDetails.nickname] - Optional nickname of the selected network.
   * @param {Object} [newRpcDetails.rpcPrefs] - Optional RPC preferences, such as the block explorer URL
   */
  async updateRpc(newRpcDetails) {
    console.log(' ');

    console.log('updateRpc');

    const rpcList = this.getFrequentRpcListDetail();
    const index = rpcList.findIndex((element) => {
      return element.rpcUrl === newRpcDetails.rpcUrl;
    });
    if (index > -1) {
      console.log(' ');

      const rpcDetail = rpcList[index];
      const updatedRpc = { ...rpcDetail, ...newRpcDetails };
      if (rpcDetail.chainId !== updatedRpc.chainId) {
        console.log(' ');

        // When the chainId is changed, associated address book entries should
        // also be migrated. The address book entries are keyed by the `network` state,
        // which for custom networks is the chainId with a fallback to the networkId
        // if the chainId is not set.

        let addressBookKey = rpcDetail.chainId;
        if (!addressBookKey) {
          console.log(' ');

          // We need to find the networkId to determine what these addresses were keyed by
          try {
            addressBookKey = await this.ethersProvider.send('net_version');
            assert(typeof addressBookKey === 'string');
          } catch (error) {
            console.log(' ');

            log.debug(error);
            log.warn(
              `Failed to get networkId from ${rpcDetail.rpcUrl}; skipping address book migration`,
            );
          }
        }

        // There is an edge case where two separate RPC endpoints are keyed by the same
        // value. In this case, the contact book entries are duplicated so that they remain
        // on both networks, since we don't know which network each contact is intended for.

        let duplicate = false;
        const builtInProviderNetworkIds = Object.values(
          NETWORK_TYPE_TO_ID_MAP,
        ).map((ids) => ids.networkId);
        const otherRpcEntries = rpcList.filter(
          (entry) => entry.rpcUrl !== newRpcDetails.rpcUrl,
        );
        if (
          builtInProviderNetworkIds.includes(addressBookKey) ||
          otherRpcEntries.some((entry) => entry.chainId === addressBookKey)
        ) {
          duplicate = true;
        }

        this.migrateAddressBookState(
          addressBookKey,
          updatedRpc.chainId,
          duplicate,
        );
      }
      rpcList[index] = updatedRpc;
      this.store.updateState({ frequentRpcListDetail: rpcList });
    } else {
      const {
        rpcUrl,
        chainId,
        ticker,
        nickname,
        rpcPrefs = {},
      } = newRpcDetails;
      this.addToFrequentRpcList(rpcUrl, chainId, ticker, nickname, rpcPrefs);
    }
  }

  /**
   * Adds custom RPC url to state.
   *
   * @param {string} rpcUrl - The RPC url to add to frequentRpcList.
   * @param {string} chainId - The chainId of the selected network.
   * @param {string} [ticker] - Ticker symbol of the selected network.
   * @param {string} [nickname] - Nickname of the selected network.
   * @param {Object} [rpcPrefs] - Optional RPC preferences, such as the block explorer URL
   */
  addToFrequentRpcList(
    rpcUrl,
    chainId,
    ticker = 'ETH',
    nickname = '',
    rpcPrefs = {},
  ) {
    const rpcList = this.getFrequentRpcListDetail();

    const index = rpcList.findIndex((element) => {
      return element.rpcUrl === rpcUrl;
    });
    if (index !== -1) {
      console.log(' ');

      rpcList.splice(index, 1);
    }

    if (!isPrefixedFormattedHexString(chainId)) {
      console.log(' ');

      throw new Error(`Invalid chainId: "${chainId}"`);
    }

    rpcList.push({ rpcUrl, chainId, ticker, nickname, rpcPrefs });
    this.store.updateState({ frequentRpcListDetail: rpcList });
  }

  /**
   * Removes custom RPC url from state.
   *
   * @param {string} url - The RPC url to remove from frequentRpcList.
   * @returns {Promise<Array>} Promise resolving to updated frequentRpcList.
   */
  removeFromFrequentRpcList(url) {
    console.log(' ');

    const rpcList = this.getFrequentRpcListDetail();
    const index = rpcList.findIndex((element) => {
      return element.rpcUrl === url;
    });
    if (index !== -1) {
      console.log(' ');

      rpcList.splice(index, 1);
    }
    this.store.updateState({ frequentRpcListDetail: rpcList });
    return Promise.resolve(rpcList);
  }

  /**
   * Getter for the `frequentRpcListDetail` property.
   *
   * @returns {Array<Array>} An array of rpc urls.
   */
  getFrequentRpcListDetail() {
    return this.store.getState().frequentRpcListDetail;
  }

  /**
   * Updates the `featureFlags` property, which is an object. One property within that object will be set to a boolean.
   *
   * @param {string} feature - A key that corresponds to a UI feature.
   * @param {boolean} activated - Indicates whether or not the UI feature should be displayed
   * @returns {Promise<object>} Promises a new object; the updated featureFlags object.
   */
  setFeatureFlag(feature, activated) {
    console.log(' ');

    const currentFeatureFlags = this.store.getState().featureFlags;
    const updatedFeatureFlags = {
      ...currentFeatureFlags,
      [feature]: activated,
    };

    this.store.updateState({ featureFlags: updatedFeatureFlags });

    return Promise.resolve(updatedFeatureFlags);
  }

  /**
   * Updates the `preferences` property, which is an object. These are user-controlled features
   * found in the settings page.
   *
   * @param {string} preference - The preference to enable or disable.
   * @param {boolean} value - Indicates whether or not the preference should be enabled or disabled.
   * @returns {Promise<object>} Promises a new object; the updated preferences object.
   */
  setPreference(preference, value) {
    console.log(' ');

    const currentPreferences = this.getPreferences();
    const updatedPreferences = {
      ...currentPreferences,
      [preference]: value,
    };

    this.store.updateState({ preferences: updatedPreferences });
    return Promise.resolve(updatedPreferences);
  }

  /**
   * A getter for the `preferences` property
   *
   * @returns {Object} A key-boolean map of user-selected preferences.
   */
  getPreferences() {
    return this.store.getState().preferences;
  }

  /**
   * A getter for the `ipfsGateway` property
   *
   * @returns {string} The current IPFS gateway domain
   */
  getIpfsGateway() {
    return this.store.getState().ipfsGateway;
  }

  /**
   * A setter for the `ipfsGateway` property
   *
   * @param {string} domain - The new IPFS gateway domain
   * @returns {Promise<string>} A promise of the update IPFS gateway domain
   */
  setIpfsGateway(domain) {
    console.log(' ');

    this.store.updateState({ ipfsGateway: domain });
    return Promise.resolve(domain);
  }

  /**
   * A setter for the `ledgerTransportType` property.
   *
   * @param {string} ledgerTransportType - Either 'ledgerLive', 'webhid' or 'u2f'
   * @returns {string} The transport type that was set.
   */
  setLedgerTransportPreference(ledgerTransportType) {
    console.log(' ');

    this.store.updateState({ ledgerTransportType });
    return ledgerTransportType;
  }

  /**
   * A getter for the `ledgerTransportType` property.
   *
   * @returns {string} The current preferred Ledger transport type.
   */
  getLedgerTransportPreference() {
    return this.store.getState().ledgerTransportType;
  }

  /**
   * A setter for the user preference to dismiss the seed phrase backup reminder
   *
   * @param {bool} dismissSeedBackUpReminder - User preference for dismissing the back up reminder.
   */
  async setDismissSeedBackUpReminder(dismissSeedBackUpReminder) {
    console.log(' ');

    console.log('setDismissSeedBackUpReminder');

    await this.store.updateState({
      dismissSeedBackUpReminder,
    });
  }

  //
  // PRIVATE METHODS
  //

  _subscribeToInfuraAvailability() {
    this.network.on(NETWORK_EVENTS.INFURA_IS_BLOCKED, () => {
      this._setInfuraBlocked(true);
    });
    this.network.on(NETWORK_EVENTS.INFURA_IS_UNBLOCKED, () => {
      this._setInfuraBlocked(false);
    });
  }

  /**
   *
   * A setter for the `infuraBlocked` property
   *
   * @param {boolean} isBlocked - Bool indicating whether Infura is blocked
   */
  _setInfuraBlocked(isBlocked) {
    console.log(' ');

    const { infuraBlocked } = this.store.getState();

    if (infuraBlocked === isBlocked) {
      console.log(' ');

      return;
    }

    this.store.updateState({ infuraBlocked: isBlocked });
  }
}
