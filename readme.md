# daily-version-action

<img align="right" width="400" src="https://user-images.githubusercontent.com/1402241/83384901-7d691400-a3e8-11ea-8e70-068f6c4e0c30.png">

Creates a new tag using the format `Y.M.D` (using [daily-version](https://github.com/fregante/daily-version)), but only if `HEAD` isn't already tagged.

Ideally used on schedule, but you could also change the suggested condition to only make it run on `main`.

See usage real-world [example on Refined GitHub's repo](https://github.com/refined-github/refined-github/blob/5cda3447bf80cca0c64ae5eb79779ecd62fec18e/.github/workflows/release.yml#L30-L32)

## Usage

It expects `git` to be configured to push to the same repo. 
- `actions/checkout` automatically sets required token to push the tag to the repo.
- If not already set, the tag author will be `daily-version-action <actions@users.noreply.github.com>`. This can be customized with something like [setup-git-token](https://github.com/fregante/setup-git-token).

See [action.yml](action.yml)

```yaml
  Version:
    steps:
    - uses: actions/checkout@v6
    - name: Create tag if necessary
      uses: fregante/daily-version-action@v3
```

You can use the `DAILY_VERSION_CREATED` and `DAILY_VERSION` environment variables created by this action to test whether a new version has been created:

```yaml
    - name: Create tag if necessary
      uses: fregante/daily-version-action@v3
    - name: Created?
      if: env.DAILY_VERSION_CREATED
      run: echo "Yes, created $DAILY_VERSION"
```

If you prefer, you can use its outputs too, which can also work [across jobs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjobs_idoutputs):

```yaml
    - name: Create tag if necessary
      id: version
      uses: fregante/daily-version-action@v3
    - name: Created?
      if: steps.version.outputs.created
      run: echo "Created ${{ steps.version.outputs.version }}"
```

## Inputs

- `prefix` - Optional. String to prepend to the tag name. For example, `v` will create tags like `v20.12.31`.
- `custom-version` - Optional. Override the version number instead of generating one with daily-version. Tag creation logic still applies.

```yaml
  Version:
    steps:
    - uses: actions/checkout@v6
    - name: Create tag if necessary
      uses: fregante/daily-version-action@v3
      with:
        prefix: v
        custom-version: '1.2.3'
```

## Outputs

- `created` - If this output exists, this action created a new tag.
- `version` - The latest tag, whether it already existed or if it just created one.

Outputs can be [used across jobs](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjobs_idoutputs) as well.

## Examples

### Nightly release

```yml
on:
  schedule:
    - cron: '59 23 * * *'

jobs:
  Tag:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v6
    - uses: fregante/daily-version-action@v3
      name: Create tag if necessary
      id: daily-version
    outputs:
      created: ${{ steps.daily-version.outputs.created }}
      version: ${{ steps.daily-version.outputs.version }}

  Next:
    needs: Tag
    if: needs.Tag.outputs.created
    runs-on: ubuntu-latest
    steps:
      - run: echo It looks like ${{ needs.Tag.outputs.version }} was created!
```

## Related

- 🛕 [action-release](https://github.com/fregante/ghatemplates/blob/main/readme.md#action-release) - A workflow to help you release your actions.
- [title-to-labels-action](https://github.com/fregante/title-to-labels-action) - Cleans up the titles of issues and PRs from common opening keywords.
- [setup-git-user](https://github.com/fregante/setup-git-user) - GitHub Action that sets git user and email to enable committing.
