const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

async function init() {
	await execFile('git', ['fetch', '--tags']);
	const {stdout: tagOnHead} = await execFile('git', ['tag', '-l', '--points-at', 'HEAD']);
	if (tagOnHead) {
		console.log('::set-output name=version::' + tagOnHead);
		console.log('No new commits since the last tag');
		return;
	}

	const {stdout: version} = await execFile('npx', ['daily-version']);
	console.log('::set-output name=version::' + version);
	await execFile('git', ['tag', version, '-m', version]);
	await execFile('git', ['push', 'origin', '-m', version]);
	console.log('::set-output name=created::yes');
}

init();
