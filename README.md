# daily-version-action

<img align="right" width="400" src="https://user-images.githubusercontent.com/1402241/83384901-7d691400-a3e8-11ea-8e70-068f6c4e0c30.png">

Creates a new tag using the format `Y.M.D` (using [daily-version](https://github.com/fregante/daily-version)), but only if `HEAD` isn’t already tagged.

Ideally used on schedule, but you could also change the suggested condition to only make it run on `master`.

## Usage

It expects `git` to be configured to push to the same repo. The `v2` of `actions/checkout` automatically sets required token and, if not set, this action will use the git user `daily-version-action <actions@users.noreply.github.com>` to create the tag. This can be customized with something like [setup-git-token](https://github.com/fregante/setup-git-token).

See [action.yml](action.yml)

```yaml
  Version:
    steps:
    - uses: actions/checkout@v2
    - name: Create tag if necessary
      uses: fregante/daily-version-action@v1
```

You can use the `created` and `version` outputs of this action to test whether a new version has been created, even [across jobs](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjobs_idoutputs):

```yaml
    - name: 'Create tag if necessary'
      id: version
      uses: fregante/daily-version-action@v1
    - name: 'Created?'
      if: steps.version.outputs.created
      runs: echo 'Created!' ${{ steps.version.outputs.version }}
```

## Inputs

- `prefix` - Optional. You can specify what to prefix the tag name with. For example:

```yaml
  Version:
    steps:
    - uses: actions/checkout@v2
    - name: Create tag if necessary
      uses: fregante/daily-version-action@v1
      with:
        prefix: v # This will cause the tags to start with v, like "v20.12.31`
```

## Outputs

- `created` - If this output exists, this action created a new tag.
- `version` - The latest tag, whether it already existed or if it just created one.

Outputs can be [used across jobs](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjobs_idoutputs) as well.

## Examples

### Nightly release

Here's a complete workflow to create a nightly release, when necessary: ([original here](https://github.com/notlmn/browser-extension-template/blob/9b284ce97a5389f8a7c5d3aebe7cb8cf0c9df0a9/.github/workflows/deployment.yml))

```yml
on:
  schedule:
    - cron: '59 23 * * *'

jobs:
  Tag:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: fregante/daily-version-action@v1
        name: Create tag if necessary
        id: daily-version
    outputs: # Shares the action’s outputs to the Next jobs
      created: ${{ steps.daily-version.outputs.created }}
      version: ${{ steps.daily-version.outputs.version }}
        
  Next:
    needs: Tag
    if: needs.Tag.outputs.created
    runs-on: ubuntu-latest
    steps:
      - run: echo It looks like ${{ needs.Tag.outputs.version }} was created!
```
