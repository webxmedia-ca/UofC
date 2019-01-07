/**
 * Created by valeriu.jecov on 10/17/2018.
 */

/* jshint -W024 */
/* jshint expr:true */
/* jshint laxcomma:true */

const testHarness = (function () {
	const {Builder, By, Key, until, webdriver} = require('selenium-webdriver');     // ?!
	const fsextra = require('fs-extra')
	  , expect = require('chai').expect
	  , Moment = require('moment')
	  , HarnessJson = require("./harness-json");
	
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
	  , browserStackArgs = null;
	
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
			{name: 'browserStack', type: String},   //this is True or False (will run in browser stack or not)
			{name: 'browserStackArgs', type: String} //browser stack config settings (environment variables)
		];
		
		const options = commandLineArgs(commandLineOptionDefinitions);
		
		let errMsg = '';
		if (!options.env) errMsg = 'Please provide the --env argument';
		else if (!options.role) errMsg = 'Please provide the --role argument';
		// else if (!options.browserClient) errMsg = 'Please provide the --browserClient argument';
		else if (!options.browserStack) errMsg = 'Please provide the --browserStack argument';
		else if (!options.browserStack && !option.browserStackArgs) errMsg = 'Please provide the --browserStackArgs argument';
		// {name: 'browserStackArgs', type: Array}
		
		if (errMsg) {
			console.log('<<< ERROR: ' + errMsg + ' >>>');
			process.exit(1);
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
		if(browserStack === 'true') {
			/*// Input capabilities
			const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
			
			if (harnessJsonObj.getJsonData().browserStack) {
				let capabilities = {
					'browserstack.user': harnessJsonObj.getJsonData().browserStack.user,
					'browserstack.key': harnessJsonObj.getJsonData().browserStack.key,
					'os': harnessJsonObj.getJsonData().browserStack.os,
					'os_version': harnessJsonObj.getJsonData().browserStack.osVersion,
					'browserName': harnessJsonObj.getJsonData().browserStack.browserName,
					'browser_version': harnessJsonObj.getJsonData().browserStack.browserVersion,
					'resolution': harnessJsonObj.getJsonData().browserStack.resolution,
					'browserstack.debug': harnessJsonObj.getJsonData().browserStack.debug,
					'browserstack.console': harnessJsonObj.getJsonData().browserStack.console,
					'browserstack.networkLogs': harnessJsonObj.getJsonData().browserStack.networkLogs,
					'browserstack.local': harnessJsonObj.getJsonData().browserStack.local,
					'browserstack.localIdentifier': harnessJsonObj.getJsonData().browserStack.localIdentifier
				};
				driver = await new
				Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(capabilities).build();
				// console.log('browser stack setting: \n' + driver);   //this is an object -- it actually runs the browser in BrowserStack/Dashboard
			} else {
				throw '--browserStack argument is true but there are no browserStack parameters in the ./config/' +
				getEnv() + '.config.json file';
			}*/
			
			// Input capabilities
			//from CMD arguments
			browserStackArgs = options.browserStackArgs.split(',');
			if (browserStackArgs.length !== 5) {
				throw "not all (or no) browserStackArgs exist, expected 5 instead of " + browserStackArgs.length +
				": \n" + browserStackArgs;
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
	
	//next one might be needed later -- save created record in the json then use thos within another tests
	/*
	function loadApplicationsJSON() {
		const appJsonObj = new HarnessJson('./config/' + getEnv() + '.applications.json');
		applicationsJson = appJsonObj.getJsonData();
	}
	*/
	
	/*
	function addApplication(appId) {
		console.log('Application ID: ' + appId);
		
		const maxResultsSize = 50;
		
		if (!applicationsJson.results) applicationsJson.results = [];
		
		applicationsJson.results.push({
			// "appId": appId,
			// "type": appType,
			// "subType": appSubType,
			"date": Moment().format()
		});
		
		//maintain the max results size
		applicationsJson.results = applicationsJson.results.slice(-maxResultsSize);
		saveApplicationsJSON();
	}
	
	function saveApplicationsJSON() {
		// jsonFile.writeFileSync(this._jsonDataFilePath, applicationsJson);
		const appJsonObj = new HarnessJson('./config/' + getEnv() + '.applications.json');
		appJsonObj.saveJsonData(applicationsJson);
	}
	
	function getMostRecentApplication(type, subType, approved) {
		const result = applicationsJson.results.filter(function (obj) {
			return obj.type === type && obj.subType === subType && (approved ? obj.hasOwnProperty('license') : !obj.hasOwnProperty('license'));
		});
		
		if (result.length < 1) console.log('Error: No recent application found.');
		
		return result[result.length - 1];
	}
	
	function setAppLicenseNumber(searchType, searchSubType, licenseNumber) {
		const appId = getMostRecentApplication(searchType, searchSubType, false).appId;
		for (let i = 0, len = applicationsJson.results.length; i < len; i++) {
			if (applicationsJson.results[i].appId === appId) {
				applicationsJson.results[i].license = licenseNumber;
				i = len;
			}
		}
		saveApplicationsJSON();
	}
	*/
	
	const init = async () => {
		getCommandLineArgs();
		
		if(browserStack === 'true') {
			/*// Input capabilities
			const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
			
			if (harnessJsonObj.getJsonData().browserStack) {
				let capabilities = {
					'browserstack.user': harnessJsonObj.getJsonData().browserStack.user,
					'browserstack.key': harnessJsonObj.getJsonData().browserStack.key,
					'os': harnessJsonObj.getJsonData().browserStack.os,
					'os_version': harnessJsonObj.getJsonData().browserStack.osVersion,
					'browserName': harnessJsonObj.getJsonData().browserStack.browserName,
					'browser_version': harnessJsonObj.getJsonData().browserStack.browserVersion,
					'resolution': harnessJsonObj.getJsonData().browserStack.resolution,
					'browserstack.debug': harnessJsonObj.getJsonData().browserStack.debug,
					'browserstack.console': harnessJsonObj.getJsonData().browserStack.console,
					'browserstack.networkLogs': harnessJsonObj.getJsonData().browserStack.networkLogs,
					'browserstack.local': harnessJsonObj.getJsonData().browserStack.local,
					'browserstack.localIdentifier': harnessJsonObj.getJsonData().browserStack.localIdentifier
				};
				driver = await new
				Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(capabilities).build();
				// console.log('browser stack setting: \n' + driver);   //this is an object -- it actually runs the browser in BrowserStack/Dashboard
			} else {
				throw '--browserStack argument is true but there are no browserStack parameters in the ./config/' +
				getEnv() + '.config.json file';
			}*/
			console.log('the browserStackArgs are: ' + browserStackArgs);
			
			const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
			
			if (harnessJsonObj.getJsonData().browserStack) {
				let capabilities = {
					'browserstack.user': harnessJsonObj.getJsonData().browserStack.user,
					'browserstack.key': harnessJsonObj.getJsonData().browserStack.key,
					
					//next ones are taken from the command line (run npm... browserStackArgs)
					'os': browserStackArgs[0],
					'os_version': browserStackArgs[1],
					'browserName': browserStackArgs[2],
					'browser_version': browserStackArgs[3],
					'resolution': browserStackArgs[4],
					
					'browserstack.debug': harnessJsonObj.getJsonData().browserStack.debug,
					'browserstack.console': harnessJsonObj.getJsonData().browserStack.console,
					'browserstack.networkLogs': harnessJsonObj.getJsonData().browserStack.networkLogs,
					'browserstack.local': harnessJsonObj.getJsonData().browserStack.local,
					'browserstack.localIdentifier': harnessJsonObj.getJsonData().browserStack.localIdentifier
				};
				driver = await new
				Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub').withCapabilities(capabilities).build();
				// console.log('browser stack setting: \n' + driver);   //this is an object -- it actually runs the browser in BrowserStack/Dashboard
			} else {
				throw '--browserStack argument is true but there are no browserStack parameters in the ./config/' +
				getEnv() + '.config.json file';
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
					console.log('Error: ' + getBrowserClient() + ' not configurable. Exiting.');
					process.exit(0);
			}
		}
		
		if (getEnv() !== 'all') {
			const harnessJsonObj = new HarnessJson('./config/' + getEnv() + '.config.json');
			configJson = harnessJsonObj.getJsonData();
		}
		
		// load config details from json
		if (env !== 'all') {
			if(role === 'siteadmin') {
				baseUrl = configJson.baseUrl + '/user';
				if (!username) username = configJson[role].credentials.username;
				if (!password) password = configJson[role].credentials.password;
			} else {
				baseUrl = configJson.baseUrl;
			}
		}
		
		return {
			driver: driver
			, expect: expect
			, By: By
			, until: until
			, configJson: configJson
			, role: role
			, baseUrl: baseUrl
			, username: username
			, password: password
			, failureFatal: failureFatal
			, init: init
			, takeScreenCapture: takeScreenCapture
			, getEnv: getEnv
			, getUserRole: getUserRole
			, quit: quit
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
	
	const quit = async () => {
		try {
			if (driver) {
				await closeWindow();
				await driver.sleep(1000);
				await driver.quit();
				
				const fs = require('fs-extra');
				await fs.remove(profilePath)
				  .then(function () {
					  console.log('cleanup profile: ' + profilePath + '\n');
				  })
				  .catch(function (err) {
					  console.log('cleanup profile error: ', err);
				  });
				
				await driver.sleep(1000);
			}
		} catch (err) {
			console.log("harness.quit error", err);
		}
	};
	
	return {
		init: init
		, getCommandLineArgs: getCommandLineArgs
		, getEnv: getEnv
		, getUserRole: getUserRole
		, Moment: Moment
		, HarnessJson: HarnessJson
		, driver: driver
	};
})();

module.exports = testHarness;
