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
		await harnessObj.quit(this);
	});
	
	afterEach(async () => {
		await UofC.afterEachTest(this.ctx.currentTest);
	});
	
	//1. check Content menu and it's submenus
	describe('the "content" menu and it\'s submenus exist when contentadmin user is logged in', () => {
		//1.1. check 'Content' menu exists and has the correct text
		UofC.validateDisplayedTextEquals('a[class*=admin-content]', 'Content');
		//mouse over the Content menu
		it('mouse over the "content" menu', async () => {
			await UofC.mouseHover('a[class*=admin-content]');
		});
		//1.2. check 'Add content' submenu exists (Content menu) and has the correct text
		it('the "add content" submenu is displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=add-content]', waitLong, 500, true);
		});
		//1.3. check 'Add content' sub-menu's text
		UofC.validateDisplayedTextEquals('.hover-intent a[class*=add-content]', 'Add content');
	});
	
	//1. check Structure menu and it's submenus
	describe('the "structure" menu and it\'s submenus exist when contentadmin user is logged in', () => {
		//2.1. Structure menu exists
		UofC.validateDisplayedTextEquals('a[class*=admin-structure]', 'Structure');
		//mouse over the Structure menu
		it('mouse over the "structure" menu', async () => {
			await UofC.mouseHover('a[class*=admin-structure]');
		});
		//1.2. check 'Add content' submenu exists (Content menu) and has the correct text
		it('the "menus" submenu is displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=menu-collection]', waitLong, 500, true);
		});
		//check Structure's submenus exist: Menus / Taxonomy / Views / Menus
		UofC.validateDisplayedTextEquals('.hover-intent a[class*=menu-collection]', 'Menus');
		UofC.validateDisplayedTextEquals('.hover-intent a[class*=taxonomy]:not([class*=tags])', 'Taxonomy');
		UofC.validateDisplayedTextEquals('.hover-intent a[class*=view-collection]', 'Views');
		UofC.validateDisplayedTextEquals('.hover-intent a[class*=webform]', 'Webforms');
	});
	
	describe('the "configuration" menu exists when contentadmin user is logged in', () => {
		//3. Content menu exists
		UofC.validateDisplayedTextEquals('a[class*=admin-config]:not([class*=config-])', 'Configuration');
	});
	
	describe('the "teams" menu exists when contentadmin user is logged in', () => {
		//4. Content menu exists
		UofC.validateDisplayedTextEquals('a[class*=teams-microsession-index]', 'Teams Session');
	});
});