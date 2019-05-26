/*
  This is a file of data and helper functions that we can expose and use in our templates
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = obj => JSON.stringify(obj, null, 2);

// inserting an SVG
exports.icon = name => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `Airtable Express`;

exports.menu = [
  { slug: '/', title: 'Home', icon: 'home' },
  { slug: '/add', title: 'Add', icon: 'add' },
  { slug: '/login', title: 'Sign In', icon: 'signin' },
  { slug: '/join', title: 'Sign Up', icon: 'signup' },
];

/*
 * Title Caps
 *
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */

exports.slugify = string =>
  string
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const small =
  '(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)';
const punct = '([!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)';

exports.lower = word => word.toLowerCase();

exports.upper = word => word.substr(0, 1).toUpperCase() + word.substr(1);

exports.titleCaps = function(title) {
  function upper(word) {
    return word.substr(0, 1).toUpperCase() + word.substr(1);
  }
  function lower(word) {
    return word.toLowerCase();
  }
  const parts = [];
  const split = /[:.;?!] |(?: |^)["Ò]/g;
  let index = 0;

  while (true) {
    const m = split.exec(title);

    parts.push(
      title
        .substring(index, m ? m.index : title.length)
        .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all) {
          return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
        })
        .replace(RegExp(`\\b${small}\\b`, 'ig'), lower)
        .replace(RegExp(`^${punct}${small}\\b`, 'ig'), function(
          all,
          punct,
          word
        ) {
          return punct + upper(word);
        })
        .replace(RegExp(`\\b${small}${punct}$`, 'ig'), upper)
    );

    index = split.lastIndex;

    if (m) parts.push(m[0]);
    else break;
  }

  return parts
    .join('')
    .replace(/ V(s?)\. /gi, ' v$1. ')
    .replace(/(['Õ])S\b/gi, '$1s')
    .replace(/\b(AT&T|Q&A)\b/gi, function(all) {
      return all.toUpperCase();
    });
};
