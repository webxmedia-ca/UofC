/**
 * Created by valeriu.jecov on 26/02/2019.
 * NOTE: THIS TEST IS NOT YET DONE
 * MANUAL TEST: UCWS-648 | https://ucalgary.atlassian.net/browse/UCWS-648
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');

//temp - so I can use driver. actions in the test here
// UcLaw.init(harness.init, waitShort, waitLong);
// let driver = harness.driver;
//temp - so I can use driver. actions
const info = require(info);

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	// console.log('this.title: ' + this.title + '\n'); //not returning the suite's title I want
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
		await UofC.startApp();
		await UofC.login();
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
	
	/*
	const editHeroCTAVals = new HarnessJson(dataJsonFilePath).getJsonData().editHeroCTA;
	const attachmentFilePath = require('path').join(__dirname, '/attachments/' + editHeroCTAVals.backgroundImage);
	console.log('dataJsonFilePath  : ' + dataJsonFilePath);
	console.log('attachmentFilePath: ' + attachmentFilePath);
	*/
	
	//1. Create a basic page:
	//	Title
	//  Published = true
	//  click Save btn!
	//---> Basic PageTitle # has been created
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	UofC.createBasicPage(newPageValues);
	
	//2. Click Layout
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	//3. click 1st Add Block btn and select *Add Hero CTA* block
	UofC.addNewBlock('1'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_hero_cta]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Hero CTA'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , '#layout-builder .layout.hero'  //'.layout-blocks-ucws-hero-cta' OR a[title="Edit Hero Call to Action block"]
	);
	
	//4. click 2nd Add Section btn and choose 'One Column' option
	UofC.addNewSection('2', '1');
	
	describe('check the 2nd Add Block and 3rd Add Layout buttons are displayed', () => {
		UofC.validateDisplayedText('.layout-section:nth-child(3) .new-block>a', 'Add Block');   //div[data-layout-delta="1"] .new-block>a
		UofC.validateDisplayedText('.new-section:nth-child(4)>a', 'Add Layout');
	});
	
	
	//5. click 2nd Add Block btn and select *Add Banner* block
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_banner]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Banner'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , '.draggable:nth-child(1) a[title="Edit Banner block"]' // , 'div:nth-child(1)>.layout-blocks-ucws-banner'
	);
	
	//6. click 2nd Add Block btn and select *Add More Information* block
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_more_info]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add More Information'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , 'div:nth-child(1) a[title="Edit More Information block"]'    // , '.layout-blocks-ucws-more-info'
	);
	
	//7. click 2nd Add Block btn and select *Add Sidekick CTA* block
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_sidekick]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Sidekick CTA'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , 'div:nth-child(1) a[title="Edit Sidekick Call to Action block"]'    //, '.layout-blocks-ucws-sidekick-cta'
	);
	
	//8. click 2nd Add Block btn and select *Add Banner* block
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_banner]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Banner'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , '.draggable:nth-child(4) a[title="Edit Banner block"]'   //, 'div:nth-child(4)>.layout-blocks-ucws-banner'
	);
	
	//9. click 2nd Add Block btn and select *Add Image with Text* block
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_image_text]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Image with Text'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , 'div:nth-child(1) a[title="Edit Image with Text block"]'    //, '.layout-blocks-ucws-image_text'
	  //, '.draggable:nth-child(5) a[title="Edit Image with Text block"]'   //this is good as well (another example)
	);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	const editHeroCTAValues = new HarnessJson(dataJsonFilePath).getJsonData().editHeroCTA;
	const attachmentJsonFilePath = require('path').join(__dirname, '/attachments/' + editHeroCTAValues.backgroundImage);
	UofC.editHeroCTABlock(editHeroCTAValues, attachmentJsonFilePath);
	
	const bannerBlock1Values = new HarnessJson(dataJsonFilePath).getJsonData().editBanner1;
	UofC.editBannerBlock(bannerBlock1Values);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
			info('some info');
		});
	});
	
	const moreInfoBlockValues = new HarnessJson(dataJsonFilePath).getJsonData().editMoreInfo;
	UofC.editMoreInfoBlock(moreInfoBlockValues);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
});