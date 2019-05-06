/**
 * Created by valeriu.jecov on 31/01/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-591 | https://ucalgary.atlassian.net/browse/UCWS-591
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
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
	
	describe('the "content" menu exists when contenteditor user is logged in', () => {
		//1. Content menu exists
		UofC.validateDisplayedTextEquals('a[class*=admin-content]', 'Content');
	});
	
	describe('the "structure" menu and sub-menus exist when contenteditor user is logged in', () => {
		//2. Structure menu exists
		UofC.validateDisplayedTextEquals('a[class*=admin-structure]', 'Structure');
		//mouse over the Structure menu
		it('mouse over the "structure" menu', async () => {
			await UofC.mouseHover('a[class*=admin-structure]');
		});
		it('the submenu is displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=vocabulary-collection]', waitLong, 500, true);
		});
		//check Structure's sub-menus
		UofC.validateDisplayedTextEquals('.hover-intent a[class*=vocabulary-collection]', 'Taxonomy');
	});
});