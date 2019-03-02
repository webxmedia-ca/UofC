/**
 * Created by valeriu.jecov on 18/10/2018.
 * NOTE: THIS TEST IS NOT YET DONE
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');
// const expect = require('chai').expect;

//temp - so I can use driver. actions in the test here
// UcLaw.init(harness.init, waitShort, waitLong);
// const driver = UofC.getAttrs().driver;
//temp - so I can use driver. actions

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
	UofC.createBasicPage(newPageValues);
	
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	UofC.addNewSection('2', '1');   //add a new section (not hero) with the 1 col layout
	
	UofC.addNewBlock('2'
	  , 'UCalgary'
	  , 'details.UCalgary-blocks li>a:not([style="display: none;"]):not([href*=text])'
	  , 'details.UCalgary-blocks:nth-child(22)>ul'
	  , 'Add Streaming Media'
	  , 'details[id*=edit-settings-teams]'
	  , 'CSM'
	  , '.layout.col1:not([class*=hero]) .streaming-media'
	);
	
	describe('save page layout', () => {
		//click Save Page Layout
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
	
	UofC.editStreamingMediaBlock('test block heading ' + Math.floor((Math.random() * 1000) + 1)
	  , 'test block description ' + Math.floor((Math.random() * 1000) + 1)
	  , 'accessibility text ' + Math.floor((Math.random() * 1000) + 1)
	  , 'caption for media ' + Math.floor((Math.random() * 1000) + 1)
	  , 'creator credit ' + Math.floor((Math.random() * 1000) + 1)
	  , 'Youtube'
	  , 'https://www.youtube.com/watch?v=jMgvnXq-s8o&list=PLGIDwNGRDzUAK78PuEgxsmDCGmym7romC'
	  , null
	  , false
	  , null
	);
	
	// describe('just wait ...................................................................', () => {
	// 	it('wait', async () => {
	// 		console.log('wait');
	// 	});
	//
	// 	it('', async () => {
	//
	// 	});
	// });
});