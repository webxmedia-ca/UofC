/**
 * Created by valeriu.jecov on 18/10/2018.
 * NOTE: THIS TEST IS NOT YET DONE
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UcLaw = require('../../../lib/UofCLawApp');
// const expect = require('chai').expect;

//temp - so I can use driver. actions in the test here
// UcLaw.init(harness.init, waitShort, waitLong);
const driver = UcLaw.getAttrs().driver;
//temp - so I can use driver. actions

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	let harnessObj = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UcLaw.init(harnessObj, waitShort, waitLong);
		await UcLaw.login();
	});
	
	after(async () => {
		await harnessObj.quit();
	});
	
	afterEach(async () => {
		await UcLaw.afterEachTest(this.ctx.currentTest);
		await UcLaw.afterEachTest(this.ctx.currentTest.title);
		await UcLaw.afterEachTest(this.ctx.currentTest.state);
	});
	
	//reading json data files and preparing the required variables for later usage
	const dataJsonFilePath = require('path').join(__dirname, '/data/data.json');
	
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	UcLaw.createBasicPage(newPageValues);
	
	describe('click Layout tab', () => {
		UcLaw.clickOnTabByText('Layout', '#layout-builder');
	});
	
	UcLaw.addNewSection('2', '1');   //add a new section (not hero) with the 1 col layout
	
	UcLaw.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks:nth-child(22) li:nth-child(1)'
	  , 'details.UCalgary-blocks:nth-child(22)>ul'
	  , 'Add Streaming Media'
	  , 'details[id*=edit-settings-teams]'
	  , 'CSM,Office - CHI'
	  , '.layout.col1:not([class*=hero]) .streaming-media'
	  , 'Close Status Message\nStatus message\nThe layout override has been saved.'
	);
	
	UcLaw.editStreamingMediaBlock('test block heading ' + Math.floor((Math.random() * 1000) + 1)
	  , 'test block description ' + Math.floor((Math.random() * 1000) + 1)
	  , 'accessibility text ' + Math.floor((Math.random() * 1000) + 1)
	  , 'caption for media ' + Math.floor((Math.random() * 1000) + 1)
	  , 'creator credit ' + Math.floor((Math.random() * 1000) + 1)
	  , 'Youtube'
	  , 'https://www.youtube.com/watch?v=jMgvnXq-s8o&list=PLGIDwNGRDzUAK78PuEgxsmDCGmym7romC'
	  , null
	  , false
	);
	
	// describe('just wait ...................................................................', () => {
	//
	// 	it('wait', async () => {
	// 		console.log('wait');
	// 	});
	//
	// 	it('', async () => {
	//
	// 	});
	// });
});