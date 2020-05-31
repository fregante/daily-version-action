# daily-version-action

Creates a new tag using the format `Y.M.D` (using [daily-version](https://github.com/fregante/daily-version)), but only if `HEAD` isn’t already tagged.

Ideally used on schedule, but you could also change the suggested condition to only make it run on `master`.

## Usage

It expects `git` to be configured to push to the same repo, perhaps via [fregante/setup-git-token](https://github.com/fregante/setup-git-token).

See [action.yml](action.yml)

```yaml
  Version:
    steps:
    - uses: actions/checkout@v2
    - uses: fregante/setup-git-token@v1 # Allows pushing the generated tag to the repo
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
    - name: Create tag if necessary
      if: github.event_name == 'schedule' # Ensures it only runs on a schedule
      uses: fregante/daily-version-action@v1
```

You can use the `created` output of this action to test whether a new version has been created, even [across jobs](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjobs_idoutputs):

```yaml
  Build:
    needs: Version
    if: github.event_name == 'push' || needs.Version.outputs.created
```

## Inputs

None.

## Outputs

- `created` - If this output exists, this action created a new tag.
- `version` - The latest tag, whether it already existed or if it was just created.

Outputs can be [used across jobs](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjobs_idoutputs) as well.
