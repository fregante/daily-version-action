# daily-version-action

Creates a new tag using the format `Y.M.D` (using [daily-version](https://github.com/fregante/daily-version)), but only if `HEAD` isn’t already tagged.

Ideally used on schedule, but you could also change the suggested condition to only make it run on `master`.

# Usage

See [action.yml](action.yml)

Basic:

```yaml
  Version:
    steps:
    - uses: actions/checkout@v2
    - uses: fregante/setup-git-token@v1 # This will allow saving the generated tag
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
    - name: Create tag if necessary
      if: github.event_name == 'schedule' # This ensures it only runs on a schedule
      uses: fregante/daily-version-action@v1
```

To check if any new version has been created in other jobs, use [`job.outputs`](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjobs_idoutputs) object to see if `created` property is set. This property would not be set if any new versions are created.

```yaml
  Build:
    needs: Version
    if: github.event_name == 'push' || needs.Version.outputs.created
```

Regradless of creating a new version, the most recent version can be accessed using the `job.outputs.version` property, after this action is run.

``` yaml
  Cleanup:
    needs: Version
    run: echo "Current version: ${{needs.Version.outputs.version}}"
```
