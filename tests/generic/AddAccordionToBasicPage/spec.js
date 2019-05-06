/**
 * Created by valeriu.jecov on 25/02/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-628 | https://ucalgary.atlassian.net/browse/UCWS-628
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');
// const expect = require('chai').expect;

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	let driver = null;
	// let By = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
		await UofC.startApp();
		await UofC.login();
		driver = harnessObj.driver;
		// By = harnessObj.By;
	});
	
	after(async () => {
		await harnessObj.quit(this);
	});
	
	afterEach(async () => {
		await UofC.afterEachTest(this.ctx.currentTest);
	});
	
	//reading json data files and preparing the required variables for later usage
	const dataJsonFilePath = require('path').join(__dirname, '/data/data.json');
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	
	UofC.createBasicPage(newPageValues);
	
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	UofC.addNewLayout('1', '1');
	
	// describe('check the 2nd Add Block and 3rd Add Section buttons are displayed', () => {
	// 	it('wait for the 2nd Add Block link to be displayed', async () => {
	// 		await UofC.waitForObjectLoad('.layout-section:nth-child(4) .new-block>a', waitLong * 3, 1000, true);
	// 	});
	//
	// 	UofC.validateDisplayedTextEquals('.layout-section:nth-child(4) .new-block>a', 'Add Block');
	//
	// 	it('wait for the 2nd Add Layout link to be displayed', async () => {
	// 		await UofC.waitForObjectLoad('.new-section:nth-child(5)>a', waitLong * 3, 1000, true);
	// 	});
	// 	UofC.validateDisplayedTextEquals('.new-section:nth-child(5)>a', 'Add Layout');
	// });
	describe('check the 2nd Add Block and 3rd Add Layout buttons are displayed', () => {
		UofC.validateDisplayedTextEquals('.layout-section:nth-child(4) .new-block>a', 'Add Block');   //div[data-layout-delta="1"] .new-block>a
		UofC.validateDisplayedTextEquals('.new-section:nth-child(5)>a', 'Add Layout');
	});
	
	const newAccordionBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addAccordionBlock;
	UofC.addNewBlock(newAccordionBlockValues);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	describe('edit this block on accordion', () => {
		it('click the edit this block button', async () => {
			const editBlockElements = await UofC.findElementsByCSS('div.block a[title*="Edit Accordion block"]');
			if (editBlockElements.length > 0) {
				//bring the button into the view
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', editBlockElements[0]);
				editBlockElements[0].click();
				await UofC.waitForPageLoad();
				await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
			} else {
				throw '"edit this block" button could not be found';
			}
		});
		
		it('confirm the dialog is loaded', async () => {
			await UofC.waitForObjectLoad('.ui-dialog', waitLong * 3, 1000, true);
		});
	});
});