const util = require('util');
const dailyVersion = require('daily-version');
const execFile = util.promisify(require('child_process').execFile);

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
	const {stdout: email} = await execFile('git', ['config', 'user.email']);
	if (!email) {
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
