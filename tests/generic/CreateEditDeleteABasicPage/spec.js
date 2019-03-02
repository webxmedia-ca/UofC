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

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	// console.log('this.title: ' + this.title + '\n'); //not returning the suite title - which I want
	
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
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	const editHeroCTAValues = new HarnessJson(dataJsonFilePath).getJsonData().editHeroCTA;
	const attachmentJsonFilePath = require('path').join(__dirname, '/attachments/' + editHeroCTAValues.backgroundImage);
	// console.log('dataJsonFilePath:' + dataJsonFilePath);
	// console.log('attachmentJsonFilePath:' + attachmentJsonFilePath);
	
	
	//1. Create a basic page:
	//	Title
	//  Published = true
	//  click Save btn!
	//---> Basic PageTitle # has been created
	UofC.createBasicPage(newPageValues);
	
	//2. Click Layout
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//3. click 1st Add Block    --> dialog displayed
	//  select Add Hero CTA     --> Teams drop down displays    ???!!!???!!! dropdown OR list?!?!?!
	// click Add Block btn!     --> new block displayed
	UofC.addNewBlock('1'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Hero CTA'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	  , 'Close Status Message\nStatus message\nThe layout override has been saved.'
	);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//4. click 2nd Add Section btn
	//  select One Column                                           --> 2nd Add Block & 3rd Add Section btns are displayed
	UofC.addNewSection('2', '1');
	
	describe('check the 2nd Add Block and 3rd Add Section buttons are displayed', () => {
		UofC.validateDisplayedText('.layout-section:nth-child(4) .new-block>a', 'Add Block');
		UofC.validateDisplayedText('.new-section:nth-child(5)>a', 'Add Section');
	});
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//5. click 2nd Add Block btn                                            --> dialog displayed
	//  click Add Banner under UCalgary                                     --> Teams list will be displayed
	//  don't select any Teams & click the Add Block button                 --> New Block is displayed
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Banner'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	  , 'Close Status Message\nStatus message\nThe layout override has been saved.'
	);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//6. Click 2nd *Add Block*      --> dialog displayed
	//  click *Add More Information* under *UCalgary* drop down section     --> Teams list displayed
	//  Do not select any team, click *Add Block*                           --> New Block Displayed
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add More Information'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	  , 'Close Status Message\nStatus message\nThe layout override has been saved.'
	);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//7. Click 2nd *Add Block*                                              --> dialog displayed
	//  click *Add Sidekick CTA* under *UCalgary* drop down section         --> Team list displayed
	//  Do not select any team, click *Add Block*                           --> New Block Displayed
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Sidekick CTA'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	  , 'Close Status Message\nStatus message\nThe layout override has been saved.'
	);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//8. Click 2nd *Add Block*                                              --> dialog displayed
	//  click *Add Banner* under *UCalgary* drop down section               --> Team list displayed
	//  Do not select any team, click *Add Block*                           --> New Block Displayed
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Banner'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	  , 'Close Status Message\nStatus message\nThe layout override has been saved.'
	);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	
	//9. Click 2nd *Add Block*                                              --> dialog displayed
	//  click *Add Image with Text* under *UCalgary* drop down section      --> Team list displayed
	//  Do not select any team, click *Add Block*                           --> New Block Displayed
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Image with Text'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	);
	
	describe('wait', () => {
		it('wait', async () => {
			console.log('wait');
		});
	});
	
	
	
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	UofC.editHeroCTABlock(editHeroCTAValues, attachmentJsonFilePath);
});