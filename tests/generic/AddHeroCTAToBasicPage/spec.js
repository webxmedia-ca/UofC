/**
 * Created by valeriu.jecov on 07/02/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-604 | https://ucalgary.atlassian.net/browse/UCWS-604
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
	
	UofC.createBasicPage(newPageValues);
	
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	UofC.addNewBlock('1'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Hero CTA'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , '.layout-blocks-ucws-hero-cta'
	);
	
	describe('save page layout', () => {
		//click Save Page Layout
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	UofC.editHeroCTABlock(editHeroCTAValues, attachmentJsonFilePath);
});