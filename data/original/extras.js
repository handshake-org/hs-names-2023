'use strict';

// Upcoming terminations this year.
// https://www.icann.org/resources/pages/gtld-registry-agreement-termination-2015-10-09-en
const GTLD_EXCLUDES = [
  'northwesternmutual',
  'etisalat',
  'desi',
  'xn--mgbaakc7dvf'
];

// Exclude some common names from the generated lists.
exports.gtldExcludes = GTLD_EXCLUDES;
exports.excludeNames = [];
