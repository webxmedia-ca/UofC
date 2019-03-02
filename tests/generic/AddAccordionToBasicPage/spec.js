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
		await UofC.login();
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
	
	//reading json data files and preparing the required variables for later usage
	const dataJsonFilePath = require('path').join(__dirname, '/data/data.json');
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	
	
	UofC.createBasicPage(newPageValues);
	
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	UofC.addNewSection('2', '1');   //add a new section (not hero) with the 1 col layout
	
	describe('check the 2nd Add Block and 3rd Add Section buttons are displayed', () => {
		UofC.validateDisplayedText('.layout-section:nth-child(4) .new-block>a', 'Add Block');
		UofC.validateDisplayedText('.new-section:nth-child(5)>a', 'Add Section');
	});
	
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
	  , 'UCalgary'                                                                      //blockCategory
	  , 'details.UCalgary-blocks a[href*=ucws_accordion]'                               //blockExpectedCssLocator
	  , 'details.UCalgary-blocks:nth-child(23)>ul'                                      //categoryLinkGroupLocator
	  , 'Add Accordion'                                                                 //categoryLinkNameToClick
	  , 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
	  , null                                                                            //teamsCheckBoxesToSelect
	  , 'div[class*=accordion]'                                                         //expectedCssLocatorAfterBlockAdded
	);
	
	describe('save page layout', () => {
		//click Save Page Layout
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	describe('edit this block on accordion', () => {
		it('click the edit this block button', async () => {
			const editBlockElements = await UofC.findElementsByCSS('.accordion .block-editing>a');
			if (editBlockElements.length > 0) {
				//bring the button into the view
				await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', editBlockElements[0]);
				// await UofC.clickElementByCSS('.hero-cta .block-editing>a');
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