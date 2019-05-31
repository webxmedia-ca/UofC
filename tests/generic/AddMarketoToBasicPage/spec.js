/**
 * Created by valeriu.jecov on 07/02/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-768 | https://ucalgary.atlassian.net/browse/UCWS-768
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
 ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
		await UofC.startApp();
		await UofC.login();
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
	
	const newMarketoBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addMarketoBlock;
	UofC.addNewBlock(newMarketoBlockValues);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	//edit block 1st time
	const marketoBlockValues1 = new HarnessJson(dataJsonFilePath).getJsonData().editMarketoFirstTime;
	const imageAttachmentFilePath = require('path').join(__dirname, '/attachments/' +
	 (marketoBlockValues1.imageUpload.backgroundImage));
	UofC.editMarketoBlock(marketoBlockValues1, imageAttachmentFilePath);
	
	//edit block 2nd time
	const marketoBlockValues2 = new HarnessJson(dataJsonFilePath).getJsonData().editMarketoSecondTime;
	UofC.editMarketoBlock(marketoBlockValues2);
});