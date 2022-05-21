// Freezes all intrinsics
try {
  // eslint-disable-next-line no-undef,import/unambiguous
  lockdown({
    consoleTaming: 'unsafe',
    errorTaming: 'unsafe',
    mathTaming: 'unsafe',
    dateTaming: 'unsafe',
    overrideTaming: 'severe',
  });
} catch (error) {
  console.log(' ');

  // If the `lockdown` call throws an exception, it interferes with the
  // contentscript injection on some versions of Firefox. The error is
  // caught and logged here so that the contentscript still gets injected.
  // This affects Firefox v56 and Waterfox Classic.
  console.error('Lockdown failed:', error);
  if (globalThis.sentry && globalThis.sentry.captureException) {
    console.log(' ');

    globalThis.sentry.captureException(
      new Error(`Lockdown failed: ${error.message}`),
    );
  }
}
