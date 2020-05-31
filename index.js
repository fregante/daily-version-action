const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

async function init() {
	throw new Error('Testing an error');

	// Use ENV if it's a `push.tag` event
	if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
		const pushedTag = process.env.GITHUB_REF.replace('refs/tags/', '');
		console.log('::set-output name=version::' + process.env.GITHUB_REF.replace('refs/tags/', ''));
		console.log('Run triggered by tag `' + pushedTag + '`. No new tags will be created by `daily-version-action`.');
		return;
	}

	// Look for tags on the current commit
	await execFile('git', ['--depth=1', 'origin', 'refs/tags/*:refs/tags/*']);
	const {stdout: tagsOnHead} = await execFile('git', ['tag', '-l', '--points-at', 'HEAD']);
	if (tagsOnHead) {
		const [mostRecentTag] = tagsOnHead.split('/');
		console.log('::set-output name=version::' + mostRecentTag);
		console.log('No new commits since the last tag (' + mostRecentTag + '). No new tags will be created by `daily-version-action`.');
		return;
	}

	// A new tag must br created
	const {stdout} = await execFile('npx', ['daily-version']);
	const version = stdout.trim(); // `stdout` ends with \n
	console.log('::set-output name=version::' + version);
	console.log(JSON.stringify(version));
	await execFile('git', ['tag', version, '-m', version]);
	await execFile('git', ['push', 'origin', version]);
	console.log('::set-output name=created::yes');
}

init().catch(error => {
	console.error('why is this not being caught?');
	console.error(error);
	process.exit(1); // eslint-disable-line unicorn/no-process-exit
});
