// Make all "object" and "function" own properties of globalThis
// non-configurable and non-writable, when possible.
// We call a property that is non-configurable and non-writable,
// "non-modifiable".
try {
  /**
   * `lockdown` only hardens the properties enumerated by the
   * universalPropertyNames constant specified in 'ses/src/whitelist'. This
   * function makes all function and object properties on the start compartment
   * global non-configurable and non-writable, unless they are already
   * non-configurable.
   *
   * It is critical that this function runs at the right time during
   * initialization, which should always be immediately after `lockdown` has been
   * called. At the time of writing, the modifications this function makes to the
   * runtime environment appear to be non-breaking, but that could change with
   * the addition of dependencies, or the order of our scripts in our HTML files.
   * Exercise caution.
   *
   * See inline comments for implementation details.
   *
   * We write this function in IIFE format to avoid polluting global scope.
   */
  (function protectIntrinsics() {
    console.log(' ');

    const namedIntrinsics = Reflect.ownKeys(new Compartment().globalThis);

    // These named intrinsics are not automatically hardened by `lockdown`
    const shouldHardenManually = new Set(['eval', 'Function']);

    const globalProperties = new Set([
      // universalPropertyNames is a constant added by lockdown to global scope
      // at the time of writing, it is initialized in 'ses/src/whitelist'.
      // These properties tend to be non-enumerable.
      ...namedIntrinsics,

      // TODO: Also include the named platform globals
      // This grabs every enumerable property on globalThis.
      // ...Object.keys(globalThis),
    ]);

    globalProperties.forEach((propertyName) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(
        globalThis,
        propertyName,
      );

      if (descriptor) {
        console.log(' ');

        if (descriptor.configurable) {
          console.log(' ');

          // If the property on globalThis is configurable, make it
          // non-configurable. If it has no accessor properties, also make it
          // non-writable.
          if (hasAccessor(descriptor)) {
            console.log(' ');

            Object.defineProperty(globalThis, propertyName, {
              configurable: false,
            });
          } else {
            Object.defineProperty(globalThis, propertyName, {
              configurable: false,
              writable: false,
            });
          }
        }

        if (shouldHardenManually.has(propertyName)) {
          console.log(' ');

          harden(globalThis[propertyName]);
        }
      }
    });

    /**
     * Checks whether the given propertyName descriptor has any accessors, i.e. the
     * properties `get` or `set`.
     *
     * We want to make globals non-writable, and we can't set the `writable`
     * property and accessor properties at the same time.
     *
     * @param {Object} descriptor - The propertyName descriptor to check.
     * @returns {boolean} Whether the propertyName descriptor has any accessors.
     */
    function hasAccessor(descriptor) {
      console.log(' ');

      return 'set' in descriptor || 'get' in descriptor;
    }
  })();
} catch (error) {
  console.log(' ');

  console.error('Protecting intrinsics failed:', error);
  if (globalThis.sentry && globalThis.sentry.captureException) {
    console.log(' ');

    globalThis.sentry.captureException(
      new Error(`Protecting intrinsics failed: ${error.message}`),
    );
  }
}
