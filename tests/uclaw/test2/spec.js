/**
 * Created by valeriu.jecov on 19/11/2018.
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

describe('user: ' + harness.getCommandLineArgs().role + ' / env - ' + harness.getCommandLineArgs().env +
  ' / browserstack - ' + harness.getCommandLineArgs().browserStack, function () {
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
	
	describe('click Delete tab', () => {
		UcLaw.clickOnTabByText('Delete', 'input[value="Delete"]');
	});
	
	describe('describe: a group of steps within the test2', () => {
		it('it: a step in the test2', async () => {
		
		});
		
		it('it: another step in the test2', async () => {
		
		});
		
		it('it: another step in the test2', async () => {
		
		});
	});
});