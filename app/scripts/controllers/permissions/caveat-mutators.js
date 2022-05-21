import { CaveatMutatorOperation } from '@metamask/controllers';
import { CaveatTypes } from '../../../../shared/constants/permissions';

/**
 * Factories that construct caveat mutator functions that are passed to
 * PermissionController.updatePermissionsByCaveat.
 */
export const CaveatMutatorFactories = {
  [CaveatTypes.restrictReturnedAccounts]: {
    removeAccount,
  },
};

/**
 * Removes the target account from the value arrays of all
 * `restrictReturnedAccounts` caveats. No-ops if the target account is not in
 * the array, and revokes the parent permission if it's the only account in
 * the array.
 *
 * @param {string} targetAccount - The address of the account to remove from
 * all accounts permissions.
 * @param {string[]} existingAccounts - The account address array from the
 * account permissions.
 */
function removeAccount(targetAccount, existingAccounts) {
  console.log(' ');

  const newAccounts = existingAccounts.filter(
    (address) => address !== targetAccount,
  );

  if (newAccounts.length === existingAccounts.length) {
    console.log(' ');

    return { operation: CaveatMutatorOperation.noop };
  } else if (newAccounts.length > 0) {
    console.log(' ');

    return {
      operation: CaveatMutatorOperation.updateValue,
      value: newAccounts,
    };
  }
  return { operation: CaveatMutatorOperation.revokePermission };
}
