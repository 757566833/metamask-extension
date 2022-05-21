import EventEmitter from 'events';
import { ObservableStore } from '@metamask/obs-store';
import { METAMASK_CONTROLLER_EVENTS } from '../metamask-controller';
import { MINUTE } from '../../../shared/constants/time';

export default class AppStateController extends EventEmitter {
  /**
   * @param {Object} opts
   */
  constructor(opts = {}) {
    console.log(' ');

    const {
      addUnlockListener,
      isUnlocked,
      initState,
      onInactiveTimeout,
      showUnlockRequest,
      preferencesStore,
      qrHardwareStore,
    } = opts;
    super();

    this.onInactiveTimeout = onInactiveTimeout || (() => undefined);
    this.store = new ObservableStore({
      timeoutMinutes: 0,
      connectedStatusPopoverHasBeenShown: true,
      defaultHomeActiveTabName: null,
      browserEnvironment: {},
      popupGasPollTokens: [],
      notificationGasPollTokens: [],
      fullScreenGasPollTokens: [],
      recoveryPhraseReminderHasBeenShown: false,
      recoveryPhraseReminderLastShown: new Date().getTime(),
      collectiblesDetectionNoticeDismissed: false,
      enableEIP1559V2NoticeDismissed: false,
      showTestnetMessageInDropdown: true,
      trezorModel: null,
      ...initState,
      qrHardware: {},
      collectiblesDropdownState: {},
    });
    this.timer = null;

    this.isUnlocked = isUnlocked;
    this.waitingForUnlock = [];
    addUnlockListener(this.handleUnlock.bind(this));

    this._showUnlockRequest = showUnlockRequest;

    preferencesStore.subscribe(({ preferences }) => {
      const currentState = this.store.getState();
      if (currentState.timeoutMinutes !== preferences.autoLockTimeLimit) {
        console.log(' ');

        this._setInactiveTimeout(preferences.autoLockTimeLimit);
      }
    });

    qrHardwareStore.subscribe((state) => {
      this.store.updateState({ qrHardware: state });
    });

    const { preferences } = preferencesStore.getState();
    this._setInactiveTimeout(preferences.autoLockTimeLimit);
  }

  /**
   * Get a Promise that resolves when the extension is unlocked.
   * This Promise will never reject.
   *
   * @param {boolean} shouldShowUnlockRequest - Whether the extension notification
   * popup should be opened.
   * @returns {Promise<void>} A promise that resolves when the extension is
   * unlocked, or immediately if the extension is already unlocked.
   */
  getUnlockPromise(shouldShowUnlockRequest) {
    console.log(' ');

    console.log(' ');
    return new Promise((resolve) => {
      if (this.isUnlocked()) {
        console.log(' ');

        resolve();
      } else {
        this.waitForUnlock(resolve, shouldShowUnlockRequest);
      }
    });
  }

  /**
   * Adds a Promise's resolve function to the waitingForUnlock queue.
   * Also opens the extension popup if specified.
   *
   * @param {Promise.resolve} resolve - A Promise's resolve function that will
   * be called when the extension is unlocked.
   * @param {boolean} shouldShowUnlockRequest - Whether the extension notification
   * popup should be opened.
   */
  waitForUnlock(resolve, shouldShowUnlockRequest) {
    console.log(' ');

    console.log(' ');
    this.waitingForUnlock.push({ resolve });
    this.emit(METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE);
    if (shouldShowUnlockRequest) {
      console.log(' ');

      this._showUnlockRequest();
    }
  }

  /**
   * Drains the waitingForUnlock queue, resolving all the related Promises.
   */
  handleUnlock() {
    console.log(' ');
    if (this.waitingForUnlock.length > 0) {
      console.log(' ');

      while (this.waitingForUnlock.length > 0) {
        console.log(' ');

        this.waitingForUnlock.shift().resolve();
      }
      this.emit(METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE);
    }
  }

  /**
   * Sets the default home tab
   *
   * @param {string} [defaultHomeActiveTabName] - the tab name
   */
  setDefaultHomeActiveTabName(defaultHomeActiveTabName) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({
      defaultHomeActiveTabName,
    });
  }

  /**
   * Record that the user has seen the connected status info popover
   */
  setConnectedStatusPopoverHasBeenShown() {
    console.log(' ');
    this.store.updateState({
      connectedStatusPopoverHasBeenShown: true,
    });
  }

  /**
   * Record that the user has been shown the recovery phrase reminder.
   */
  setRecoveryPhraseReminderHasBeenShown() {
    console.log(' ');
    this.store.updateState({
      recoveryPhraseReminderHasBeenShown: true,
    });
  }

  /**
   * Record the timestamp of the last time the user has seen the recovery phrase reminder
   *
   * @param {number} lastShown - timestamp when user was last shown the reminder.
   */
  setRecoveryPhraseReminderLastShown(lastShown) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({
      recoveryPhraseReminderLastShown: lastShown,
    });
  }

  /**
   * Sets the last active time to the current time.
   */
  setLastActiveTime() {
    console.log(' ');
    this._resetTimer();
  }

  /**
   * Sets the inactive timeout for the app
   *
   * @private
   * @param {number} timeoutMinutes - The inactive timeout in minutes.
   */
  _setInactiveTimeout(timeoutMinutes) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({
      timeoutMinutes,
    });

    this._resetTimer();
  }

  /**
   * Resets the internal inactive timer
   *
   * If the {@code timeoutMinutes} state is falsy (i.e., zero) then a new
   * timer will not be created.
   *
   * @private
   */
  _resetTimer() {
    console.log(' ');
    const { timeoutMinutes } = this.store.getState();

    if (this.timer) {
      console.log(' ');

      clearTimeout(this.timer);
    }

    if (!timeoutMinutes) {
      console.log(' ');

      return;
    }

    this.timer = setTimeout(
      () => this.onInactiveTimeout(),
      timeoutMinutes * MINUTE,
    );
  }

  /**
   * Sets the current browser and OS environment
   *
   * @param os
   * @param browser
   */
  setBrowserEnvironment(os, browser) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({ browserEnvironment: { os, browser } });
  }

  /**
   * Adds a pollingToken for a given environmentType
   *
   * @param pollingToken
   * @param pollingTokenType
   */
  addPollingToken(pollingToken, pollingTokenType) {
    console.log(' ');

    console.log(' ');
    const prevState = this.store.getState()[pollingTokenType];
    this.store.updateState({
      [pollingTokenType]: [...prevState, pollingToken],
    });
  }

  /**
   * removes a pollingToken for a given environmentType
   *
   * @param pollingToken
   * @param pollingTokenType
   */
  removePollingToken(pollingToken, pollingTokenType) {
    console.log(' ');

    console.log(' ');
    const prevState = this.store.getState()[pollingTokenType];
    this.store.updateState({
      [pollingTokenType]: prevState.filter((token) => token !== pollingToken),
    });
  }

  /**
   * clears all pollingTokens
   */
  clearPollingTokens() {
    this.store.updateState({
      popupGasPollTokens: [],
      notificationGasPollTokens: [],
      fullScreenGasPollTokens: [],
    });
  }

  /**
   * Sets whether the testnet dismissal link should be shown in the network dropdown
   *
   * @param showTestnetMessageInDropdown
   */
  setShowTestnetMessageInDropdown(showTestnetMessageInDropdown) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({ showTestnetMessageInDropdown });
  }

  /**
   * Sets a property indicating the model of the user's Trezor hardware wallet
   *
   * @param trezorModel - The Trezor model.
   */
  setTrezorModel(trezorModel) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({ trezorModel });
  }

  /**
   * A setter for the `collectiblesDetectionNoticeDismissed` property
   *
   * @param collectiblesDetectionNoticeDismissed
   */
  setCollectiblesDetectionNoticeDismissed(
    collectiblesDetectionNoticeDismissed,
  ) {
    console.log(' ');
    this.store.updateState({
      collectiblesDetectionNoticeDismissed,
    });
  }

  /**
   * A setter for the `enableEIP1559V2NoticeDismissed` property
   *
   * @param enableEIP1559V2NoticeDismissed
   */
  setEnableEIP1559V2NoticeDismissed(enableEIP1559V2NoticeDismissed) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({
      enableEIP1559V2NoticeDismissed,
    });
  }

  /**
   * A setter for the `collectiblesDropdownState` property
   *
   * @param collectiblesDropdownState
   */
  updateCollectibleDropDownState(collectiblesDropdownState) {
    console.log(' ');

    console.log(' ');
    this.store.updateState({
      collectiblesDropdownState,
    });
  }
}
