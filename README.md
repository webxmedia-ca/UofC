# Automated UofC Tests
this repo defines the automated tests suites for UofC. The git url is: ******

# Dependencies
#### Packages installations
run `npm install` to install the packages. Optionally, you can run `npm update` to update your npm packages if required.

# Running the scripts
- the tests can be run by using an `npm run` command within the scripts section of [package.json](./package.json)
- the usage is `npm run <script name> -- --env=xxx` where xxx can be dev, tst, preprd or prd.

for e.g. to run the 'create pages' script in TST we'd use next:
- to run the test locally in chrome:
  - `npm run uclaw:test1 -- --env=tst --browserClient=chrome --browserStack=false`
  - `npm run uclaw:test1 -- --env=tst --browserStack=false`
- to run the test on BrowserStack using the `*.config.json` file's `browserStack` parameters as environment's settings:
  - `npm run uclaw:test1 -- --env=tst --browserStack=true`

#### The command line arguments:
- `--browserClient`
  - optional, see the first and second example above
  - when this is not declare then the default browser will be set to chrome
  - I've Used 'chrome' as a parameter in the example above because this framework handles only chrome driver
  - IE or FF was not implemented because all the tests are meant to be run on BrowserStack
  - can be extended to handle other browsers but not needed for now (will have use the `browserClient` argument when extended)
  
- `--browserStack`
  - required, can be true or false
  - will run the tests in BrowserStack or locally (locally in chrome - as default)
  
- `--username` & `--password`
  - used if you want to run as a non-default user


# Grunt
There are 3 grunt tasks in this repo:
1. `grunt`: runs a line of code count and jshint
2. `grunt jshint`: runs jshint alone.
3. `grunt deploy`: runs sloc, jshint and deploys to git while incrementing the semantic versioning number
