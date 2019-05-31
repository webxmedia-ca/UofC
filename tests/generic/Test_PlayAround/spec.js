/**
 * Created by valeriu.jecov on 26/02/2019.
 * NOTE: THIS TEST IS ALMOST DONE - 95% - need to delete a block (build the function and add it here)
 * MANUAL TEST: UCWS-648 | https://ucalgary.atlassian.net/browse/UCWS-648
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
	
	//1. Create a basic page ---> Basic PageTitle # has been created
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	UofC.createBasicPage(newPageValues);
	
	//2. Click Layout
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	//3. click 1st Add Block btn and select *Add Hero CTA* block
	const newHeroCtaBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addHeroCTABlock;
	UofC.addNewBlock(newHeroCtaBlockValues);
	
	//4. click 1st Add Section btn and choose 'One Column' option
	UofC.addNewLayout('1', '1');  //TODO:this will need to be updated after the missing 2nd layout issue is fixed
	
	describe('check the 2nd Add Block and 2nd Add Layout buttons are displayed', () => {
		it('wait for the 2nd Add Block link to be displayed', async () => {
			await UofC.waitForObjectLoad('.layout-section:nth-child(3) .new-block>a', waitLong * 3, 1000, true);
		});
		UofC.validateDisplayedTextEquals('.layout-section:nth-child(3) .new-block>a', 'Add Block');
		UofC.validateDisplayedTextEquals('.new-section:nth-child(4)>a', 'Add Layout');
	});
	
	
	//// ADD PAGE BLOCKS -------------------------------------------------------------------------------------------------
	//5. click 2nd Add Block btn and select *Add Banner* block
	const newBannerBlockValues1 = new HarnessJson(dataJsonFilePath).getJsonData().addBanner1Block;
	UofC.addNewBlock(newBannerBlockValues1);
	
	//6. click 2nd Add Block btn and select *Add More Information* block
	const newMoreInfoBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addMoreInfo1Block;
	UofC.addNewBlock(newMoreInfoBlockValues);
	
	//7. click 2nd Add Block btn and select *Add Sidekick CTA* block
	const newSidekickCTABlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addSidekick1Block;
	UofC.addNewBlock(newSidekickCTABlockValues);
	
	//8. click 2nd Add Block btn and select *Add Banner* block
	const newBannerBlockValues2 = new HarnessJson(dataJsonFilePath).getJsonData().addBanner2Block;
	UofC.addNewBlock(newBannerBlockValues2);
	
	//9. click 2nd Add Block btn and select *Add Image with Text* block
	const newImageWithTextBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().addImageWithText1Block;
	UofC.addNewBlock(newImageWithTextBlockValues);
	
	
	
	/*
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	*/
	
	/*
	//// EDIT PAGE BLOCKS ------------------------------------------------------------------------------------------------
	const editHeroCTAValues = new HarnessJson(dataJsonFilePath).getJsonData().editHeroCTA;
	const heroCtaAttachmentFilePath = require('path').join(__dirname, '/attachments/' + editHeroCTAValues.imageUpload.backgroundImage);
	UofC.editHeroCtaBlock(editHeroCTAValues, heroCtaAttachmentFilePath);
	
	const bannerBlock1Values = new HarnessJson(dataJsonFilePath).getJsonData().editBanner1;
	UofC.editBannerBlock(bannerBlock1Values);
	
	const moreInfoBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().editMoreInfo;
	UofC.editMoreInfoBlock(moreInfoBlockValues);
	
	const sideKickBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().editSideKick;
	const sideKickAttachmentFilePath = require('path').join(__dirname, '/attachments/' + sideKickBlockValues.imageUpload.backgroundImage);
	UofC.editSideKickBlock(sideKickBlockValues, sideKickAttachmentFilePath);
	
	const bannerBlock2Values = new HarnessJson(dataJsonFilePath).getJsonData().editBanner2;
	UofC.editBannerBlock(bannerBlock2Values);
	
	const imageWithTextBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().editImageWithText;
	const imageAttachmentFilePath = require('path').join(__dirname, '/attachments/' + imageWithTextBlockValues.imageUpload.backgroundImage);
	UofC.editImageWithTextBlock(imageWithTextBlockValues, imageAttachmentFilePath);
	
	//update banner 2
	const bannerBlock2Values2 = new HarnessJson(dataJsonFilePath).getJsonData().editBanner2SecondTime;
	UofC.editBannerBlock(bannerBlock2Values2);
	*/
	
	/*
	//// DELETE PAGE BLOCKS ----------------------------------------------------------------------------------------------
	UofC.deleteBlock('Hero', 1);
	
	UofC.deleteBlock('Banner', bannerBlock1Values.nrBannerBlockToEdit);
	
	UofC.deleteBlock('More Info', moreInfoBlockValues.nrMoreInfoBlockToEdit);
	
	UofC.deleteBlock('Sidekick', sideKickBlockValues.nrSideKickBlockToEdit);
	
	UofC.deleteBlock('Banner', 1);
	
	UofC.deleteBlock('Image with Text', imageWithTextBlockValues.nrImageWithTextBlockToEdit);
	*/
	
	/*
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	*/
	/*
	//// DELETE A PAGE ---------------------------------------------------------------------------------------------------
	UofC.deleteBasicPage(newPageValues.pageTitle);
	*/
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
});