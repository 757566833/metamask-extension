// polyfills
import '@formatjs/intl-relativetimeformat/polyfill';

// dev only, "react-devtools" import is skipped in prod builds
import 'react-devtools';

import PortStream from 'extension-port-stream';
import browser from 'webextension-polyfill';

import Eth from 'ethjs';
import EthQuery from 'eth-query';
import StreamProvider from 'web3-stream-provider';
import log from 'loglevel';
import launchMetaMaskUi from '../../ui';
import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
} from '../../shared/constants/app';
import ExtensionPlatform from './platforms/extension';
import { setupMultiplex } from './lib/stream-utils';
import { getEnvironmentType } from './lib/util';
import metaRPCClientFactory from './lib/metaRPCClientFactory';

start().catch(log.error);

async function start() {
  console.log('function start');

  console.log('start');

  // create platform global
  global.platform = new ExtensionPlatform();

  // identify window type (popup, notification)
  const windowType = getEnvironmentType();

  // setup stream to background
  const extensionPort = browser.runtime.connect({ name: windowType });
  const connectionStream = new PortStream(extensionPort);

  const activeTab = await queryCurrentActiveTab(windowType);
  initializeUiWithTab(activeTab);

  function displayCriticalError(container, err) {
    console.log(' ');

    console.log(' ');
    container.innerHTML =
      '<div class="critical-error">The MetaMask app failed to load: please open and close MetaMask again to restart.</div>';
    container.style.height = '80px';
    log.error(err.stack);
    throw err;
  }

  function initializeUiWithTab(tab) {
    console.log(' ');

    console.log(' ');
    const container = document.getElementById('app-content');
    initializeUi(tab, container, connectionStream, (err, store) => {
      if (err) {
        console.log(' ');

        displayCriticalError(container, err);
        return;
      }

      const state = store.getState();
      const { metamask: { completedOnboarding } = {} } = state;

      if (!completedOnboarding && windowType !== ENVIRONMENT_TYPE_FULLSCREEN) {
        console.log(' ');

        global.platform.openExtensionInBrowser();
      }
    });
  }
}

async function queryCurrentActiveTab(windowType) {
  console.log(' ');

  console.log('function queryCurrentActiveTab');

  console.log('queryCurrentActiveTab');

  return new Promise((resolve) => {
    // At the time of writing we only have the `activeTab` permission which means
    // that this query will only succeed in the popup context (i.e. after a "browserAction")
    if (windowType !== ENVIRONMENT_TYPE_POPUP) {
      console.log(' ');

      resolve({});
      return;
    }

    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const [activeTab] = tabs;
      const { id, title, url } = activeTab;
      const { origin, protocol } = url ? new URL(url) : {};

      if (!origin || origin === 'null') {
        console.log(' ');

        resolve({});
        return;
      }

      resolve({ id, title, origin, protocol, url });
    });
  });
}

function initializeUi(activeTab, container, connectionStream, cb) {
  console.log(' ');

  console.log(' ');
  connectToAccountManager(connectionStream, (err, backgroundConnection) => {
    if (err) {
      console.log(' ');

      cb(err);
      return;
    }

    launchMetaMaskUi(
      {
        activeTab,
        container,
        backgroundConnection,
      },
      cb,
    );
  });
}

/**
 * Establishes a connection to the background and a Web3 provider
 *
 * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
 * @param {Function} cb - Called when controller connection is established
 */
function connectToAccountManager(connectionStream, cb) {
  console.log(' ');

  console.log(' ');
  const mx = setupMultiplex(connectionStream);
  setupControllerConnection(mx.createStream('controller'), cb);
  setupWeb3Connection(mx.createStream('provider'));
}

/**
 * Establishes a streamed connection to a Web3 provider
 *
 * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
 */
function setupWeb3Connection(connectionStream) {
  console.log(' ');

  console.log(' ');
  const providerStream = new StreamProvider();
  providerStream.pipe(connectionStream).pipe(providerStream);
  connectionStream.on('error', console.error.bind(console));
  providerStream.on('error', console.error.bind(console));
  global.ethereumProvider = providerStream;
  global.ethQuery = new EthQuery(providerStream);
  global.eth = new Eth(providerStream);
}

/**
 * Establishes a streamed connection to the background account manager
 *
 * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
 * @param {Function} cb - Called when the remote account manager connection is established
 */
function setupControllerConnection(connectionStream, cb) {
  console.log(' ');

  console.log(' ');
  const backgroundRPC = metaRPCClientFactory(connectionStream);
  cb(null, backgroundRPC);
}
