/**
 * Created by valeriu.jecov on 07/02/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-752 | https://ucalgary.atlassian.net/browse/UCWS-752
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
	
	const newImageBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addImageBlock;
	UofC.addNewBlock(newImageBlockValues);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	// replace with the new function when it is ready (note: it is similar to More Info)
	const imageBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().editImage;
	const imageAttachmentFilePath = require('path').join(__dirname, '/attachments/' + (imageBlockValues.imageUpload.backgroundImage));
	UofC.editImageBlock(imageBlockValues, imageAttachmentFilePath);
});