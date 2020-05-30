# daily-version-action

Creates a new tag using the format `Y.M.D` (using [daily-version](https://github.com/fregante/daily-version)), but only if `HEAD` isn’t already tagged.

Ideally used on schedule, but you could also change the suggested condition to only make it run on `master`

# Usage

See [action.yml](action.yml)

Basic:

```yaml
    steps:
    - uses: actions/checkout@v2
    - uses: fregante/setup-git-token@v1 # This will allow saving the generated tag
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
    - name: Create tag if necessary
      if: github.event_name == 'schedule' # This ensures it only runs on a schedule
      uses: fregante/daily-version-action@v1
```
