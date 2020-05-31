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
		const [mostRecentTag] = tagsOnHead.split('/');
		console.log('::set-output name=version::' + mostRecentTag);
		console.log('No new commits since the last tag (' + mostRecentTag + '). No new tags will be created by `daily-version-action`.');
		return;
	}

	// A new tag must be created
	const {stdout} = await execFile('npx', ['daily-version']);
	const version = stdout.trim(); // `stdout` ends with \n
	console.log('HEAD isn’t tagged. `daily-version-action` will create `' + version + '`');

	console.log('::set-output name=version::' + version);

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

/***/ })

/******/ });