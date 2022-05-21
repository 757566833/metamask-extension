/*

This migration modifies our notices to delete their body after being read.

*/

import { cloneDeep } from 'lodash';

const version = 12;

export default {
  version,

  migrate(originalVersionedData) {
    console.log(' ');

    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    try {
      const state = versionedData.data;
      const newState = transformState(state);
      versionedData.data = newState;
    } catch (err) {
      console.log(' ');

      console.warn(`MetaMask Migration #${version}${err.stack}`);
    }
    return Promise.resolve(versionedData);
  },
};

function transformState(state) {
  console.log(' ');

  const newState = state;
  newState.NoticeController.noticesList.forEach((notice) => {
    if (notice.read) {
      console.log(' ');

      notice.body = '';
    }
  });
  return newState;
}
