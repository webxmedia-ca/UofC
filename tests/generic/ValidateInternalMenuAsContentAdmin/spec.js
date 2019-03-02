/**
 * Created by valeriu.jecov on 31/01/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-592 | https://ucalgary.atlassian.net/browse/UCWS-592
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
		await harnessObj.quit();
	});
	
	afterEach(async () => {
		await UofC.afterEachTest(this.ctx.currentTest);
		await UofC.afterEachTest(this.ctx.currentTest.title);
		await UofC.afterEachTest(this.ctx.currentTest.state);
	});
	
	describe('validate the "content" menu exists when contentadmin user is logged in', () => {
		//1. Content menu exists
		UofC.validateDisplayedText('a[class*=admin-content]', 'Content');
		//mouse over the Content menu
		it('mouse over the "content" menu', async () => {
			await UofC.mouseHover('a[class*=admin-content]');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=add-content]', waitLong, 500, true);
		});
		//check Structure's sub-menus
		UofC.validateDisplayedText('.hover-intent a[class*=add-content]', 'Add content');
	});
	
	describe('validate the "structure" menu and sub-menus when contentadmin user is logged in', () => {
		//2. Structure menu exists
		UofC.validateDisplayedText('a[class*=admin-structure]', 'Structure');
		//mouse over the Structure menu
		it('mouse over the "structure" menu', async () => {
			await UofC.mouseHover('a[class*=admin-structure]');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=menu-collection]', waitLong, 500, true);
		});
		//check Structure's sub-menus
		UofC.validateDisplayedText('.hover-intent a[class*=menu-collection]', 'Menus');
		UofC.validateDisplayedText('.hover-intent a[class*=taxonomy]:not([class*=tags])', 'Taxonomy');
		UofC.validateDisplayedText('.hover-intent a[class*=view-collection]', 'Views');
	});
	
	describe('validate the "configuration" menu exists when contentadmin user is logged in', () => {
		//3. Content menu exists
		UofC.validateDisplayedText('a[class*=admin-config]:not([class*=config-])', 'Configuration');
	});
	
	describe('validate the "teams" menu exists when contentadmin user is logged in', () => {
		//4. Content menu exists
		UofC.validateDisplayedText('a[class*=teams-microsession-index]', 'Teams');
	});
});