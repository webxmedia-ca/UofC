/**
 * Created by valeriu.jecov on 07/02/2019.
 * NOTE: THIS TEST IS NOT YET DONE
 * MANUAL TEST: UCWS-713 | https://ucalgary.atlassian.net/browse/UCWS-713
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
	
	const newBannerBlockValues1 = new HarnessJson(dataJsonFilePath).getJsonData().addBanner1Block;
	UofC.addNewBlock(newBannerBlockValues1);
	
	const newBannerBlockValues2 = new HarnessJson(dataJsonFilePath).getJsonData().addBanner2Block;
	UofC.addNewBlock(newBannerBlockValues2);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	const bannerBlock1Values = new HarnessJson(dataJsonFilePath).getJsonData().editBanner1;
	const banner1AttachmentFilePath = require('path').join(__dirname, '/attachments/' + (bannerBlock1Values.imageUpload.backgroundImage));
	UofC.editBannerBlock(bannerBlock1Values, banner1AttachmentFilePath);
	
	const bannerBlock2Values = new HarnessJson(dataJsonFilePath).getJsonData().editBanner2;
	UofC.editBannerBlock(bannerBlock2Values);
});