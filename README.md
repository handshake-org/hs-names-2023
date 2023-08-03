# hs-lockup-names

Handshake reserved names. See [handshake-org/hs-names](https://github.com/handshake-org/hs-names) for more info.


## Structure

The 3 directories `data`, `names`, `build` have sub-dirs based on the data source name (see Configuration below). Currently, 2 sources exist:
- `original` is the data used pre-softfork
- `updated` is the proposed

### Directories

- `data`/\*/ - data source to build segregated files in `names`
  - _Some of these sources can be fetched/updated with the `./download` script_
  - `words.json` - standard dictionary word list
  - `top-1m.csv` - dump of Alexa ranking list
  - `root.zone` - dumped from ICANN, whole root in zone format
  - `tlds-alpha-by-domain.txt` - dumped from IANA, currently delegated TLDs
  - `icctlds.js` - manually dumped from ICANN, IDN ccTLDs
  - `extras.js` - manually curated list of names to exclude from reservation
  - `custom.js` - manually curated list of other naming systems and forced name-domain mapping

- `names`/\*/ - see `update.js`
  - `alexa.json` - from Alexa csv
  - `cctld.json` - from IANA, all 2-char or idn-ccTLD
  - `gtld.json` - from IANA, all non-oldTLD and non-ccTLD
  - `rtld.json` - from ICANN Root zone
  - `blacklist.json` - hardcoded list, blacklist like test/infra TLDs
  - `tld.json` - hardcoded list, the original TLDs
  - `trademarks.json` - hardcoded list, list of submitted tm claims
  - `custom.json` - from custom.js, custom tld-domain mapping
  - `words.json` - from words.js, dictionary words

- `build`/\*/ - final built files to be used by everything
  - `valid-N.json` - reserved names when considering top N Alexa names
  - `invalid-N.json` - names that did not make it into the reserved list with reason
  - `lockup.json` - final database (with flags) in json format
  - `lockup.db` - final database (with flags) in binary db format
  - `lockup-compact.db` - final database (with flags) in binary db format - but stripped down to just namehash and flags
  - `unreserved.json` - names that will no longer be reserved
  - `unreserved-root.json` - names that were reserved as ICANN TLDs that will no longer be reserved

- `alexa` - copy of alexa top 1M domains, extracted into `updated` (TODO: remove this file/dir?)

### Scripts

- `download`
  - refreshes data sources from IANA, ICANN in `data/`

- `update.js`
  - reads data from `data/`
  - creates/updates JSON files in `names/`

- `generate.js`
  - reads data from `names/` (and some from data)
  - generates final outputs into `build/`

- `unreserved.js`
  - reads existing hsd reserved list and compares with built `lockup.db`
  - generates `unreserved.json` and `unreserved-root.json` in `build/`

## Configuration

Scripts accept config options as arguments and environment variables. Use as `--name <value>` arg or `HNS_NAME=<value>` env.

| name        | default   | description                                                      |
| ----------- | --------- | ---------------------------------------------------------------- |
| data-source | 'updated' | the data source name inside `data`, `names`, `build` directories       |
| top         | 10000     | number of top Alexa names to consider                            |


## Algorithm

Read `generate.js`, it has comments.
