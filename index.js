const core = require('@actions/core');
const util = require('util');
const dailyVersion = require('daily-version');
const execFile = util.promisify(require('child_process').execFile);

async function init() {
	// Use ENV if it's a `push.tag` event
	if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
		const pushedTag = process.env.GITHUB_REF.replace('refs/tags/', '');
		core.setOutput('version', process.env.GITHUB_REF.replace('refs/tags/', ''));
		core.info('Run triggered by tag `' + pushedTag + '`. No new tags will be created by `daily-version-action`.');
		return;
	}

	// Look for tags on the current commit
	await execFile('git', ['fetch', '--depth=1', 'origin', 'refs/tags/*:refs/tags/*']);
	const {stdout: tagsOnHead} = await execFile('git', ['tag', '-l', '--points-at', 'HEAD']);
	if (tagsOnHead) {
		const [mostRecentTag] = tagsOnHead.split('\n'); // `stdout` may contain multiple tags
		core.setOutput('version', mostRecentTag);
		core.info('No new commits since the last tag (' + mostRecentTag + '). No new tags will be created by `daily-version-action`.');
		return;
	}

	// A new tag must be created
	const version = dailyVersion(core.getInput('prefix'));
	core.info('HEAD isn’t tagged. `daily-version-action` will create `' + version + '`');

	core.setOutput('version', version);

	// Ensure that the git user is set
	const hasEmail = await execFile('git', ['config', 'user.email']).catch(_ => false);
	if (!hasEmail) {
		await execFile('git', ['config', 'user.email', 'actions@users.noreply.github.com']);
		await execFile('git', ['config', 'user.name', 'daily-version-action']);
	}

	// Create tag and push it
	await execFile('git', ['tag', version, '-m', version]);
	await execFile('git', ['push', 'origin', version]);
	core.setOutput('created', 'yes');
}

init().catch(error => {
	core.setFailed(error.name + ' ' + error.message);
});
