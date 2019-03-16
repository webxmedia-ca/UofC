/**
 * Created by valeriu.jecov on 07/15/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-624 | https://ucalgary.atlassian.net/browse/UCWS-624
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
	const editTextHeroCTAValues = new HarnessJson(dataJsonFilePath).getJsonData().editTextHeroCTA;
	
	
	UofC.createBasicPage(newPageValues);
	
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	UofC.addNewBlock('1'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a[href*=ucws_text_hero_cta]'
	  , 'details.UCalgary-blocks:nth-child(23)>ul'
	  , 'Add Text Hero CTA'
	  , 'details[id*=edit-settings-teams]'
	  , null
	  , null
	  , null
	  , 'a[title*="Edit Text Hero Call to Action block"]'   //was: .layout-blocks-ucws-text-hero-cta
	);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	UofC.editTextHeroCTABlock(editTextHeroCTAValues);
});