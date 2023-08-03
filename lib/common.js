'use strict';

// These names are blacklisted entirely.
exports.BLACKLIST = [
  'example', // ICANN reserved
  'invalid', // ICANN reserved
  'local', // mDNS
  'localhost', // ICANN reserved
  'test' // ICANN reserved
];

exports.TLD = [
  'arpa',
  'com',
  'edu',
  'gov',
  'int',
  'mil',
  'net',
  'org'
];

// Trademarked TLDs (these are domains
// who submitted a trademark claim).
exports.TRADEMARKS = [
  ['a16z', 'a16z.com'],
  ['a16zcrypto', 'a16zcrypto.com'],
  ['agari', 'agari.com'],
  ['anchorage', 'anchorage.com'],
  ['angellikefire', 'angellikefire.com'],
  ['astralship', 'astralship.astraldynamics.co.uk'],
  ['barcraft', 'barcraft.com'],
  ['base58', 'base58.capital'],
  ['bermuda', 'bermuda.gov.bm'],
  ['binance', 'binance.com'],
  ['blender', 'blender.org'],
  ['blockfolio', 'blockfolio.com'],
  ['bubblestudent', 'bubblestudent.co.uk'],
  ['buddy', 'buddy.works'],
  ['cakephp', 'cakephp.org'],
  ['candybar', 'candybar.co'],
  ['codewars', 'codewars.com'],
  ['coindera', 'coindera.com'],
  ['coingecko', 'coingecko.com'],
  ['comunitaria', 'comunitaria.com'],
  ['contrib', 'contrib.com'],
  ['cryptopedia', 'cryptopedia.cryptionary.io'],
  ['decentral', 'decentral.ca'],
  ['district0x', 'district0x.io'],
  ['documize', 'documize.com'],
  ['ecorp', 'ecorp.com'],
  ['ejbca', 'ejbca.primekey.se'],
  ['fossa', 'fossa.io'],
  ['freenode', 'freenode.net'],
  ['gainesvillecoins', 'gainesvillecoins.com'],
  ['gnome', 'gnome.org'],
  ['grownome', 'grownome.com'],
  ['infura', 'infura.io'],
  ['iocom', 'iocom.com'],
  ['jaxx', 'jaxx.io'],
  ['knoxwallet', 'knoxwallet.tokensoft.io'],
  ['lbry', 'lbry.io'],
  ['longgame', 'longgame.co'],
  ['mackup', 'mackup.glop.org'],
  ['mattslater', 'mattslater.co'],
  ['maxsys', 'maxsys.ai'],
  ['me3d', 'me3d.com.au'],
  ['metamask', 'metamask.io'],
  ['mixbook', 'mixbook.com'],
  ['namecheap', 'namecheap.com'],
  ['nettalk', 'nettalk.com'],
  ['nextdoor', 'nextdoor.com'],
  ['nexves', 'nexves.com'],
  ['notationcapital', 'notationcapital.com'],
  ['num', 'num.uk'],
  ['nxlog', 'nxlog.org'],
  ['organism', 'organism.ai'],
  ['originprotocol', 'originprotocol.com'],
  ['paddle8', 'paddle8.com'],
  ['paloma', 'paloma.getpaloma.com'],
  ['pewresearch', 'pewresearch.org'],
  ['privateinternetaccess', 'privateinternetaccess.com'],
  ['showclix', 'showclix.com'],
  ['snapship', 'snapship.it'],
  ['socialchess', 'socialchess.carlson.net'],
  ['spontaneous', 'spontaneous.niftylettuce.com'],
  ['tech2mkt', 'tech2mkt.com'],
  ['tenonedesign', 'tenonedesign.com'],
  ['tierion', 'tierion.com'],
  ['tiki', 'tiki.org'],
  ['tikiwiki', 'tikiwiki.tiki.org'],
  ['tokensoft', 'tokensoft.io'],
  ['tripletiedout', 'tripletiedout.com'],
  ['unitychain', 'unitychain.net'],
  ['useexplore', 'useexplore.com'],
  ['userland', 'userland.londontrustmedia.com'],
  ['vaporware', 'vaporware.vaporwa.re'],
  ['wikihow', 'wikihow.com'],
  ['wolk', 'wolk.com']
];
