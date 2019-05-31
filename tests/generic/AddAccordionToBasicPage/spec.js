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
	
	describe('check the 2nd Add Block and 2nd Add Layout buttons are displayed', () => {
		it('wait for the 2nd Add Block link to be displayed', async () => {
			await UofC.waitForObjectLoad('.layout-section:nth-child(4) .new-block>a', waitLong * 3, 1000, true);
		});
		UofC.validateDisplayedTextEquals('.layout-section:nth-child(4) .new-block>a', 'Add Block');
		UofC.validateDisplayedTextEquals('.new-section:nth-child(5)>a', 'Add Layout');
	});
	
	const newAccordionBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addAccordionBlock;
	UofC.addNewBlock(newAccordionBlockValues);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	const accordionBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().editAccordion;
	UofC.editAccordionBlock(accordionBlockValues);
	
	describe('expand accordion\'s content section #2 and validate the color is changed to red', () => {
		let accordionBlockElement, contentHeadingElements, contentHeadingElement, contentHeadingColor;
		
		it('find the created accordion block', async () => {
			accordionBlockElement = await driver.findElement(By.css('div[class*=ucws-accordion'));
			
			if (!accordionBlockElement) {
				throw 'the accordion block was not found but expected';
			}
		});
		
		it('find accordion #' + accordionBlockValues.nrAccordionBlockToEdit + ' block\'s content headings', async () => {
			contentHeadingElements = await accordionBlockElement.findElements(By.css('div[class*=panel-heading]'));
			
			if (!contentHeadingElements.length > 0) {
				throw 'no content headings found within the accordion block #' + accordionBlockValues.nrAccordionBlockToEdit +
				' but expected';
			}
		});
		
		it('click the heading of accordion\'s 2nd content', async () => {
			//bring the heading into the view
			await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', contentHeadingElements[1]);
			await contentHeadingElements[1].click();
			await driver.sleep(1000); //need a second or so to wait for the block to expand, otherwise the color won't match
		});
		
		it('the color of 2nd content\'s heading is now red (#cf0722)', async () => {
			//expected: //rgba(207, 7, 34, 1) -> red (#cf0722) OR rgba(196, 191, 182, 1) -> gray (#c4bfb6)
			contentHeadingColor = await contentHeadingElements[1].getCssValue('background-color');
			//transform from rgb to hex
			const rgb2hex = require('rgb2hex');
			contentHeadingColor = await rgb2hex(contentHeadingColor).hex;
			expect(contentHeadingColor).to.equal('#cf0722');
		});
	});
});