/**
 * Created by valeriu.jecov on 17/10/2018.
 */

/* jshint -W024 */
/* jshint expr:true */
/* jshint laxcomma:true */

const testHarness = (function () {
	const {Builder, By, Key, until, webdriver} = require('selenium-webdriver');     // ?!
	const fsextra = require('fs-extra')
	 , expect = require('chai').expect
	 , Moment = require('moment')
	 , HarnessJson = require("./harness-json")
	 , request = require('request'); //this one is used for sending the status of the test to BrowserStack
	
	let driver = null
	 , env = null
	 , role = null
	 , browserClient = null
	 , failureFatal = false
	 , username = null
	 , password = null
	 , baseUrl = null
	 , configJson = null
	 , profilePath = 'C:\\tmp\\profile-' + Math.random()
	 , chromePluginPath = null
	 , browserStack = null
	 , browserStackArgs = null     //these arguments should have next format:
	 , appName = null; //app name should match a value from the *.config.json file
	
	const getCommandLineArgs = function () {
		const commandLineArgs = require('command-line-args');
		const commandLineOptionDefinitions = [
			{name: 'ui', type: String},
			{name: 'recursive', type: String},
			{name: 'timeout', type: Number},
			{name: 'slow', type: Number},
			{name: 'reporter', type: String},
			{name: 'env', type: String},
			{name: 'role', type: String},
			{name: 'browserClient', type: String},
			{name: 'username', type: String},
			{name: 'password', type: String},
			{name: 'failureFatal', type: String},
			{name: 'chromePluginPath', type: String},
			{name: 'browserStack', type: String},       //this is True or False (will run in browser stack or not)
			{name: 'browserStackArgs', type: String},   //browser stack config settings (environment variables)
			{name: 'appName', type: String}
		];
		
		const options = commandLineArgs(commandLineOptionDefinitions);
		
		let errMsg = '';
		if (!options.env) errMsg = 'Please provide the --env argument';
		else if (!options.role) errMsg = 'Please provide the --role argument';
		// else if (!options.browserClient) errMsg = 'Please provide the --browserClient argument';
		else if (!options.browserStack) errMsg = 'Please provide the --browserStack argument';
		// else if (!options.browserStack && !option.browserStackArgs) errMsg = 'Please provide the --browserStackArgs argument';
		else if (!options.appName) errMsg = 'Please provide the --appName argument';
		
		if (errMsg) {
			// console.log('<<< ERROR: ' + errMsg + ' >>>');
			// process.exit(1);
			throw '\n<<< ERROR: commandline args --- ' + errMsg + '>>>\n';
		}
		
		env = options.env;
		
		role = options.role;
		if (!options.browserClient) {
			//this should set the browser to chrome as default when it is not declared
			browserClient = 'chrome';
		} else {
			browserClient = options.browserClient;
		}
		
		chromePluginPath = options.chromePluginPath;
		browserStack = options.browserStack;
		
		if(options.browserStack) {
			if(options.browserStackArgs) {
				browserStackArgs = options.browserStackArgs;
				// read Input capabilities from CMD arguments
				browserStackArgs = browserStackArgs.split(',');
				if (browserStackArgs.length !== 5) {
					throw "not all (or no) browserStackArgs exist, expected 5 instead of " + browserStackArgs.length +
					": \n" + browserStackArgs + '\n';
				}
			}
		}
		
		if (options.failureFatal){
			failureFatal = true;
		}
		
		if (options.username) {
			username = options.username;
		} else {
			//look up username if available
			if (env !== 'all') {
				const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
				options.configJson = harnessJsonObj.getJsonData();
				options.username = harnessJsonObj.getJsonData()[role].credentials.username;
			}
		}
		
		if (options.password) {
			password = options.password;
		}
		
		appName = options.appName;
		return options;
	};
	
	const getBrowserClient = function getBrowserClient() {
		return browserClient;
	};
	
	const getEnv = function () {
		return env;
	};
	
	const getUserRole = function () {
		return role;
	};
	
	const takeScreenCapture = function (fileName) {
		driver.takeScreenshot()
		 .then(function (data) {
			 const stream = require('fs').createWriteStream('./screen-caps/' + fileName);
			 stream.write(new Buffer(data, 'base64'));
			 stream.end();
			 console.log('Screen capture saved: ' + fileName);
		 });
	};
	
	const init = async () => {
		getCommandLineArgs();
		
		if(browserStack === 'true') {
			// Input capabilities
			const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
			
			if (harnessJsonObj.getJsonData().browserStack) {
				let capabilities = {
					//these ones are taken from the JSON file (the defaults)
					'browserstack.user': harnessJsonObj.getJsonData().browserStack.user,
					'browserstack.key': harnessJsonObj.getJsonData().browserStack.key,
					
					//these ones are taken from the JSON file (the defaults) either the browserStackArgs command line argument
					'os': browserStackArgs ? browserStackArgs[0] : harnessJsonObj.getJsonData().browserStack.osName,
					'os_version': browserStackArgs ? browserStackArgs[1] : harnessJsonObj.getJsonData().browserStack.osVersion,
					'browserName': browserStackArgs ? browserStackArgs[2] : harnessJsonObj.getJsonData().browserStack.browserName,
					'browser_version': browserStackArgs ? browserStackArgs[3] : harnessJsonObj.getJsonData().browserStack.browserVersion,
					'resolution': browserStackArgs ? browserStackArgs[4] : harnessJsonObj.getJsonData().browserStack.resolution,
					
					//these ones are taken from the JSON file (the defaults)
					'browserstack.debug': harnessJsonObj.getJsonData().browserStack.debug,                      //default: false
					'browserstack.console': harnessJsonObj.getJsonData().browserStack.console,                  //default: errors (options: disable, errors, warnings, info, verbose)
					'browserstack.networkLogs': harnessJsonObj.getJsonData().browserStack.networkLogs,          //default: false
					'browserstack.seleniumLogs': harnessJsonObj.getJsonData().browserStack.seleniumLogs,        //default: true
					'browserstack.video': harnessJsonObj.getJsonData().browserStack.video,                      //default: true
					'browserstack.local': harnessJsonObj.getJsonData().browserStack.local,                      //default: false
					'browserstack.localIdentifier': harnessJsonObj.getJsonData().browserStack.localIdentifier   //default: n/a
				};
				
				
				/*
				----------------------------------------------------------------------------------------------------------
				---- NEW ONES | FROM: https://www.browserstack.com/automate/capabilities?tag=selenium-4
				var capabilities = {
					'bstack:options' : {
						'os' : 'Windows',
						'osVersion' : '7',
						'resolution' : '1280x1024',
						'projectName' : 'ProjectName',
						'buildName' : 'BuildNumber',
						'sessionName' : 'TestName',
						'local' : 'true',
						'debug' : 'true',
						'consoleLogs' : 'warnings',
						'networkLogs' : 'true',
						'video' : 'false',
						'timezone' : 'Edmonton',
						'seleniumVersion' : '3.14.0',
						'chrome' : {
							'driver' : '2.46',
						},
						'seleniumLogs' : 'false', //default: true
						'userName' : 'valeriujecov1',
						'accessKey' : 'c8EHLyzv9zWTJ2zGRedY',
					},
					'browserName' : 'Chrome',
					'browserVersion' : '71.0',
				}
				 ----------------------------------------------------------------------------------------------------------
				 */
				
				console.log('\nNext are BrowserStack capabilities ------------------' +
				 '\nos                                 : ' + capabilities.os +
				 '\nos version                         : ' + capabilities.os_version +
				 '\nbrowser name                       : ' + capabilities.browserName +
				 '\nbrowser version                    : ' + capabilities.browser_version + '' +
				 '\nresolution                         : ' + capabilities.resolution +
				 '\nbrowserstack:local                 : ' + harnessJsonObj.getJsonData().browserStack.local +
				 '\nbrowserstack:localIdentifier       : ' + harnessJsonObj.getJsonData().browserStack.localIdentifier +
				 '\n-----------------------------------------------------\n');
				
				driver = await new
				Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(capabilities).build();
			} else {
				throw '--browserStack argument is true but there are no "browserStack" parameters in the ' +
				getEnv() + '.config.json file\n either:\n the "browserStackArgs" commandline arguments are missing \n' +
				browserStackArgs ? browserStackArgs : harnessJsonObj.getJsonData().browserStack + '\n';
			}
		} else {
			switch (getBrowserClient().toLowerCase()) {
			 //defaults to chrome browser even if it was not declared (set by lines #62-67 above)
			 // if more browser needed then additional cases + changes are needed (also 'if' @ line #62 above)
				case 'chrome':
					let chrome = require('selenium-webdriver/chrome');
					const chromeOpts = {
						'args': [
							'--user-data-dir=' + profilePath,   // directory where the browser stores the user profile
							'--disable-breakpad',               // disables error dumps
							// '--disable-extensions',             // disables browser extensions
							// '--disable-plugins',                // disables browser plugins
							'--disable-infobars',               // disables the info bar at top of browser
							'--disable-gpu',                    // disables gpu logs
							'--disable-popup-blocking',          // disables popup blocking
							// '--headless',                       // runs browser in headless mode
							// '--window-size=800,600',            // sets the initial window size. provided as string in the format "800,600"
							// '--window-position=1,1',            // specify the initial window position: --window-position=x,y
							'--start-maximized',                // starts browser maximized
							'--log-level=3'                     // sets the minimum log level. valid values are from 0 to 3: INFO = 0, WARNING = 1, LOG_ERROR = 2, LOG_FATAL = 3
						]
					};
					
					const chromeOptions = new chrome.Options();
					chromeOptions.addArguments(chromeOpts.args);
					
					if (chromePluginPath) {
						chromePluginPath = __dirname + chromePluginPath;
						console.log('adding chrome extension:', chromePluginPath);
						const plugin = fsextra.readFileSync(chromePluginPath, {encoding: 'base64'});
						chromeOptions.addExtensions(plugin);
					}
					
					driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
					await driver.manage().deleteAllCookies();
					// driver.manage().window().setSize(1900, 1200);  // Sets browser window size
					break;
				default:
					console.log('Error: ' + getBrowserClient() + ' not configurable. Exiting.\n');
					process.exit(0);
			}
		}
		
		const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
		configJson = harnessJsonObj.getJsonData();
		
		// load config details from json --- add all the urls available in the *.config.json file
		if (appName === 'ucLaw') baseUrl = configJson.appsUrls.ucLaw + '/user';
		if (appName === 'ucWeb') baseUrl = configJson.appsUrls.ucWeb + '/user';
		
		if (!username) username = configJson[role].credentials.username;
		if (!password) password = configJson[role].credentials.password;
		
		return {
			driver: driver
			, expect: expect
			, By: By
			, until: until
			, configJson: configJson
			, role: role
			, baseUrl: baseUrl
			, appName: appName
			, username: username
			, password: password
			, failureFatal: failureFatal
			, init: init
			, takeScreenCapture: takeScreenCapture
			, getEnv: getEnv
			, getUserRole: getUserRole
			, quit: quit
			, browserStack: browserStack
		};
	};
	
	const closeWindow = function () {
		try {
			driver.sleep(2000);
			driver.close();
		} catch (err) {
			console.log("harness.close error", err);
		}
	};
	
	const quit = async (test) => {
		try {
			if (driver) {
				// REPORTS *********************************************************************************************
				//Browser's Console LOg Report -------------------------------------------------------------------------
				const webdriverLogs = await driver.manage().logs();
				// const getLogTypes = await webdriverLogs.getAvailableLogTypes();
				const getBrowser = await webdriverLogs.get('browser');
				//check if there are any messages in the browser's developers console and report them if any exist
				if (getBrowser.length > 0) {
					console.log('\n************************************************************************************');
					console.log('------------------------------ BROWSER\'s CONSOLE LOGS ------------------------------');
					getBrowser.forEach((item) => {
						console.log('LOG LEVEL: ' + item.level.name + '\n->   ' + item.message + '\n');
					});
					
					//works the same way as the .forEach above - left here as an example
					/*for (let i = 0; i < getBrowser.length; i++) {
						console.log('CONSOLE LOG #' + (i + 1));
						console.log(getBrowser[i].level.name + ': ' + getBrowser[i].message + '\n');
					}*/
					console.log('************************************************************************************');
				}
				
				//BrowserStack reporter
				if (browserStack === 'true') {
					await browserStackReport(test);
				}
				// REPORTS *********************************************************************************************
				
				await closeWindow();
				await driver.sleep(1000);
				await driver.quit();
				
				const fs = require('fs-extra');
				await fs.remove(profilePath)
				 .then(function () {
					 console.log('\ncleanup profile: ' + profilePath + '\n');
				 })
				 .catch(function (err) {
					 console.log('\ncleanup profile error: ', err);
				 });
				await driver.sleep(1000);
			}
		} catch (err) {
			console.log('\nharness.quit error: ', err);
		}
		console.log('************************************************************************************');
	};
	
	const browserStackReport = async (test) => {
		//BrowserStack - FAILURE case only here
		console.log('\n************************************************************************************');
		console.log('--------------------------- BROWSERSTACK SESSION DETAILS ---------------------------');
		//get session id:
		const sessionData = await driver.session_;
		const sessionId = await sessionData.id_;
		// console.log('BrowSerStack sessionData : ' + sessionData);
		console.log('BrowserStack Reporter - sessionId:   ' + sessionId);
		console.log('BrowserStack Reporter - test link:   ' +
		 '\nhttps://automate.browserstack.com/builds/499c08b6c70b2bc7349660bd49134fa58e809207/sessions/' + sessionId + '#automate_button');
		
		//temp --> check what else can I get out of the test parameter:
		//if this comes from the afterEach then it should contain the values below
		// console.log('test.title                         : ' + test.title);
		// console.log('test.state                         : ' + test.state);
		// console.log('test.err.stack                     : ' + test.err.stack);
		// console.log('test._afterAll[0]                  : ' + test._afterAll[0]);
		// console.log('test._afterAll[0].err              : ' + test._afterAll[0].err);
		// console.log('test._afterAll[0].err.stack        : ' + test._afterAll[0].err.stack);
		// console.log('test._afterAll[0].err.message      : ' + test._afterAll[0].err.message);
		
		let testState
		 , testTitle
		 , testErrorStack
		 , suitesCounter
		 , testsCounter;
		
		//go through the test suites
		suitesCounter = test.suites.length;
		if (suitesCounter > 0) {
			for (let i = 0; i < suitesCounter; i++) {
				//go through the tests and find if any failed
				testsCounter = test.suites[i].tests.length;
				if (testsCounter > 0) {
					for (let j = 0; j < testsCounter; j++) {
						testTitle = test.suites[i].tests[j].title;              //retrieve the title of the step
						testState = test.suites[i].tests[j].state;              //retrieve test's state (failed / passed)
						if(testState === 'failed') {
							testErrorStack = test.suites[i].tests[j].err.stack;   //retrieve the error stack
							
							//this makes sure that we exit out of both loops
							j = testsCounter;
							i = suitesCounter;
						}
					}
				} else {
					console.error("BrowserStack Reporter: no tests were found but expected");
				}
			}
		} else {
			console.error("BrowserStack Reporter: no tests suites were found but expected");
		}
		
		console.log('---------------------------- UPDATE BROWSERSTACK STATUS ----------------------------');
		//if err then err else pass positive message:
		let reason = testErrorStack ? testErrorStack : ' test successfully passed, no problems found';
		if (testState === 'undefined') {
			testState = 'failed';
			reason = 'the test failed because testState = undefined - something went wrong'
		}
		console.log('testState : ' + testState);
		console.log('reason    : ' + reason);
		await request({
			uri: "https://valeriujecov1:c8EHLyzv9zWTJ2zGRedY@api.browserstack.com/automate/sessions/" + sessionId + ".json",
			method: "PUT",
			// form: {"status": "failed", "reason": test.err.stack}
			form: {"status": testState, "reason": reason}
		});
		console.log('************************************************************************************');
	};
	
	return {
		init: init
		, getCommandLineArgs: getCommandLineArgs
		, getEnv: getEnv
		, getUserRole: getUserRole
		, Moment: Moment
		, HarnessJson: HarnessJson
		, driver: driver
		, browserStack: browserStack
	};
})();

module.exports = testHarness;