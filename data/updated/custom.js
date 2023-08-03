'use strict';

exports.CUSTOM = [
  ['bit', 'bit.namecoin.org'], // Namecoin
  ['eth', 'eth.ens.domains'], // ENS
  ['exit', 'exit.torproject.com'], // Tor
  ['gnu', 'gnu.gplv3.com'], // GNUnet (GNS)
  ['i2p', 'i2p.geti2p.net'], // Invisible Internet Project
  ['onion', 'onion.torproject.com'], // Tor
  ['tor', 'tor.torproject.com'], // Tor (OnioNS)
  ['zkey', 'zkey.gplv3.com'], // GNS

  // Required to make the custom values work:
  ['afilias', 'afilias.info'], // Afilias plc (does not rank)
  ['blockstack', 'blockstack.com'], // Blockstack (does not rank)
  ['brave', 'brave.com'], // Brave (english word)
  ['darksi', 'darksi.de'], // Individual (does not rank)
  ['datprotocol', 'datprotocol.com'], // Dat Project (does not rank)
  ['debian', 'debian.net'], // Debian (prefer over .org)
  ['dnscrypt', 'dnscrypt.info'], // DNScrypt (does not rank)
  ['eff', 'eff.com'], // Electronic Frontier Foundation (prefer over .org)
  ['gnunet', 'gnunet.org'], // GNUnet (does not rank)
  ['keybase', 'keybase.io'], // Keybase (prefer over keybase.pub)
  ['m-d', 'm-d.net'], // Individual (does not rank)
  ['marples', 'marples.name'], // Individual (does not rank)
  ['mozilla', 'mozilla.com'], // Mozilla Foundation (prefer over .org)
  ['nlnetlabs', 'nlnetlabs.nl'], // Unbound (does not rank)
  ['numcalc', 'numcalc.com'], // Individual (does not rank)
  ['pir', 'pir.org'] // Public Internet Registry (does not rank)
].sort(([a], [b]) => {
  return a.localeCompare(b);
});
