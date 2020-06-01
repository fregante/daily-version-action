module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const util = __webpack_require__(669);
const dailyVersion = __webpack_require__(816);
const execFile = util.promisify(__webpack_require__(129).execFile);

async function init() {
	// Use ENV if it's a `push.tag` event
	if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
		const pushedTag = process.env.GITHUB_REF.replace('refs/tags/', '');
		console.log('::set-output name=version::' + process.env.GITHUB_REF.replace('refs/tags/', ''));
		console.log('Run triggered by tag `' + pushedTag + '`. No new tags will be created by `daily-version-action`.');
		return;
	}

	// Look for tags on the current commit
	await execFile('git', ['fetch', '--depth=1', 'origin', 'refs/tags/*:refs/tags/*']);
	const {stdout: tagsOnHead} = await execFile('git', ['tag', '-l', '--points-at', 'HEAD']);
	if (tagsOnHead) {
		const [mostRecentTag] = tagsOnHead.split('\n'); // `stdout` may contain multiple tags
		console.log('::set-output name=version::' + mostRecentTag);
		console.log('No new commits since the last tag (' + mostRecentTag + '). No new tags will be created by `daily-version-action`.');
		return;
	}

	// A new tag must be created
	const version = dailyVersion();
	console.log('HEAD isn’t tagged. `daily-version-action` will create `' + version + '`');

	console.log('::set-output name=version::' + version);

	// Ensure that the git user is set
	try {
		await execFile('git', ['config', 'user.email']);
	} catch (_) {
		await execFile('git', ['config', 'user.email', 'actions@users.noreply.github.com']);
		await execFile('git', ['config', 'user.name', 'daily-version-action']);
	}

	// Create tag and push it
	await execFile('git', ['tag', version, '-m', version]);
	await execFile('git', ['push', 'origin', version]);
	console.log('::set-output name=created::yes');
}

init().catch(error => {
	console.error(error);
	process.exit(1);
});


/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 816:
/***/ (function(module, __unusedexports, __webpack_require__) {

const {execFileSync} = __webpack_require__(129);
const utcVersion = __webpack_require__(931);

module.exports = (prefix = '') => {
	const today = prefix + utcVersion({
		short: true
	});

	const tagExists = execFileSync('git', ['tag', '-l', today], {
		encoding: 'utf8'
	});

	if (!tagExists) {
		return today;
	}

	// Return non-short version
	return prefix + utcVersion();
};


/***/ }),

/***/ 931:
/***/ (function(module) {

module.exports = function utcVersion (date = new Date(), options = {}) {
  if (!(date instanceof Date)) {
    options = date
    date = new Date()
  }

  const {
    apple = false,
    short = false
  } = options

  const y = date.getUTCFullYear() - 2000
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()

  if (short) {
    return y + '.' + m + '.' + d
  }

  if (apple) {
    const divider = (86400 / 255)
    const seconds = (date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + date.getUTCSeconds()

    const i = 1 + Math.floor(seconds / divider)

    return y + '.' + m + '.' + d + 'i' + i
  }

  const t = (date.getUTCHours() * 100) + date.getUTCMinutes()

  return y + '.' + m + '.' + d + '.' + t
}


/***/ })

/******/ });