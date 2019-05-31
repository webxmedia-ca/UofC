/**
 * Created by valeriu.jecov on 05/10/2018.
 */

/* jshint -W024 */
/* jshint -W014 */

const expect = require('chai').expect;

const UofC = (() => {
	let driver = null
	 , By = null
	 , until = null
	 , waitShort = 2000
	 , waitLong = 5000
	 , initialized = false
	 , harnessObj = null
	 , username = ""
	 , password = ""
	 , baseUrl = ""
	 , displayName = ""
	 , env = {}
	 , browserStack = ""
	 , appName = ""
	 , failureFatal = false;
	
	const UofC = {};
	
	UofC.getAttrs = () => {
		const attrs = {};
		attrs.driver = driver;
		attrs.By = By;
		attrs.until = until;
		attrs.waitShort = waitShort;
		attrs.waitLong = waitLong;
		attrs.initialized = initialized;
		attrs.harnessObj = harnessObj;
		attrs.username = username;
		attrs.password = password;
		attrs.baseUrl = baseUrl;
		attrs.displayName = displayName;
		attrs.env = env;
		attrs.browserStack = browserStack;
		
		return attrs;
	};
	
	UofC.initBase = (harnessObjIn, waitShortIn, waitLongIn) => {
		/*
		*   description: initializes the module.
		*
		*   Parameters:
		*       harnessObjIn    - the harness object running the module
		*       waitShortIn     - the short wait internal
		*       waitLongIn      - the long wait interval
		*
		*/
		
		harnessObj = harnessObjIn;
		
		driver = harnessObj.driver;
		By = harnessObj.By;
		until = harnessObj.until;
		
		waitShort = waitShortIn ? waitShortIn : waitShort;
		waitLong = waitLongIn ? waitLongIn : waitLong;
		
		username = harnessObj.username;
		password = harnessObj.password;
		
		baseUrl = harnessObj.baseUrl;
		
		failureFatal = harnessObj.failureFatal;
		
		initialized = true;
		
		browserStack = harnessObj.browserStack;
	};
	
	UofC.init = (harnessObjIn, waitShortIn, waitLongIn) => {
		/*
		*   description: calls init base.  is overridden by other modules on inheritance
		*
		*   Parameters:
		*       harnessObjIn - the harness object running the module
		*       waitShortIn - the short wait internal
		*       waitLongIn - the long wait interval
		*
		*/
		
		UofC.initBase(harnessObjIn, waitShortIn, waitLongIn);
	};
	
	UofC.getBaseUrl = () => {
		return baseUrl;
	};
	
	UofC.setBaseUrl = (url) => {
		baseUrl = url;
	};
	
	UofC.getDisplayName = () => {
		return displayName;
	};
	
	UofC.errorHandler = (err) => {
		console.log("ErrorHandler", err);
	};
	
	UofC.afterEachTest = async (test) => {
		if (failureFatal) {
			if (test.state === 'failed') {
				console.log('\n************************************************************************************');
				console.log('--------------------------- AFTER EACH - TEST ERROR STACK --------------------------');
				console.log('test.title     : ' + test.title);
				console.log('test.state     : ' + test.state);
				console.log('test.err.stack : ' + test.err.stack);
				console.log('END: exiting after the test ' + test.state);
				console.log('------------------------------------------------------------------------------------');
				console.log('\n************************************************************************************');
				//now quit the driver & process
				await harnessObj.quit(test);
				process.exit(5);
			}
		}
	};
	
	UofC.startApp = async (overrideUrl) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will run the browser to the given URL (URL is read from the *.config.json file)
						will wait for the uofc logo to be displayed as well
						will wait for the 'Welcome *" message to be displayed as well
	
		ACCEPTED PARAMETER(S) AND VALUES:   none - all of these are gathered from the *.config.json file)
		USAGE:  UofC.startApp();
		----------------------------------------------------------------------------------------------------------------- */
		if (!initialized) {
			console.log('UofCApp not initialized!: Please make a call to init prior to trying to use module.');
			throw "Not Initialized";
		}
		
		await driver.manage().window().maximize();
		
		let url = "";
		if (overrideUrl) {
			url = overrideUrl + '/';
		} else {
			url = baseUrl + '/';
		}
		
		//run the browser to the specific url
		await driver.get(url);
		
		// this is a temporary bug - on the login page only (not on .../user)
		// steps: find the error message box & if exists then close the error message
		/*// const errorBoxElements = await driver.findElements(By.css('.messages error'));
		// if(errorBoxElements.length > 0) {
		// 	console.warn('the error message on the main page is still displayed, closing it');
		// 	await UofC.clickElementByCSS('.message-close');
		// }*/
		
		// wait for the UofC logo to be displayed
		await UofC.waitForObjectLoad('.uc-logo img', waitLong, 1000, true);
		await UofC.waitForObjectLoad('a[title*=\'Welcome\']', waitShort, 500, true);
		
		//close the cookies section too?!
		await UofC.clickElementByCSS('.eu-cookie-compliance-default-button');
		
		console.log('---> run browser: application successfully started, the loaded url is "' + url + '"');
	};
	
	UofC.login = async () => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will click the "local login" tab
						will type the username and password (from the *.config.json file)
						will click the "Login" button and wait for the page to load
						will wait for the Disclaimer popup and hit on the "Agree" button
						will wait for the default page to load (check for navbar & display name to be displayed/loaded)
	
		ACCEPTED PARAMETER(S) AND VALUES:   none - all of these are gathered from the *.config.json file)
		USAGE:  UofC.login();
		----------------------------------------------------------------------------------------------------------------- */
		// if (harnessObj.getUserRole() === 'siteadmin') {
		// select the 'Local login' option
		await UofC.clickElementByCSS('.user-login-form ul>li.last>a');
		await driver.sleep(500);
		
		//1. find the fields & type the login name & password
		await UofC.setTextFieldValueByCSS('#edit-name', username);
		await UofC.setTextFieldValueByCSS('#edit-pass', password);
		
		//2. click Log In button
		await UofC.clickElementByCSS('#edit-submit');
		
		//3. wait for the admin toolbars to load --- user is logged in
		await UofC.waitForObjectLoad('#toolbar-administration', waitShort, 500, true);
		await UofC.waitForObjectLoad('.toolbar-bar', waitShort, 100, true);
		await UofC.waitForObjectLoad('.toolbar-menu-administration', waitShort, 100, true);
		
		// validate user name is displayed within the header and in the page's title
		let pageTitle = await driver.getTitle();
		// console.log('pageTitle: ' + pageTitle);
		expect(pageTitle.toLowerCase()).to.contain(harnessObj.getUserRole().toLowerCase()); //assure that user role is displayed in the title
		
		let headerElement = await driver.findElement(By.css('#toolbar-item-user')); //.toolbar-tab>a[class*=icon-user]
		let headerElementText = await headerElement.getText();
		// console.log('headerElementText: ' + headerElementText);
		//assure that user role is displayed in the title
		expect(headerElementText.toLowerCase()).to.equal(harnessObj.getUserRole().toLowerCase());
		
		// //hide the ^ arrow (navigate to top)
		// await UofC.hideElementByCSS('.insightera-tab-container');
		
		console.log('---> login: successfully logged in as ' + harnessObj.getUserRole() + '\n');
		//LOGIN DONE
		// }
		
		/*
		// store the value of the "display name"
		element = await driver.findElement(By.css('.header-user-info label'));
		await driver.wait(until.elementIsVisible(element), waitShort);
		const text = await element.getText();
		displayName = text.slice(9, text.indexOf('!'));
		*/
	};
	
	UofC.logout = async () => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will log the user out of the system
	
		ACCEPTED PARAMETER(S) AND VALUES:   none - all of these are gathered from the *.config.json file)
		USAGE:  UofC.logout();
		----------------------------------------------------------------------------------------------------------------- */
		// await driver.findElement(By.css('a[class*=tools-help]'));
		
		await UofC.waitForObjectLoad('a[class*=tools-help]', waitLong, 500, true);
		await UofC.mouseHover('a[class*=tools-help]');
		driver.sleep(500);
		
		const logOutElement = await driver.findElement(By.css('a[class*=tools-help]'));
		await UofC.clickElementByCSS('a[class*=logout]');
		//TODO: Log Out BUG - uncomment the line below when the logout bug is fixed
		// await driver.wait(until.elementIsNotVisible(logOutElement), waitLong * 10);  //--to enable this when logout bug is fixed
	};
	
	UofC.navigateThroughAdminMenu = (menuName, submenuName, expectedCssLocator) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function clicks on a top menu item then a submenu link by their css locators
						then checks if expected page is loaded
	
		ACCEPTED PARAMETER(S) AND VALUES:
		menuCssLocator:     the css locator of the menu to be clicked
		subMenuCssLocator:  the css locator of the submenu to be clicked (bottom level if item is no second level)
		expectedCssLocator: the css locator of an element from the expected page to be displayed after the clicks
	
		NOTE: in case of mouse hover items use the last submenu's locator for 'subMenuCssLocator'
	
		USAGE:
		//HOME BUTTON
		UofC.clickTopMenuItems('Home', null, '#workspaceOverduePanelHeading1');
	
		//ASSESSMENT MENU -> Initiate
		UofC.clickTopMenuItems('Assessment', 'Initiate', '#initiateInspectionPanelHeading');
		//ASSESSMENT MENU -> Tour Exports
		UofC.clickTopMenuItems('Assessment', 'Tour Exports', '#TourExportPanelHeading');
		//STATEMENT OF CONCERN MENU
		UofC.clickTopMenuItems('Statement of Concern', null, '??????????????????????????');
		//INITIATE MENU (no id available for this one) -> New Application
		UofC.clickTopMenuItems('Initiate', 'New Application', '.pipeline-container');
		//CONSTRUCT MENU -> Water Code of Practice
		UofC.clickTopMenuItems('Construct', 'Water Code of Practice', '#codeOfPracticePanelHeading');
		//CONSTRUCT MENU -> Tour Submission
		UofC.clickTopMenuItems('Construct', 'Tour Submission', '#AuthorizationSearchPanelHeading');
		//CONSTRUCT MENU -> Notification -> Pipeline -> New Line
		UofC.clickTopMenuItems('Construct', 'New Line', '#newNotificationPanelHeading');
		//CONSTRUCT MENU -> Notification -> Pipeline -> Liner Installation
		UofC.clickTopMenuItems('Construct', 'Liner Installation', '#newNotificationPanelHeading');
		//CONSTRUCT MENU -> Notification -> Pipeline -> Liner Test
		UofC.clickTopMenuItems('Construct', 'Line Test', '#newNotificationPanelHeading');
		//OPERATE MENU -> Authorization Amendment
		UofC.clickTopMenuItems('Operate', 'Authorization Amendment', '#contactInformationPanelHeading');
		//OPERATE MENU -> Notification -> Flaring
		UofC.clickTopMenuItems('Operate', 'Flaring', '#newSubmissionPanelHeading');
		//OPERATE MENU -> Notification -> Venting
		UofC.clickTopMenuItems('Operate', 'Venting', '#newSubmissionPanelHeading');
		//CLOSE MENU -> Reclamation
		UofC.clickTopMenuItems('Close', 'Reclamation', '.row.aer-workspace ol .active');
		----------------------------------------------------------------------------------------------------------------- */
		it('show site administration toolbar menu', async () => {
			//check if admin toolbar is displayed
			const adminToolbarElements = await UofC.findElementsByCSS('#toolbar-item-administration-tray.is-active');
			if (adminToolbarElements.length === 0) {
				await UofC.clickElementByCSS('#toolbar-item-administration');
			}
		});
		let topMenuAction = 'click';
		if (submenuName) {
			topMenuAction = 'mouse hover'
		}
		it(topMenuAction + ' the ' + menuName + ' menu', async () => {
			//click top level menu
			switch (menuName) {
				case 'AdminTools':
					if (submenuName) {
						await UofC.mouseHover('a[class*=toolbar-tools-help]');  //mouse hover top menu -> Admin Tools
					} else {
						await clickTopMenuItem('a[class*=toolbar-tools-help]'); //click top menu -> Admin Tools
					}
					break;
				case 'Content':
					if (submenuName) {
						await UofC.mouseHover('a[class*=admin-content]');
						await driver.sleep(300);
					} else {
						await clickTopMenuItem('a[class*=admin-content]');
					}
					break;
				case 'Structure':
					if (submenuName) {
						await UofC.mouseHover('a[class*=admin-structure]');
					} else {
						await clickTopMenuItem('a[class*=admin-structure]');
					}
					break;
				case 'Appearance':
					if (submenuName) {
						await UofC.mouseHover('a[class*=themes-page]');
					} else {
						await clickTopMenuItem('a[class*=themes-page]');
					}
					break;
				case 'Extend':
					if (submenuName) {
						await UofC.mouseHover('a[class*=modules-list]');
					} else {
						await clickTopMenuItem('a[class*=modules-list]');
					}
					break;
				case 'Configuration':
					if (submenuName) {
						await UofC.mouseHover('a[class*=toolbar-icon-system-admin-config]:not([class*=config-])');
					} else {
						await clickTopMenuItem('a[class*=toolbar-icon-system-admin-config]:not([class*=config-])');
					}
					break;
				case 'Teams':
					if (submenuName) {
						await UofC.mouseHover('a[class*=microsession-index]');
					} else {
						await clickTopMenuItem('a[class*=microsession-index]');
					}
					break;
				case 'People':
					if (submenuName) {
						await UofC.mouseHover('a[class*=user-collection]');
					} else {
						await clickTopMenuItem('a[class*=user-collection]');
					}
					break;
				case 'Reports':
					if (submenuName) {
						await UofC.mouseHover('a[class*=admin-reports]');
					} else {
						await clickTopMenuItem('a[class*=admin-reports]');
					}
					break;
				case 'Help':
					await clickTopSubMenuItem('a[class*=help-main]');
					break;
				case 'UploadFile':
					await clickTopSubMenuItem('a[class*=imce-page]');
					break;
				default:
					break;
			}
		});
		
		if (submenuName) {
			//handle submenus with multiple levels
			it('click the ' + submenuName + ' submenu', async () => {
				switch (submenuName) {
				 //AdminTools -> Index - click 2nd lvl sub-menu
					case 'Index':
						//mouse hover top menu -> Admin Tools
						await UofC.mouseHover('a[class*=toolbar-tools-help]');
						//click 2nd lvl sub-menu
						await clickTopSubMenuItem('a[class*=system-admin-index]');
						break;
				 //AdminTools -> Flush all caches
					case 'FlushCSSAndJavaScript':
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-cssjs]');
						break;
					case 'FlushPluginsCache':
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-plugin]');
						break;
					case 'FlushRenderCache':
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=flush-rendercache]');
						break;
					case 'FlushRoutingAndLinksCache':
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=flush-menu]');
						break;
					case 'FlushStaticCache':
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=flush-static]');
						break;
					case 'FlushTwigCache'://mouse hover top menu -> Admin Tools
						await UofC.mouseHover('a[class*=toolbar-tools-help]');
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=flush-twig]');
						break;
					case 'FlushViewsCache':
						//mouse hover 2nd lvl sub-menu -> Flush all caches
						await UofC.mouseHover('a[class*=tools-flush]:not([class*=flush-])');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=flush-views]');
						break;
				 //AdminTools -> Development
					case 'DevelSettings':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-admin-settings]');//a[class*=tools-devel-configs-list]
						break;
					case 'ConfigEditor':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-configs-list]');
						break;
					case 'EntityInfo':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-entity-info]');
						break;
					case 'ExecutePHPCode':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-execute-php]');
						break;
					case 'FormAPIFieldTypes':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-elements-page]');
						break;
					case 'RebuildMenu':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-menu-rebuild]');
						break;
					case 'ReinstallModules':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-reinstall]');
						break;
					case 'SessionViewer':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-session]');
						break;
					case 'StateEditor':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-state-system-page]');
						break;
					case 'ThemeRegistry':
						//mouse hover 2nd lvl sub-menu -> Development
						await UofC.mouseHover('a[class*=admin-development]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-devel-theme-registry]');
						break;
				 //AdminTools -> Run cron - click 2nd lvl sub-menu
					case 'RunCron':
						//click 2nd lvl sub-menu
						await clickTopSubMenuItem('a[class*=system-run-cron]');
						break;
				 //AdminTools -> Run updates - click 2nd lvl sub-menu
					case 'RunUpdates':
						//click 2nd lvl sub-menu
						await clickTopSubMenuItem('a[class*=db-update]');
						break;
				 //AdminTools -> Drupal.org
					case 'ChangeRecordsForDrupalCore':
						//mouse hover 2nd lvl sub-menu -> Drupal.org
						await UofC.mouseHover('a[class*=drupalorg]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-listchanges]');
						break;
					case 'D8APIDocumentation':
						//mouse hover 2nd lvl sub-menu -> Drupal.org
						await UofC.mouseHover('a[class*=drupalorg]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=tools-doc]');
						break;
				 //Content -> Add content
					case 'Article':
						//mouse hover 2nd lvl sub-menu -> Add content
						await UofC.mouseHover('a[class*=add-content]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=add-article]');
						break;
					case 'BasicPage':
						//mouse hover 2nd lvl sub-menu -> Add content
						await UofC.mouseHover('a[class*=add-content]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=node-add-page]');
						break;
					case 'EventLandingPage':
						//mouse hover 2nd lvl sub-menu -> Add content
						await UofC.mouseHover('a[class*=add-content]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=add-ucws]');  //OR: a[class*=event-landing-page]:not([class*=entity]
						break;
				 //Content -> Add media
					case 'Audio':
						//mouse hover 2nd lvl sub-menu -> Add media
						await UofC.mouseHover('a[class*=add-media]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=add-audio]');
						break;
					case 'File':
						//mouse hover 2nd lvl sub-menu -> Add media
						await UofC.mouseHover('a[class*=add-media]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=add-file]');
						break;
					case 'Image':
						//mouse hover 2nd lvl sub-menu -> Add media
						await UofC.mouseHover('a[class*=add-media]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=add-image]');
						break;
					case 'Video':
						//mouse hover 2nd lvl sub-menu -> Add media
						await UofC.mouseHover('a[class*=add-media]');
						//click 3rd lvl sub-menu
						await clickTopSubMenuItem('a[class*=add-video]');
						break;
				 //Content -> Comments - click 2nd lvl sub-menu
					case 'Comments':
						await clickTopSubMenuItem('a[class*=comment-admin]');
						break;
				 //Content -> Files - click 2nd lvl sub-menu
					case 'Files':
						await clickTopSubMenuItem('a[class*=view-files]');
						break;
				 
				 ////MORE TO BE ADDED (Structure / Appearance / Extend / Configuration /... etc submenus)
					default:
						break;
				}
			});
		}
		
		//check if there are no issues / errors displayed after clicking a menu/submenu item
		// UofC.checkErrorsExist(false);
		
		const clickTopMenuItem = async (menuCssLocator) => {
			await driver.findElement(By.css(menuCssLocator));
			await UofC.clickElementByCSS(menuCssLocator);
		};
		
		const clickTopSubMenuItem = async (subMenuCssLocator) => {
			await driver.sleep(300);
			await driver.findElement(By.css(subMenuCssLocator));
			await UofC.clickElementByCSS(subMenuCssLocator);
		};
		
		//wait for returned object
		it('"' + expectedCssLocator + '" object displayed', async () => {
			await UofC.waitForObjectLoad(expectedCssLocator, waitLong, 500, true);
		});
	};
	
	UofC.expandCollapseAccordionItemByName = (itemName, expandItem, expectedCssLocator) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find the itemTitle accordion item / menu within the given div wrapper selector
						then it will click on it to check or uncheck it based on the selectItem parameter
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:       #edit-status-value      - the css identifier of the check box
		selectItem:     true / false            - tell it if we want to check or uncheck the box
	
		USAGE:  UcLaw.expandCollapseAccordionItemByName('MENU SETTINGS', true, '#edit-menu-enabled');
				UcLaw.expandCollapseAccordionItemByName('URL PATH SETTINGS', true, '#edit-path-0-pathauto');
				UcLaw.expandCollapseAccordionItemByName('AUTHORING INFORMATION', true, '#edit-created-wrapper>h4');
				UcLaw.expandCollapseAccordionItemByName('TEAMS', true, '#edit-teams-teams-1');
				UcLaw.expandCollapseAccordionItemByName('TEAMS', true, 'div[class*="form-item-teams-teams-1"]');
		------------------------------------------------------------------------------------------------------------- */
		it('click on ' + itemName + ' accordion menu to expand ' + expandItem, async () => {
			//check if accordion items exist
			const accordionItems = await UofC.findElementsByCSS('details[class*=-form]:not([style*=display]) summary');
			if (accordionItems.length > 0) {
				const accordionItemsCounter = accordionItems.length;
				
				for (let i = 0; i < 30; i++) {
					// get item's i text
					const accordionTitleItem = await accordionItems[i].getText();
					
					if (accordionTitleItem === itemName) {
						//bring the element to the screen / scroll it into the visible area
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', accordionItems[i]);
						//check if it is expanded
						let accordionItemExpanded = await accordionItems[i].getAttribute('aria-expanded');
						//console.log('accordion item ' + itemName + ' is expanded ' + accordionItemExpanded);
						
						//check if accordion item is expanded and skip or expand based on condition
						if (expandItem === true && accordionItemExpanded === 'false') {
							await accordionItems[i].click();    //expand
						} else if (expandItem === false && accordionItemExpanded === 'true') {
							await accordionItems[i].click();    //collapse
						}
						
						//after clicking, wait to expand/collapse section
						await driver.sleep(500);
						
						//validate that the section is expanded or collapsed based on the actions above
						accordionItemExpanded = await accordionItems[i].getAttribute('aria-expanded');
						//console.log('\naccordionItemExpanded: ' + accordionItemExpanded + '\n');
						if (accordionItemExpanded !== expandItem.toString()) {
							throw 'expanding ' + itemName + ' ' + expandItem + ' failed, expected: ' +
							expandItem + ' / actual: ' + accordionItemExpanded;
						}
						
						//check if the expected locator is displayed (is truthy or falsy)
						if (expectedCssLocator) {
							await UofC.waitForObjectLoad(expectedCssLocator, waitLong * 2, 100, true);
						}
						
						//end the loop
						i = 100;
						break;
					} else if (i === accordionItemsCounter && accordionTitleItem !== itemName) {
						throw 'accordion item ' + itemName + ' not found';
					}
				}
			} else {
				throw 'no accordion menus were found on this page';
			}
		});
	};
	
	UofC.selectMultipleCheckboxesInAGroup = (checkBoxesGroupLocator, itemsToSelect) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find the checkboxes groups object by checkBoxesGroupLocator selector
						then it check all the checkboxes included within the itemsToSelect parameter
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:       #edit-teams-teams       - the css identifier of the check box
		selectItem:     "Careers,Students"      - the list of checkboxes you want to click, single or multiple (divided by ,)
	
		USAGE:  UcLaw.selectMultipleCheckboxesInAGroup('#edit-teams-teams', "Careers,Students");
		------------------------------------------------------------------------------------------------------------- */
		itemsToSelect = itemsToSelect.split(',');   //split the items and put them into an array
		it('select the "' + itemsToSelect + '" checkbox(es)', async () => {
			//checkBoxesGroupLocator    =>  #rqmtTwoCheckBoxGroupControlTypes input
			//checkBoxesCounter         =>  checkboxesGroupLocator
			// #edit-teams-teams
			// #edit-teams-teams div:nth-child(1) input
			// #edit-teams-teams div:nth-child(1) label
			
			//find the checkboxes and count them
			const checkBoxElements = await driver.findElements(By.css(checkBoxesGroupLocator + ' input'));
			const checkboxesCounter = checkBoxElements.length;
			
			if (checkboxesCounter > 0) {
				let checkBoxElement, checkBoxLabelElement, checkBoxLabelElementText, checkBoxIsChecked;
				
				//for each element in the itemsToSelect array (from json)
				for (let i = 0; i < itemsToSelect.length; i++) {
					//go through each app's checkbox's label & retrieve its value
					for (let j = 0; j < 100; j++) {
						// start at 1 because 0 does not exist, also 1 is another label (section's title - not checkbox) - will/should be ignored
						checkBoxLabelElement = await driver.findElement(By.css(checkBoxesGroupLocator +
						 ' div:nth-child(' + (j + 1) + ') label'));
						checkBoxLabelElementText = await checkBoxLabelElement.getText();
						// console.log('checkBoxLabelElementText #' + i + 'x' + j + ': ' + checkBoxLabelElementText);
						
						//if label's text matches required checkbox then select it
						if (checkBoxLabelElementText === itemsToSelect[i]) {
							//check if the checkbox is already checked - if true then skip
							checkBoxElement = await driver.findElement(By.css(checkBoxesGroupLocator +
							 ' div:nth-child(' + (j + 1) + ') input'));
							checkBoxIsChecked = await checkBoxElement.getAttribute('checked');
							// console.log('checkboxIsChecked#' + i + ' attribute is: ' + checkboxIsChecked);
							
							//if not checked then click on the checkbox to select it
							if (checkBoxIsChecked === null) {
								await checkBoxElement.click();
								driver.sleep(100);
							}
							
							//exit the j loop when reaching the last application's checkbox matching the array
							j = 100;
							break;
						} else if (i === (itemsToSelect.length - 1) && j === (checkboxesCounter - 1) &&
						 checkBoxLabelElementText !== itemsToSelect[i]) {
							throw 'checkbox ' + itemsToSelect[i] + ' not found';
						}
					}
					
					//exit the i loop when reaching the last itemToSelect checkbox
					if (i === (itemsToSelect.length - 1)) {
						i = itemsToSelect.length;
						break;
					}
				}
			} else {
				throw 'no control type checkboxes were found';
			}
		});
	};
	
	UofC.clickLinkFromGroupByName = (linksGroupLocator, linkNameToClick, expectedCssLocator) => {
		// note the group should represent a UL with LIs > a tags inside
		it('click ' + linkNameToClick + ' link from the ' + linksGroupLocator + ' links group', async () => {
			//check the group - if the links group locator's length is undefined / not found then the if below returns true
			let groupElements = await driver.findElements(By.css(linksGroupLocator));
			//if links group element not found wait for a bit longer and check again to have it loaded
			if (!groupElements.length > 0) {
				await UofC.waitForObjectLoad(linksGroupLocator, waitLong * 3, 500, true);
				groupElements = await driver.findElements(By.css(linksGroupLocator));
			}
			
			//now it is expected to have the group of links available / found
			if (groupElements.length > 0) {
				//get the links number from inside of the group locator
				const linkElements = await driver.findElements(By.css(linksGroupLocator + ' a:not([style="display: none;"])'));
				const linkElementsCounter = linkElements.length;
				//validate there are any links inside the group locator (===> truthy)
				if (linkElementsCounter > 0) {
					//loop through the links and retrieve the text on them and if matches our link name then click it
					for (let i = 0; i < 100; i++) {
						if((await linkElements[i].getText()) === linkNameToClick) {
							await linkElements[i].click();
							await UofC.waitForPageLoad();
							//end the loop
							i = 100;
							break;
						} else if (i === linkElementsCounter && linkElements[i].getText() !== linkNameToClick) {
							throw 'the link by name ' + linkNameToClick + ' was not found within the ' +
							linksGroupLocator + ' group locator';
						}
					}
				} else {
					throw 'there are no links inside the specified group locator ' + linksGroupLocator;
				}
			} else {
				throw 'the group locator "' + linksGroupLocator + '" could not be found';
			}
			
			await UofC.waitForPageLoad();
			
			//check if the expected locator is displayed (is truthy or falsy)
			if(expectedCssLocator) {
				await UofC.waitForObjectLoad(expectedCssLocator, waitLong * 5, 500, true);
			}
		});
	};
	
	
	/* ---------------------- old framework related fnctns ---------------------- */
	UofC.waitForPageLoad = async () => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will wait until the "div.loading[style*=block]" object disappears from the screen
		NOTE: element locator was - .throbber
		ACCEPTED PARAMETER(S) AND VALUES:   N/A
		USAGE:  UofC.waitForPageLoad();
		----------------------------------------------------------------------------------------------------------------- */
		//new one - .loading - WORKS WELL
		//<div class="loading" style="display: block;"></div>
		let spinnerElements = await driver.findElements(By.css('div.loading[style*=block]'));
		if (spinnerElements.length > 0) {
			let i = 0;
			while (i < 10 && spinnerElements.length > 0) {// && elementSpinner) {
				// console.log('\n\n\nspinner found - waiting while it is there, i=' + i);
				await driver.sleep(waitLong);
				
				//check again if the spinner is still there / exists
				spinnerElements = await driver.findElements(By.css('div.loading[style*=block]'));
				
				if (spinnerElements.length === 0) {
					i = 10;
				} else if(spinnerElements > 0) {
					spinnerElements = await driver.findElements(By.css('div.loading[style*=block]'));
					i++;
					if (i === 10 && spinnerElements.length > 0) {
						console.warn('WARNING: page spinner (.loading) is not gone yet, waited ' +
						 (waitLong * 10) + ' seconds for it to disappear but it did not');
					}
				}
			}
		}
	};
	
	UofC.waitForObjectLoad = async (cssLocator, waitTimeMilliseconds, minWaitMilliseconds, isEnabled) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will wait until an object appears on the screen and is Visible & Enabled = True
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:             #subheader-container
		waitTimeMilliseconds:   60000   -> 60 seconds
		callback:               done
	
		USAGE:  await UofC.waitForObjectLoad("#subheader-container", 60000, 500, true);
		----------------------------------------------------------------------------------------------------------------- */
		if (minWaitMilliseconds) await driver.sleep(minWaitMilliseconds);
		let element = await driver.wait(until.elementLocated(By.css(cssLocator)), waitTimeMilliseconds);
		element = await driver.wait(until.elementIsVisible(element), waitTimeMilliseconds);
		if (isEnabled) {
			await driver.wait(until.elementIsEnabled(element), waitTimeMilliseconds);
		}
	};
	
	UofC.validateDisplayedTextEquals = (cssLocator, expectedTextValue) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will validate text of any element
	
		ACCEPTED PARAMETER(S) AND VALUES:
		cssLocator:         the locator of the object containing the text to be validated
		expectedTextValue:  the expected text value
	
		USAGE:  UofC.validateDisplayedTextEquals('.license-number-notice', 'Note: This Licence number will not be editable once entered.');
		----------------------------------------------------------------------------------------------------------------- */
		it('the text of "' + cssLocator + '" object equals "' + expectedTextValue + '"', async () => {
			const element = await driver.findElement(By.css(cssLocator));
			const text = await element.getText();
			expect(text.toLowerCase()).to.equal(expectedTextValue.toLowerCase());
		});
	};
	
	UofC.validateDisplayedTextContains = (cssLocator, expectedTextValue) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will validate text of any element
	
		ACCEPTED PARAMETER(S) AND VALUES:
		cssLocator:         the locator of the object containing the text to be validated
		expectedTextValue:  the expected text value
	
		USAGE:  UofC.validateDisplayedTextContains('a[href*="' + imagePreviewAndLinkLocator + '"]', imagePreviewAndLinkLocator);
		----------------------------------------------------------------------------------------------------------------- */
		it('the text of "' + cssLocator + '" object contains "' + expectedTextValue + '"', async () => {
			const element = await driver.findElement(By.css(cssLocator));
			const text = await element.getText();
			expect(text.toLowerCase()).to.contain(expectedTextValue.toLowerCase());
		});
	};
	
	UofC.checkErrorsExist = (expectedConditions, expectedErrorText) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will check if an error exists on the screen and will report based on the expectations
	
		ACCEPTED PARAMETER(S) AND VALUES:
		expectedConditions: boolean (true or false) based on if we expect and error or not
	
		USAGE:  UofC.checkErrorsExist(false); - means check there are no errors
				UofC.checkErrorsExist(true, 'some expected error); - means check there are errors
		----------------------------------------------------------------------------------------------------------------- */
		//1. check if there are any errors
		it('check if there are any errors, expected: ' + expectedConditions + (expectedErrorText ? ' -> ' +
		 expectedErrorText : ''), async () => {
			const elements = await UofC.findElementsByCSS('*[class*="error"]');    //also exist: .error && .messages.error
			if (expectedConditions === false && elements.length > 0){// || (expectedConditions === true && elements.length === 0)) {
				const element = await driver.findElement(By.css('*[class*="error"]'));
				const elementText = await element.getText();
				throw 'next error was returned by the application: "' + elementText + '"';
			} else if (expectedConditions === true && elements.length <= 0) {
				const element = await driver.findElement(By.css('*[class*="error"]'));
				const elementText = await element.getText();
				expect(elementText).to.include(expectedErrorText);
			}
		});
	};
	
	UofC.clickSave = () => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function clicks the save button and  will wait while the ".loading" object
		disappears from the screen
	
		ACCEPTED PARAMETER(S) AND VALUES:
		none
	
		USAGE:  UofC.clickSave();
		----------------------------------------------------------------------------------------------------------------- */
		it('click save', async () => {
			let saveBtnElement = await driver.findElement(By.css('*[id*=edit-submit]'));  //#edit-submit
			
			//scroll to the top of the page so the button is visible
			await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', saveBtnElement);
			await saveBtnElement.click();
			await UofC.waitForPageLoad();
		});
		//UofC.checkErrorsExist(false);
	};
	
	UofC.clickOnTabByText = (tabNameToClick, waitObjectCssLocator) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function clicks on a tab button
	
		ACCEPTED PARAMETER(S) AND VALUES:
		tabNameToClick:         "Authorization" OR "Application Details"    - any text seen in the browser located on a tab
		waitObjectCssLocator:   the css locator of an object to be waited after the click is done
		NOTE: the tabs are always <ul> with <li> and <a> containing a text - the name of the tab usually
	
		XPath Examples (code builds them like this):
			//li/a[contains(text(), 'Notification')]    //where 'Notification' is the given parameter
			//li/a[text()='Authorization']              //where 'Authorization' is the given parameter
	
		USAGE:  UofC.clickOnTabByText('Authorization', 'a[aria-controls="AuthorizationSearchPanelBody"]');
		----------------------------------------------------------------------------------------------------------------- */
		it('find the ' + tabNameToClick + ' tab and click on it', async () => {
			//checking if there are any tabs displayed (the group)
			// -> if this fails then no tabs exist (at least for the identifier below)
			//.tabs ul          -- Chris said they use this for tabs everywhere
			// await UofC.waitForObjectLoad('ul[class*=tabs]', waitLong, 500, true);
			await UofC.waitForObjectLoad('.tabs ul[class*=tabs]', waitLong, 500, true);
			
			//count the # of tabs available within the group above
			let tabElements = await UofC.findElementsByCSS('.tabs ul[class*=tabs]>li>a');
			const tabsCounter = tabElements.length;
			
			if (tabsCounter > 0) {
				//for each go and
				for (let i = 0; i < 10; i++) {
					//.nav-tabs li:nth-child(1) a
					//ul.nav-tabs>li:nth-child(1)>a
					let tabText = await tabElements[i].getText();
					let tabClass = await tabElements[i].getAttribute('class');
					let tabIsActive = false;
					
					if (tabText.includes('\n(active tab)') && tabClass.includes('active')) {
						tabIsActive = true;
						tabText = tabText.replace('\n(active tab)', '');
					}
					
					//if tab text matches & is not active then click on the element
					if (tabText === tabNameToClick && tabIsActive === true) {
						//tab name is already clicked / displayed -> skip
						i = 10;
						break;
					} else if (tabText === tabNameToClick && tabIsActive === false) {
						//tab name found but is not clicked -> click it
						//bring it to the center of the screen (scroll):
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', tabElements[i]);
						//click on the required tab
						await tabElements[i].click();
						driver.sleep(100);
						
						//verify again that the clicked element contains the 'active' class
						tabElements = await UofC.findElementsByCSS('.tabs ul[class*=tabs]>li>a');
						tabClass = await tabElements[i].getAttribute('class');
						if (tabClass.includes('active')) {
							i = 10;
							break;
						} else {
							throw 'it seems that the tab ' + tabNameToClick + ' was not clicked - it is not active but is expected to be';
						}
					} else if (i === (tabsCounter - 1) && tabText !== tabNameToClick) {
						//loop reached max tab number and needed tab name is not found -> throw error
						throw 'a tab group exists but there is no such tab as "' + tabNameToClick + '"';
					}
				}
				await UofC.waitForObjectLoad(waitObjectCssLocator, waitLong * 3, 500, true);
			} else {
				throw 'no tabs were found when expected to click on "' + tabNameToClick + '"';
			}
		});
	};
	
	
	
	// GENERAL ACTIONS:
	UofC.clickElementByCSS = async (elementCss) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for an object by given CSS Locator
						then it will wait for it to become Visible and Enabled
						then it will click on it
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:   .preset   - the css identifier for the object to be clicked - must be unique
	
		USAGE:  UofC.clickElementByCSS('.preset');
		------------------------------------------------------------------------------------------------------------- */
		await UofC.waitForObjectLoad(elementCss, waitLong, 100, true);
		await driver.wait(until.elementLocated(By.css(elementCss)), waitLong);
		const element = await driver.findElement(By.css(elementCss));
		await driver.wait(until.elementIsVisible(element), waitLong);
		await driver.wait(until.elementIsEnabled(element), waitLong);
		await element.click();
	};
	
	UofC.clickElementByXPath = async (elementXPath) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for an object by given XPath
						then it will wait for it to become Visible and Enabled
						then it will click on it
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:   .preset   - the css identifier for the object to be clicked - must be unique
	
		USAGE:  UofC.clickElementByCSS('.preset');
		----------------------------------------------------------------------------------------------------------------- */
		await driver.wait(until.elementLocated(By.xpath(elementXPath)), waitLong);
		const element = await driver.findElement(By.xpath(elementXPath));
		await driver.wait(until.elementIsVisible(element), waitLong);
		await driver.wait(until.elementIsEnabled(element), waitLong);
		await element.click();
	};
	
	UofC.mouseHover = async (elementOrCssLocator) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will mouse over an element by the given CSS Locator
	
		ACCEPTED PARAMETER(S) AND VALUES:
		cssLocator:   the css identifier of the element to mouse over
	
		USAGE:  UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle');
		----------------------------------------------------------------------------------------------------------------- */
		
		//TO REMOVE THESE WHEN OBJECT ACCEPTANCE IMPLEMENTED
		let argType = typeof elementOrCssLocator;    //string & object?!
		// console.log('argType: ' + argType);
		let elementToMouseHover;
		if (argType === 'object') {
			//new piece
			elementToMouseHover = elementOrCssLocator; //the cssLocator is a element object
		} else if (argType === 'string') {
			//default-old piece
			// const elementToMouseHover = await driver.findElement(By.css(elementOrCssLocator));
			elementToMouseHover = await driver.findElement(By.css(elementOrCssLocator));
		} else {
			throw 'no such argType available: ' + argType + ', only object or string allowed';
		}
		const actions = await driver.actions({bridge: true});
		await actions.move({duration: 5000, origin: elementToMouseHover, x: 0, y: 0}).perform();
	};
	
	UofC.setTextFieldValueByCSS = async (fieldCss, value) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for a text field by the given CSS Locator
						then it will type the given text into that text field
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:   the css identifier of the text field
		value:      the text value you want to be typed into the field
	
		USAGE:  UofC.setTextFieldValueByCSS('*[name="applicant[email]"]', 'testemail@test.com');
		------------------------------------------------------------------------------------------------------------- */
		await UofC.waitForObjectLoad(fieldCss, waitLong, 100, true);
		await driver.wait(until.elementLocated(By.css(fieldCss)), waitLong);
		const element = await driver.findElement(By.css(fieldCss));
		await driver.wait(until.elementIsVisible(element), waitShort);
		await element.clear();
		await element.sendKeys(value);
		await driver.sleep(100);
	};
	
	UofC.setSelectDropDownValueByCSS = async (cssLocator, txtValue) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find a dropdown list by the given CSS Locator
						then it will look for expected value and click it if found
						NOTE: no click will be done if the value is not found and there is no handler for that
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:   '.reason-for-sir'   - the css identifier of the dropdown
		txtValue:   "Clarification"     - the text value you want to be selected from the dropdown
					NOTE: the value should match an existing item otherwise nothing will be selected
	
		USAGE:  UofC.setSelectDropDownValueByCSS('select[name="parentCondition"]', baseSelectedParentCondition);
		------------------------------------------------------------------------------------------------------------- */
		let element = null;
		const selectDropdownValue = async (elements, i) => {
			//var elementsLength = elements.length;
			element = await driver.wait(until.elementIsVisible(elements[i]), waitShort);
			element = await driver.wait(until.elementIsEnabled(element), waitShort);
			const dropDownText = await element.getText();
			// 2. if the element matches the needed value then click on it
			if (dropDownText === txtValue) {
				await element.click();
				await driver.sleep(500);
				// i = elements.length;
				return true;
			} else {
				return false;
			}
		};
		
		//var loopsCounter = 0;
		await UofC.waitForObjectLoad(cssLocator, waitLong * 3, 100, true);
		await driver.wait(until.elementLocated(By.css(cssLocator)), waitLong);
		element = await driver.findElement(By.css(cssLocator));
		await driver.wait(until.elementIsVisible(element), waitShort);
		//bring the dropdown object to the center of the page
		await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', element);
		//1st click the dropdown object
		await element.click();
		await driver.sleep(100);
		
		//in a loop - search for the element to be selected and select it if found
		const dropDownElements = await driver.findElements(By.css(cssLocator + '>option'));
		// 1. read the values of all dropdown elements
		let dropDownElementSelected = false;
		for (let i = 0; i < dropDownElements.length; i++) {
			dropDownElementSelected = await selectDropdownValue(dropDownElements, i);
			if (dropDownElementSelected === true) {
				break;
				// console.log('item ' + txtValue + ' found and selected');
			} else if (i === dropDownElements.length - 1 && dropDownElementSelected === false) {
				throw 'could not find the ' + txtValue + ' value within the dropdown "' + cssLocator + '"';
			}
		}
	};
	
	UofC.setButtonRadioFieldValueByCSS = async (fieldCss, value) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find a radio button(s) by the given CSS Locator
						then it will click on the one matching the value - will select it
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:   '*[name="developmentType"]' - the css identifier of the text field
		value:      'TRANSMISSION PIPELINE'     - the value of the radio button you want to select
	
		USAGE:  UofC.setButtonRadioFieldValueByCSS('*[name="developmentType"]', 'TRANSMISSION PIPELINE');
		------------------------------------------------------------------------------------------------------------- */
		let element;
		const cssPath = fieldCss + "[value='" + value + "']";
		await UofC.waitForObjectLoad(cssPath, waitLong, 100, true);
		await driver.wait(until.elementLocated(By.css(cssPath)), waitLong);
		element = await driver.findElement(By.css(cssPath));
		element = await element.findElement(By.xpath('..'));
		await element.click();
		await driver.sleep(100);
	};
	
	UofC.setButtonCheckboxByCSS = async (fieldCss, selectItem) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find a checkbox by the given CSS Locator
						then it will click on it to check or uncheck it based on the selectItem parameter
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:       #edit-status-value      - the css identifier of the check box
		selectItem:     true / false            - tell it if we want to check or uncheck the box
	
		USAGE:  UofC.setButtonCheckboxByCSS('#edit-status-value', true);
		------------------------------------------------------------------------------------------------------------- */
		await UofC.waitForObjectLoad(fieldCss, waitLong, 100, true);
		await driver.wait(until.elementLocated(By.css(fieldCss)), waitLong);
		let inputElement = await driver.findElement(By.css(fieldCss));
		inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
		const elementChecked = await inputElement.getAttribute('checked');
		
		//check or uncheck the checkbox based on the selectItem parameter (true/false)
		if (selectItem === true && elementChecked === null) {
			await inputElement.click();
		} else if (selectItem === false && elementChecked !== null) {
			await inputElement.click();
		}
		
		//this piece is for those places where there is no active class added to the checkbox
		// const inputSelected = await inputElement.isSelected();
		// if (inputSelected !== true) {
		// 	await inputElement.click();
		// }
	};
	
	UofC.getElementValueByCSS = async (elementCss) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for an object by given CSS Locator
						then it will retrieve its text value
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:   '.modal-body'   - the css identifier of the object
	
		USAGE:  UofC.getElementValueByCSS('.modal-body');
		------------------------------------------------------------------------------------------------------------- */
		await driver.wait(until.elementLocated(By.css(elementCss)), waitLong);
		return await driver.findElement(By.css(elementCss)).getText();
	};
	
	UofC.findElementsByCSS = async (elementCss) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for multiple objects having the same css locator by a given CSS Locator
						then it will return these objects into an array - they can later be used for anything needed
						if no objects are found it'll return a blank array
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:   *[type="checkbox"]   - the css identifier for the checkbox objects - not necessarily unique
	
		USAGE:  UofC.findElementsByCSS('*[type="checkbox"]');
		------------------------------------------------------------------------------------------------------------- */
		return await driver.findElements(By.css(elementCss));
	};
	
	UofC.getElementsByCSS = async (elementCss) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for multiple objects having the same css locator by given CSS Locator
						then it will return these objects or time out if the elements are not found
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:   *[type="checkbox"]   - the css identifier for the checkbox objects - not necessarily unique
	
		USAGE:  UofC.getElementValueByCSS('*[type="checkbox"]');
		------------------------------------------------------------------------------------------------------------- */
		await driver.wait(until.elementLocated(By.css(elementCss)), waitLong);
		return await driver.findElements(By.css(elementCss));
	};
	
	UofC.setElementAttributeByCSS = async (elementCss, attr, value) => {
		const element = await driver.findElement(By.css(elementCss));
		await driver.executeScript("arguments[0].setAttribute('" + attr + "', '" + value + "')", element);
	};
	
	UofC.hideElementByCSS = async (elementCss) => {
		//OLD
		// const element = await driver.findElement(By.css(elementCss));
		// await driver.executeScript("arguments[0].setAttribute('style', 'display:none')", element);
		// await driver.sleep(500);
		
		//NEW REPLACEMENT
		const elements = await driver.findElements(By.css(elementCss));
		if (elements.length > 0) {
			await driver.executeScript("arguments[0].setAttribute('style', 'display:none')", elements[0]);
		// } else {
		// 	console.log('note: hide element function was called but there is no such element as ' + elementCss);
		}
	};
	
	UofC.popUpConfirmation = async (message, waitDelay) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will wait for a confirmation popup to be displayed
						will validate that the text within the popup is correct based on the given parameter
						then will close the popup
	
		ACCEPTED PARAMETER(S) AND VALUES:
		message:    "any text"
		waitDelay:  5000   - a wait time in miliseconds (5000 = 5 seconds)
	
		USAGE:  UofC.popUpConfirmation("the text to be validated", 3000);
		----------------------------------------------------------------------------------------------------------------- */
		it('warning message is displayed and it\'s text equals to "' + message + '"', async () => {
			// await UofC.waitForPageLoad();
			await UofC.waitForObjectLoad('.messages', waitDelay, 500, true);
			let text = await UofC.getElementValueByCSS('.messages:not(h2):not(button)');
			
			//now replace the numbers & blank spaces with nothing (remove them)
			text = text.replace(text.substring(0, text.lastIndexOf('\n') + 1), '').replace(/[0-9]/g, '').replace(/ /g, '');
			expect(text.toLowerCase()).to.equal(message.replace(/ /g, '').toLowerCase()); //replace blanks with nothing
			expect(text.toLowerCase()).to.contain(message.replace(/ /g, '').toLowerCase());
		});
		
		it('close the popup message dialog', async () => {
			const closePopupBtn = await driver.findElement(By.css('.messages>button'));
			await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', closePopupBtn);
			await closePopupBtn.click();
			await UofC.waitForPageLoad();
			await driver.sleep(500);
		});
	};
	
	UofC.setFileUploadByCSS = async (fieldCss, value) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find the "Attach Files..." button
						then it will find above button's input field -> *[name="fileselect[]"]
						and will insert/type the path to your file into that input and find the file
						- this will attach it
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:   #uploadAttachment *[name="fileselect[]"]'   - this is the value used usually
		value:      require('path').join(__dirname, '/attachments/SIRAttachment.pdf'), true
	
		NOTE:   before running this function please make sure that your folder and file(s) exist
		USAGE:  UofC.setFileUploadByCSS('#uploadAttachment *[name="fileselect[]"]', attachmentPath);
				UofC.setFileUploadByCSS('#uploadAttachment *[name="fileselect[]"]',
				require('path').join(__dirname, '/attachments/SIRAttachment.pdf'), true);
		------------------------------------------------------------------------------------------------------------- */
		
		//new - browserstack local uploads
		// console.log('fileUpload / image path / value: ' + value);
		let remote = require('selenium-webdriver/remote');
		await driver.setFileDetector(new remote.FileDetector);
		await driver.sleep(300);
		
		//old - the upload itself
		await driver.wait(until.elementLocated(By.css(fieldCss)), waitLong);
		const element = await driver.findElement(By.css(fieldCss));
		await element.sendKeys(value);
		await driver.sleep(waitShort);
		await UofC.waitForPageLoad();
	};
	
	
	
	/* --------- to be modified / used across UofC projects if needed -------- */
	UofC.confirmModalHeader = (headerText) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will validate the title text from a modal dialog header
	
		ACCEPTED PARAMETER(S) AND VALUES:
		headerText:   stringmouseHover
	
		USAGE:  UofC.confirmModalHeader("Header Text");
		----------------------------------------------------------------------------------------------------------------- */
		it('modal dialog appears with header text: ' + headerText, async () => {
			await UofC.waitForObjectLoad('.ui-dialog', waitShort, 500);
			const text = await UofC.getElementValueByCSS('.ui-dialog span');
			expect(text).to.equal(headerText);
		});
	};






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	UofC.setTimeFieldValueByID = async (fieldId, value) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will look for a time field by the given ID
						then it will set the value by script
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldId:   the id of the time field
		value:      the text value you want to be typed into the field
	
		USAGE:  UofC.setTimeFieldValueByCSS('id', '1200');
		------------------------------------------------------------------------------------------------------------- */
		await driver.wait(until.elementLocated(By.id(fieldId)), waitLong);
		const element = await driver.findElement(By.id(fieldId));
		await driver.wait(until.elementIsVisible(element), waitShort);
		await driver.executeScript("document.getElementById('" + fieldId + "').setAttribute('value', '" + value + "')");
	};
	
	UofC.setTypeAheadValueByCSS = async (fieldCss, value) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find a text field by the given CSS Locator
						then it will type the given text into that text field
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:   the css identifier of the text field
		value:      the text value you want to be typed into the field
	
		USAGE:  UofC.setTypeAheadValueByCSS("*[name="applicant[email]"]", "testemail@test.com");
		------------------------------------------------------------------------------------------------------------- */
		await UofC.waitForObjectLoad(fieldCss, waitLong, 100, true);
		await driver.wait(until.elementLocated(By.css(fieldCss)), waitLong);
		const element = await driver.findElement(By.css(fieldCss));
		await driver.wait(until.elementIsVisible(element), waitLong);
		await element.clear();
		await element.sendKeys(value);
		await driver.sleep(100);
	};
	
	UofC.setSelectFieldValueByCSS = async (fieldCss, txtValue) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will find a dropdown list by the given CSS Locator
						then it will type the given text into list's field
	
		ACCEPTED PARAMETER(S) AND VALUES:
		fieldCss:   '.reason-for-sir'   - the css identifier of the text field
		txtValue:   "Clarification"     - the text value you want to be selected from the dropdown
					NOTE: the value should match an existing item
	
		USAGE:  UofC.setSelectFieldValueByCSS('.reason-for-sir', 'value to be typed');
		------------------------------------------------------------------------------------------------------------- */
		await UofC.waitForObjectLoad(fieldCss, waitLong * 3, 100, true);
		await driver.wait(until.elementLocated(By.css(fieldCss)), waitLong);
		const element = await driver.findElement(By.css(fieldCss));
		await driver.wait(until.elementIsVisible(element), waitShort);
		await element.click();
		await driver.sleep(100);
		await element.sendKeys(txtValue);
		await element.sendKeys('\n');
		await driver.sleep(waitShort);
	};
	
	
	
	UofC.setBackGridSelectCheckboxes = async (elementCss, index, values) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will
						then it will
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:     .preset     - the css identifier for the object to be clicked - must be unique
		index:          1           - the index of cell to be clicked (column number, start @ 0)
		values:         1           - array of values to be clicked
	
		USAGE:  UofC.setBackGridSelect('.preset', 1, 1);
		------------------------------------------------------------------------------------------------------------- */
		let elements;
		await driver.wait(until.elementLocated(By.css(elementCss)), waitLong);
		elements = await driver.findElements(By.css(elementCss));
		await elements[index].click();
		await driver.sleep(200);
		
		const selectElement = elements[index].findElements(By.css('select'));
		selectElement[0].click();
		
		let inputElements;
		for (let i = 0; i < values.length; i++) {
			inputElements = await selectElement.findElements(By.css('input[value="' + values[i] + '"]'));
			inputElements[0].click();
		}
	};
	
	UofC.setBackGridSelectText = async (elementCss, index, selectText) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will
						then it will
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:     .preset     - the css identifier for the object to be clicked - must be unique
		index:          1           - the index of cell to be clicked
		selectText:    string       - the string of the value to be selected from the drop down
	
		USAGE:  UofC.setBackGridSelect('.preset', 1, 1);
		------------------------------------------------------------------------------------------------------------- */
		let elements;
		await driver.wait(until.elementLocated(By.css(elementCss)), waitLong);
		elements = await driver.findElements(By.css(elementCss));
		await elements[index].click();
		await driver.sleep(300);
		elements = await elements[index].findElements(By.css('select'));
		if (elements.length === 0) throw elementCss + ": no backgrid select option input found";
		await elements[0].click();
		await elements[0].sendKeys(selectText);
		await elements[0].sendKeys('\n');
	};
	
	UofC.setBackGridText = async (elementCss, index, keys) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will
						then it will
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:     .preset     - the css identifier for the object to be clicked - must be unique
		index:          1           - the index of
		key:            ?           - the ?!
	
		USAGE:  UofC.setBackGridText('.preset', 1, 1);
		------------------------------------------------------------------------------------------------------------- */
		let elements;
		await UofC.waitForObjectLoad(elementCss, waitLong, 100);
		await driver.wait(until.elementLocated(By.css(elementCss)), waitLong);
		elements = await driver.findElements(By.css(elementCss));
		await elements[index].click();
		await driver.sleep(500);
		elements = await elements[index].findElements(By.css('input'));
		if (elements.length < 1) throw elementCss + ": no backgrid text input found";
		await elements[0].clear();
		if (keys !== "") {
			await elements[0].sendKeys(keys);
			await elements[0].sendKeys('\n');
		}
	};
	
	UofC.populateGridElementValue = async (element, value) => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will
						then it will
	
		ACCEPTED PARAMETER(S) AND VALUES:
		element:    ?????????   - the ?! for the object to be clicked - must be unique
		value:      "any text"  - the value of
	
		USAGE:  UofC.populateGridElementValue(elements[i], "value to be typed");
				UofC.populateGridElementValue(elements[i], wetlandReplacementGridValuesArray[i]);
		------------------------------------------------------------------------------------------------------------- */
		await element.click();
		const element2 = await element.findElement(By.css('input'));
		await element2.clear();
		await element2.sendKeys(value);
	};
	
	
	
	return UofC;
})();

module.exports = UofC;