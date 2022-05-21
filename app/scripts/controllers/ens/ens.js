import EthJsEns from 'ethjs-ens';
import ensNetworkMap from 'ethereum-ens-network-map';

export default class Ens {
  static getNetworkEnsSupport(network) {
    console.log(' ');

    return Boolean(ensNetworkMap[network]);
  }

  constructor({ network, provider } = {}) {
    console.log(' ');

    this._ethJsEns = new EthJsEns({
      network,
      provider,
    });
  }

  lookup(ensName) {
    console.log(' ');

    return this._ethJsEns.lookup(ensName);
  }

  reverse(address) {
    console.log(' ');

    return this._ethJsEns.reverse(address);
  }
}
