/**
 * Created by valeriu.jecov on 25/02/2019.
 * NOTE: THIS TEST IS NOT YET DONE
 * MANUAL TEST: UCWS-NA | https://ucalgary.atlassian.net/browse/UCWS-NA
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');
const expect = require('chai').expect;

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	let driver = null;
	let By = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
		await UofC.startApp();
		//await UofC.login();
		driver = harnessObj.driver;
		By = harnessObj.By;
	});
	
	after(async () => {
		await harnessObj.quit();
	});
	
	afterEach(async () => {
		await UofC.afterEachTest(this.ctx.currentTest);
		await UofC.afterEachTest(this.ctx.currentTest.title);
		await UofC.afterEachTest(this.ctx.currentTest.state);
	});
	
	describe('console log retrieval', () => {
		//wrong locator to have the test failed -- tests browser's console log retrieval
		//next is not part of the test -- just remove when finished playing
		UofC.validateDisplayedText('.new-section:nth-child(5)>a', 'Add Section');
		
		it('retrieve browser\'s console values', async () => {
			//*****************************************************************************
			// THIS PIECE HERE RETRIEVES BROWSER's CONSOLE LOG MESSAGES IF ANY EXIST
			const webdriverLogs = await driver.manage().logs();
			// const getLogTypes = await webdriverLogs.getAvailableLogTypes();
			const getBrowser = await webdriverLogs.get('browser');
			//check if there are any messages in the browser's developers console
			if (getBrowser.length > 0) {
				console.log('\n\n*********************************************************************************************');
				console.log('---------------------------------- BROWSER\'s CONSOLE LOGS: ----------------------------------');
				getBrowser.forEach( (item) => {
					console.log('LOG LEVEL: ' + item.level.name + '\n-----> ' + item.message + '\n');
				});
				
				//works the same way as the .forEach above
				/*for (let i = 0; i < getBrowser.length; i++) {
					console.log('CONSOLE LOG #' + (i + 1));
					console.log(getBrowser[i].level.name + ': ' + getBrowser[i].message + '\n');
				}*/
				console.log('---------------------------------------------------------------------------------------------');
				console.log('*********************************************************************************************\n\n');
			} else {
				console.log('failureFatal = true but there are no messages in the browser\'s console');
			}
			//*****************************************************************************
		});
		
		it('wait', async () => {
			console.log('wait');
		});
	});
});