# University of Calgary's Automated Tests
This repo defines the automated tests suites for UofC. The git url is:
https://github.com/webxmedia-ca/UofC


# Dependencies
#### Packages installations
Run `npm install` to install the packages (assuming the `package.json` exists).

Optionally, you can run `npm update` to update your npm packages if required.

# Running the scripts
- the tests can be run by using an `npm run` command within the scripts section of [package.json](./package.json)
- the usage is `npm run <script name> -- --env=### --appName=*** --browserStack=????`
  - where `###` can be `dev`, `tst`, `preprd` or `prd`
  - where `***` can be `ucLaw` or something else available within the `*.config.json` file > `appsUrls` section
  - where `###` can be `true` or `false`

For e.g. to run the 'create pages' script in TST we'd use next:
- to run the test locally in chrome:
- `npm run testName -- --env=tst --appName=ucLaw --browserStack=false`
  - `npm run testName -- --env=tst --appName=ucLaw --browserClient=chrome --browserStack=false`
- to run the test on BrowserStack using the `*.config.json` file's `browserStack` parameters as environment's settings:
  - `npm run generic:ValidateInternalMenuAsSiteAdmin -- --env=tst --appName=ucLaw --browserStack=true`
  - `npm run testName -- --env=tst --appName=ucLaw --browserStack=true --browserStackArgs=Windows,7,Chrome,70.0,1024x768`

#### Defining the command line arguments:
- `npm run testName`
  - usage: _`npm run generic:ValidateInternalMenuAsSiteAdmin`_
  - required, this is the npm command to run the test, required the test name as well 

- `--env`
  - usage: _`--env=tst`_
  - required, this tells the framework in what environment the test should be run
  - only 3 options are available: `tst`, `preprd` & `prd`
  - if needed to be changed, then the `tst.config.json`, `preprd.config.json` & `prd.config.json` files need to be renamed
  to something else, e,g.: `newValue.config.json` > now the usage becomes `--env=newValue` 

- `--appName`
  - usage: _`--appName=ucLaw`_
  - required, tells the framework what the application's url is

- `--browserClient`
  - usage: _`--browserClient=chrome`_
  - optional, see the first and second example above
  - when this is not declare the default browser is set to chrome
  - thw 'chrome' parameter in the example above was used because the framework handles chrome driver only
  - IE or FF was not implemented because all the tests are meant to be run on BrowserStack
  - can be extended to handle other browsers but not needed for now (will have use the `browserClient` argument when extended)
  
- `--browserStack`
  - usage: _`--browserStack=true`_
  - required, can be true or false
  - will run the tests in BrowserStack or locally (locally in chrome - as default)

- `--browserStackArgs`
  - usage: _`--browserStackArgs=Windows,7,Chrome,70.0,1024x768`_
  - optional, see the 2nd & 3rd examples above
  - when this argument is not declared then the used defaults are located in the **`*.config.json`** file
  
- `--username` & `--password`
  - used if you want to run as a non-default user

######NOTES: for more details about the command line arguments please see `package.json` ("scripts": section) & `harness.js` files

# Grunt
There are 3 grunt tasks in this repo:
1. `grunt`: runs a line of code count and jshint
2. `grunt jshint`: runs jshint alone.
3. `grunt deploy`: runs sloc, jshint and deploys to git while incrementing the semantic versioning number