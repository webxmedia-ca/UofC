/**
 * Created by valeriu.jecov on 21/01/2019.
 * NOTE: THIS TEST IS DONE
 * MANUAL TEST: UCWS-574 | https://ucalgary.atlassian.net/browse/UCWS-574
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');
const expect = require('chai').expect;

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
  ') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	let driver = null;
	let By = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
		await UofC.startApp();
		await UofC.login();
		driver = harnessObj.driver;
		By = harnessObj.By;
	});
	
	after(async () => {
		await harnessObj.quit(this);
	});
	
	afterEach(async () => {
		await UofC.afterEachTest(this.ctx.currentTest);
	});
	
	//reading json data files and preparing the required variables for later usage
	const dataJsonFilePath = require('path').join(__dirname, '../../../config/' +
	  harness.getCommandLineArgs().env + '.config.json');
	let userName, userPass, pageTitle, headerElement, headerElementText;
	
	//siteadmin user
	describe('login as siteadmin user', () => {
		it('siteadmin validations done as default (through 1st app load & login)', async () => {
			// console.log('siteadmin login validated');
		});
	});
	
	//support user
	describe('logout and re-login as support user', () => {
		it('logout', async () => {
			await UofC.logout();
		});
		
		it('reload the login page and validate the welcome message', async () => {
			//re-run the baseUrl (project's url)- login page
			await driver.get(harnessObj.baseUrl);
			
			// wait for the UofC logo to be displayed
			await UofC.waitForObjectLoad('.uc-logo img', waitLong, 1000, true);
			await UofC.waitForObjectLoad('a[title*=Welcome]', waitShort, 500, true);
		});
		
		UofC.validateDisplayedTextEquals('a[title*=Welcome]', 'Welcome to the University Web System');
		
		it('choose local login tab', async () => {
			// select the 'Local login' option
			await UofC.clickElementByCSS('.user-login-form ul>li.last>a');
		});
		
		it('type username & password to login as support user', async () => {
			//retrieve the value from the JSON file:
			userName = new HarnessJson(dataJsonFilePath).getJsonData().support.credentials.username;
			userPass = new HarnessJson(dataJsonFilePath).getJsonData().support.credentials.password;
			
			//1. find the fields & type the login name & password
			await UofC.setTextFieldValueByCSS('#edit-name', userName);
			await UofC.setTextFieldValueByCSS('#edit-pass', userPass);
			
			//2. click Log In button
			await UofC.clickElementByCSS('#edit-submit');
			
			//3. wait for the admin toolbars to load --- user is logged in
			await UofC.waitForObjectLoad('#toolbar-administration', waitShort, 500, true);
			await UofC.waitForObjectLoad('.toolbar-bar', waitShort, 100, true);
			await UofC.waitForObjectLoad('.toolbar-menu-administration', waitShort, 100, true);
		});
		
		it('validate that page\'s title contains user\'s role', async () => {
			pageTitle = await driver.getTitle();
			expect(pageTitle).to.contain(userName); //assure that user role is displayed in the title
		});
		
		it('validate that page\'s header equals user\'s name', async () => {
			headerElement = await driver.findElement(By.css('#toolbar-item-user')); //.toolbar-tab>a[class*=icon-user]
			headerElementText = await headerElement.getText();
			//assure that user role is displayed in the title
			expect(headerElementText).to.equal(userName);
		});
	});
	
	//contentadmin user
	describe('logout and re-login as contentadmin user', () => {
		it('logout', async () => {
			await UofC.logout();
		});
		
		it('reload the login page and validate the welcome message', async () => {
			//re-run the baseUrl (project's url)- login page
			await driver.get(harnessObj.baseUrl);
			
			// wait for the UofC logo to be displayed
			await UofC.waitForObjectLoad('.uc-logo img', waitLong, 1000, true);
			await UofC.waitForObjectLoad('a[title*=Welcome]', waitShort, 500, true);
		});
		
		UofC.validateDisplayedTextEquals('a[title*=Welcome]', 'Welcome to the University Web System');
		
		it('choose local login tab', async () => {
			// select the 'Local login' option
			await UofC.clickElementByCSS('.user-login-form ul>li.last>a');
		});
		
		it('type username & password to login as contentadmin user', async () => {
			//retrieve the value from the JSON file:
			userName = new HarnessJson(dataJsonFilePath).getJsonData().contentadmin.credentials.username;
			userPass = new HarnessJson(dataJsonFilePath).getJsonData().contentadmin.credentials.password;
			
			//1. find the fields & type the login name & password
			await UofC.setTextFieldValueByCSS('#edit-name', userName);
			await UofC.setTextFieldValueByCSS('#edit-pass', userPass);
			
			//2. click Log In button
			await UofC.clickElementByCSS('#edit-submit');
			
			//3. wait for the admin toolbars to load --- user is logged in
			await UofC.waitForObjectLoad('#toolbar-administration', waitShort, 500, true);
			await UofC.waitForObjectLoad('.toolbar-bar', waitShort, 100, true);
			await UofC.waitForObjectLoad('.toolbar-menu-administration', waitShort, 100, true);
		});
		
		it('validate that page\'s title contains user\'s role', async () => {
			pageTitle = await driver.getTitle();
			expect(pageTitle).to.contain(userName); //assure that user role is displayed in the title
		});
		
		it('validate that page\'s header equals user\'s name', async () => {
			headerElement = await driver.findElement(By.css('#toolbar-item-user')); //.toolbar-tab>a[class*=icon-user]
			headerElementText = await headerElement.getText();
			//assure that user role is displayed in the title
			expect(headerElementText).to.equal(userName);
		});
	});
	
	//contenteditor user
	describe('logout and re-login as contenteditor user', () => {
		it('logout', async () => {
			await UofC.logout();
		});
		
		it('reload the login page and validate the welcome message', async () => {
			//re-run the baseUrl (project's url)- login page
			await driver.get(harnessObj.baseUrl);
			
			// wait for the UofC logo to be displayed
			await UofC.waitForObjectLoad('.uc-logo img', waitLong, 1000, true);
			await UofC.waitForObjectLoad('a[title*=Welcome]', waitShort, 500, true);
		});
		
		UofC.validateDisplayedTextEquals('a[title*=Welcome]', 'Welcome to the University Web System');
		
		it('choose local login tab', async () => {
			// select the 'Local login' option
			await UofC.clickElementByCSS('.user-login-form ul>li.last>a');
		});
		
		it('type username & password to login as contenteditor user', async () => {
			//retrieve the value from the JSON file:
			userName = new HarnessJson(dataJsonFilePath).getJsonData().contenteditor.credentials.username;
			userPass = new HarnessJson(dataJsonFilePath).getJsonData().contenteditor.credentials.password;
			
			//1. find the fields & type the login name & password
			await UofC.setTextFieldValueByCSS('#edit-name', userName);
			await UofC.setTextFieldValueByCSS('#edit-pass', userPass);
			
			//2. click Log In button
			await UofC.clickElementByCSS('#edit-submit');
			
			//3. wait for the admin toolbars to load --- user is logged in
			await UofC.waitForObjectLoad('#toolbar-administration', waitShort, 500, true);
			await UofC.waitForObjectLoad('.toolbar-bar', waitShort, 100, true);
			await UofC.waitForObjectLoad('.toolbar-menu-administration', waitShort, 100, true);
		});
		
		it('validate that page\'s title contains user\'s role', async () => {
			pageTitle = await driver.getTitle();
			expect(pageTitle).to.contain(userName); //assure that user role is displayed in the title
		});
		
		it('validate that page\'s header equals user\'s name', async () => {
			headerElement = await driver.findElement(By.css('#toolbar-item-user')); //.toolbar-tab>a[class*=icon-user]
			headerElementText = await headerElement.getText();
			//assure that user role is displayed in the title
			expect(headerElementText).to.equal(userName);
		});
	});
});