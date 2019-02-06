/**
 * Created by valeriu.jecov on 29/01/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-584 | https://ucalgary.atlassian.net/browse/UCWS-584
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const UofC = require('../../../lib/UofCLawApp');

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
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
	
	describe('validate the "structure" menu and sub-menus when siteadmin user is logged in', () => {
		//1. Structure menu exists
		UofC.validateDisplayedText('a[class*=admin-structure]', 'Structure');
		//mouse over the Structure menu
		it('mouse over the "structure" menu', async () => {
			await UofC.mouseHover('a[class*=admin-structure]');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=admin-display]', waitLong, 500, true);
		});
		//check Structure's sub-menus
		UofC.validateDisplayedText('.hover-intent a[class*=admin-display]', 'Block layout');
		UofC.validateDisplayedText('.hover-intent a[class*=node-type-collection]', 'Content types');
		UofC.validateDisplayedText('.hover-intent a[class*=display-mode]', 'Display modes');
		UofC.validateDisplayedText('.hover-intent a[class*=paragraphs-type-collection]', 'Paragraph types');
		UofC.validateDisplayedText('.hover-intent a[class*=conditional-field]', 'Conditional fields');
	});
	
	describe('validate the "appearance" menu and sub-menus when siteadmin user is logged in', () => {
		//2. Appearance menu exists
		UofC.validateDisplayedText('a[class*=themes-page]', 'Appearance');
		// it('validate "appearance" menu exists', async () => {
		// 	await UofC.waitForObjectLoad('a[class*=themes-page]', waitLong, 500, true);
		// });
		//mouse over the Appearance menu
		it('mouse over the "appearance" menu', async () => {
			await UofC.mouseHover('a[class*=themes-page]');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=theme-settings]', waitLong, 500, true);
		});
		//check Appearance's sub-menu exists
		UofC.validateDisplayedText('.hover-intent a[class*=theme-settings]', 'Settings');
		// it('validate "settings" sub-menu exists', async () => {
		// 	await UofC.waitForObjectLoad('.hover-intent a[class*=theme-settings]', waitLong, 500, true);
		// });
	});
	
	describe('validate the "configuration" menu and sub-menus when siteadmin user is logged in', () => {
		//3. Configuration menu exists
		UofC.validateDisplayedText('a[class*=admin-config]:not([class*=config-])', 'Configuration');
		//mouse over the Configuration menu
		it('mouse over the "configuration" menu', async () => {
			await UofC.mouseHover('a[class*=admin-config]:not([class*=config-])');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=index]', waitLong, 500, true);
		});
		//check Configuration's sub-menu exists
		UofC.validateDisplayedText('.hover-intent a[class*=index]', 'People');
		UofC.validateDisplayedText('.hover-intent a[class*=config-system]', 'System');
		UofC.validateDisplayedText('.hover-intent a[class*=content]', 'Content authoring');
		UofC.validateDisplayedText('.hover-intent a[class*=ui]', 'User interface');
		UofC.validateDisplayedText('.hover-intent a[class*=development]', 'Development');
		UofC.validateDisplayedText('.hover-intent a[class*=media]', 'Media');
		UofC.validateDisplayedText('.hover-intent a[class*=search]', 'Search and metadata');
		UofC.validateDisplayedText('.hover-intent a[class*=config-regional]', 'Regional and language');
		UofC.validateDisplayedText('.hover-intent a[class*=teams-page]', 'Teams');
		UofC.validateDisplayedText('.hover-intent a[class*=services]', 'Web services');
	});
	
	describe('validate the "people" menu and sub-menus when siteadmin user is logged in', () => {
		//4. People menu exists
		UofC.validateDisplayedText('a[class*=entity-user-collection]', 'People');
		//mouse over the People menu
		it('mouse over the "people" menu', async () => {
			await UofC.mouseHover('a[class*=entity-user-collection]');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=user-admin-create]', waitLong, 500, true);
		});
		//check People's sub-menu exists
		UofC.validateDisplayedText('.hover-intent a[class*=user-admin-create]', 'Add a new user');
	});
	
	describe('validate the "reports" menu and sub-menus when siteadmin user is logged in', () => {
		//5. Reports menu
		UofC.validateDisplayedText('a[class*=system-admin-reports]', 'Reports');
		//mouse over the Reports menu
		it('mouse over the "reports" menu', async () => {
			await UofC.mouseHover('a[class*=system-admin-reports]');
		});
		it('wait for the submenu to become displayed', async () => {
			await UofC.waitForObjectLoad('.hover-intent a[class*=overview]', waitLong, 500, true);
		});
		//check Reports' sub-menus exists
		UofC.validateDisplayedText('.hover-intent a[class*=overview]', 'Recent log messages');
		UofC.validateDisplayedText('.hover-intent a[class*=storage-config-collection]', 'Field list');
		UofC.validateDisplayedText('.hover-intent a[class*=system-status]', 'Status report');
		UofC.validateDisplayedText('.hover-intent a[class*=access-denied]', 'Top \'access denied\' errors');
		UofC.validateDisplayedText('.hover-intent a[class*=page-not-found]', 'Top \'page not found\' errors');
		UofC.validateDisplayedText('.hover-intent a[class*=search]', 'Top search phrases');
		UofC.validateDisplayedText('.hover-intent a[class*=plugins]', 'Views plugins');
	});
});