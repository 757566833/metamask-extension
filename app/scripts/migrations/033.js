// next version number
/*

Cleans up notices and assocated notice controller code

*/

import { cloneDeep } from 'lodash';

const version = 33;

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

  const newState = state;
  // transform state here
  if (state.NoticeController) {
    console.log(' ');

    delete newState.NoticeController;
  }
  return newState;
}
