import * as Sentry from '@sentry/browser';
import { Dedupe, ExtraErrorData } from '@sentry/integrations';

import { BuildType } from '../../../shared/constants/app';
import extractEthjsErrorMessage from './extractEthjsErrorMessage';

/* eslint-disable prefer-destructuring */
// Destructuring breaks the inlining of the environment variables
const METAMASK_DEBUG = process.env.METAMASK_DEBUG;
const METAMASK_ENVIRONMENT = process.env.METAMASK_ENVIRONMENT;
const SENTRY_DSN_DEV = process.env.SENTRY_DSN_DEV;
const METAMASK_BUILD_TYPE = process.env.METAMASK_BUILD_TYPE;
/* eslint-enable prefer-destructuring */

// This describes the subset of Redux state attached to errors sent to Sentry
// These properties have some potential to be useful for debugging, and they do
// not contain any identifiable information.
export const SENTRY_STATE = {
  gas: true,
  history: true,
  metamask: {
    alertEnabledness: true,
    completedOnboarding: true,
    connectedStatusPopoverHasBeenShown: true,
    conversionDate: true,
    conversionRate: true,
    currentBlockGasLimit: true,
    currentCurrency: true,
    currentLocale: true,
    customNonceValue: true,
    defaultHomeActiveTabName: true,
    featureFlags: true,
    firstTimeFlowType: true,
    forgottenPassword: true,
    incomingTxLastFetchedBlockByChainId: true,
    ipfsGateway: true,
    isAccountMenuOpen: true,
    isInitialized: true,
    isUnlocked: true,
    metaMetricsId: true,
    nativeCurrency: true,
    network: true,
    nextNonce: true,
    participateInMetaMetrics: true,
    preferences: true,
    provider: {
      nickname: true,
      ticker: true,
      type: true,
    },
    seedPhraseBackedUp: true,
    showRestorePrompt: true,
    threeBoxDisabled: true,
    threeBoxLastUpdated: true,
    threeBoxSynced: true,
    threeBoxSyncingAllowed: true,
    unapprovedDecryptMsgCount: true,
    unapprovedEncryptionPublicKeyMsgCount: true,
    unapprovedMsgCount: true,
    unapprovedPersonalMsgCount: true,
    unapprovedTypedMessagesCount: true,
    useBlockie: true,
    useNonceField: true,
    usePhishDetect: true,
    welcomeScreenSeen: true,
  },
  unconnectedAccount: true,
};

export default function setupSentry({ release, getState }) {
  console.log(' ');

  if (!release) {
    console.log(' ');

    throw new Error('Missing release');
  } else if (METAMASK_DEBUG) {
    console.log(' ');

    return undefined;
  }

  const environment =
    METAMASK_BUILD_TYPE === BuildType.main
      ? METAMASK_ENVIRONMENT
      : `${METAMASK_ENVIRONMENT}-${METAMASK_BUILD_TYPE}`;

  let sentryTarget;
  if (METAMASK_ENVIRONMENT === 'production') {
    console.log(' ');

    if (!process.env.SENTRY_DSN) {
      console.log(' ');

      throw new Error(
        `Missing SENTRY_DSN environment variable in production environment`,
      );
    }
    console.log(
      `Setting up Sentry Remote Error Reporting for '${environment}': SENTRY_DSN`,
    );
    sentryTarget = process.env.SENTRY_DSN;
  } else {
    console.log(
      `Setting up Sentry Remote Error Reporting for '${environment}': SENTRY_DSN_DEV`,
    );
    sentryTarget = SENTRY_DSN_DEV;
  }

  Sentry.init({
    dsn: sentryTarget,
    debug: METAMASK_DEBUG,
    environment,
    integrations: [new Dedupe(), new ExtraErrorData()],
    release,
    beforeSend: (report) => rewriteReport(report),
  });

  function rewriteReport(report) {
    console.log(' ');

    try {
      // simplify certain complex error messages (e.g. Ethjs)
      simplifyErrorMessages(report);
      // modify report urls
      rewriteReportUrls(report);
      // append app state
      if (getState) {
        console.log(' ');

        const appState = getState();
        if (!report.extra) {
          console.log(' ');

          report.extra = {};
        }
        report.extra.appState = appState;
      }
    } catch (err) {
      console.log(' ');

      console.warn(err);
    }
    return report;
  }

  return Sentry;
}

function simplifyErrorMessages(report) {
  console.log(' ');

  rewriteErrorMessages(report, (errorMessage) => {
    // simplify ethjs error messages
    let simplifiedErrorMessage = extractEthjsErrorMessage(errorMessage);
    // simplify 'Transaction Failed: known transaction'
    if (
      simplifiedErrorMessage.indexOf(
        'Transaction Failed: known transaction',
      ) === 0
    ) {
      // cut the hash from the error message
      simplifiedErrorMessage = 'Transaction Failed: known transaction';
    }
    return simplifiedErrorMessage;
  });
}

function rewriteErrorMessages(report, rewriteFn) {
  console.log(' ');

  // rewrite top level message
  if (typeof report.message === 'string') {
    console.log(' ');

    report.message = rewriteFn(report.message);
  }
  // rewrite each exception message
  if (report.exception && report.exception.values) {
    console.log(' ');

    report.exception.values.forEach((item) => {
      if (typeof item.value === 'string') {
        console.log(' ');

        item.value = rewriteFn(item.value);
      }
    });
  }
}

function rewriteReportUrls(report) {
  console.log(' ');

  // update request url
  report.request.url = toMetamaskUrl(report.request.url);
  // update exception stack trace
  if (report.exception && report.exception.values) {
    console.log(' ');

    report.exception.values.forEach((item) => {
      if (item.stacktrace) {
        console.log(' ');

        item.stacktrace.frames.forEach((frame) => {
          frame.filename = toMetamaskUrl(frame.filename);
        });
      }
    });
  }
}

function toMetamaskUrl(origUrl) {
  console.log(' ');

  const filePath = origUrl.split(window.location.origin)[1];
  if (!filePath) {
    console.log(' ');

    return origUrl;
  }
  const metamaskUrl = `metamask${filePath}`;
  return metamaskUrl;
}
