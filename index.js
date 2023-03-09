import {promisify} from 'node:util';
import process from 'node:process';
import {execFile} from 'node:child_process';
import * as core from '@actions/core';
import dailyVersion from 'daily-version';

const exec = promisify(execFile);

async function init() {
	// Use ENV if it's a `push.tag` event
	if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
		const pushedTag = process.env.GITHUB_REF.replace('refs/tags/', '');
		core.setOutput('version', process.env.GITHUB_REF.replace('refs/tags/', ''));
		core.info(`Run triggered by tag \`${pushedTag}\`. No new tags will be created by \`daily-version-action\`.`);
		return;
	}

	// Look for tags on the current commit
	await exec('git', [
		'fetch',
		'--depth=1',
		'origin',
		'refs/tags/*:refs/tags/*',
	]).catch(() => {}); // It might be a new repo #18
	const {stdout: tagsOnHead} = await exec('git', [
		'tag',
		'-l',
		'--points-at',
		'HEAD',
	]);
	if (tagsOnHead) {
		const [mostRecentTag] = tagsOnHead.split('\n'); // `stdout` may contain multiple tags
		core.setOutput('version', mostRecentTag);
		core.info(`No new commits since the last tag (${mostRecentTag}). No new tags will be created by \`daily-version-action\`.`);
		return;
	}

	// A new tag must be created
	const version = dailyVersion(core.getInput('prefix'));
	core.info(`HEAD isn’t tagged. \`daily-version-action\` will create \`${version}\``);

	core.setOutput('version', version);
	core.exportVariable('DAILY_VERSION', version);

	// Ensure that the git user is set
	const hasEmail = await exec('git', ['config', 'user.email']).catch(_ => false);
	if (!hasEmail) {
		await exec('git', [
			'config',
			'user.email',
			'actions@users.noreply.github.com',
		]);
		await exec('git', ['config', 'user.name', 'daily-version-action']);
	}

	// Create tag and push it
	await exec('git', ['tag', version, '-m', version]);
	await exec('git', ['push', 'origin', version]);
	core.setOutput('created', 'yes');
	core.exportVariable('DAILY_VERSION_CREATED', 'yes');
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- ncc support?
init().catch(error => {
	core.setFailed(error.name + ' ' + error.message);
});
