/**
 * Created by valeriu.jecov on 6/1/2017.
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
	  // , appType = ""
	  // , appSubType = ""
	  , browserStack = ""
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
		// attrs.appType = appType;
		// attrs.appSubType = appSubType;
		attrs.browserStack = browserStack;
		
		return attrs;
	};
	
	UofC.initBase = (harnessObjIn, waitShortIn, waitLongIn) => {
		/*
		*   description: initializes the module.
		*
		*   Parameters:
		*       harnessObjIn - the harness object running the module
		*       waitShortIn - the short wait internal
		*       waitLongIn - the long wait interval
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
		// appType = harnessObj.getAppType();
		// appSubType = harnessObj.getAppSubType();
		
		failureFatal = harnessObj.failureFatal;
		
		initialized = true;
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
				console.log('---------------------------------------------------------------');
				console.log(test.err.stack);
				console.log('END: exiting after failed test');
				console.log('---------------------------------------------------------------');
				await harnessObj.quit();
				process.exit(5);
			}
		}
	};
	
	UofC.login = async (overrideUrl) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will run the browser to the given URL (URL is read from the *.config.json file)
						will type the username and password (from the *.config.json file)
						will click the "Login" button and wait for the page to load
						will wait for the Disclaimer popup and hit on the "Agree" button
						will wait for the default page to load (check for navbar & display name to be displayed/loaded)
	
		ACCEPTED PARAMETER(S) AND VALUES:   none - all of these are gathered from the *.config.json file)
		USAGE:  UofC.login(done);
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
		// await UofC.waitForPageLoad(); //-- this is not actual anymore
		
		// wait for the UofC logo to be displayed
		await UofC.waitForObjectLoad('.uc-logo img', waitLong, 500, true);
		
		//maybe we should close the cookies section too?!
		await UofC.clickElementByCSS('.eu-cookie-compliance-default-button');
		
		// this is a temporary bug - on the main page only (not on .../user)
		// steps: find the error message box & if exists then close the error message
		const errorBoxElements = await driver.findElements(By.css('.messages error'));
		if(errorBoxElements.length > 0) {
			console.warn('the error message on the main page is still displayed, closing it');
			await UofC.clickElementByCSS('.message-close');
		}
		
		if (harnessObj.getUserRole() === 'siteadmin') {     //add those extra user which have the login fncts
		                                                    //1. find the fields & type the login name & password
			await UofC.setTextFieldValueByCSS('#edit-name', username);
			await UofC.setTextFieldValueByCSS('#edit-pass', password);
			
			//2. click Log In button
			await UofC.clickElementByCSS('#edit-submit');
			
			//3. wait for the admin toolbars to load --- user is logged in
			await UofC.waitForObjectLoad('#toolbar-administration', waitShort, 500, true);
			await UofC.waitForObjectLoad('.toolbar-bar', waitShort, 100, true);
			await UofC.waitForObjectLoad('.toolbar-menu-administration', waitShort, 100, true);
			//LOGIN DONE
		}
		
		/*
		// store display name
		element = await driver.findElement(By.css('.header-user-info label'));
		await driver.wait(until.elementIsVisible(element), waitShort);
		const text = await element.getText();
		displayName = text.slice(9, text.indexOf('!'));
		*/
	};
	
	
	/* ------------------------- used by UofC framework ------------------------- */
	/* ----------------------- new UofC related functions ----------------------- */
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
		it('show site administration toolbar menu if it is hidden', async () => {
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
				  
				  /*
				  //OLD
					  //Construct -> Notification ->
					  case 'New Line':
						  //Notification submenu:
						  await UofC.mouseHover('#constructGroup>ul>li:last-child>a');
						  //Pipeline submenu:
						  await UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle');
						  await clickTopSubMenuItem('a[data-event="show:notification:new-construction"]');
						  break;
					  case 'Liner Installation':
						  //Notification submenu:
						  await UofC.mouseHover('#constructGroup>ul>li:last-child>a');
						  //Pipeline submenu:
						  await UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle');  //OR     '#constructGroup li>ul:last-child a.dropdown-toggle'
						  //Liner Installation submenu
						  await clickTopSubMenuItem('#liner-installation');
						  break;
					  case 'Line Test':
						  //Notification submenu
						  await UofC.mouseHover('#constructGroup>ul>li:last-child>a');
						  //Pipeline submenu
						  await UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle'); //OR: '#constructGroup li>ul:last-child a.dropdown-toggle'
						  //Line Test submenu
						  await clickTopSubMenuItem('#line-test');
						  break;
					  //Operate ->
					  case 'Methane Emissions':
						  await clickTopSubMenuItem('a[data-event="show:emissions:methane-emissions-manual-landing"]');
						  break;
					  case 'Benzene Emissions':
						  await clickTopSubMenuItem('a[data-event="show:emissions:benzene-emissions-manual"]');
						  break;
					  case 'Emissions Reporting':
						  //clickTopSubMenuItem('a[data-event="show:emissions:peace-river"]');
						  await clickTopSubMenuItem('a[data-event="show:emissions:reporting"]');
						  break;
					  case 'Authorization Amendment':
						  await clickTopSubMenuItem('a[data-event="show:amendment:wizard"]');  //OR: .can-create-integrated-app>a:last-child OR:
						  break;
					  
					  //Operate -> Notification
					  case 'Flaring':
						  //Flaring submenu:
						  await UofC.mouseHover('#operate-notification');
						  await clickTopSubMenuItem('a[data-event="show:notification:flaring"]');
						  break;
					  case 'Venting':
						  //Venting submenu:
						  await UofC.mouseHover('#operate-notification');
						  await clickTopSubMenuItem('a[data-event="show:notification:venting"]');
						  break;
					  //Close submenu
					  case 'New Reclamation':
						  await clickTopSubMenuItem('a[data-event="show:reccert:application"]');
						  await driver.sleep(waitShort);
						  break;
					  case 'New ESA Phase 1':
						  await clickTopSubMenuItem('a[data-event="show:reccert:esa1"]');
						  await driver.sleep(waitShort);
						  break;
					  case 'New ESA Phase 2/3':
						  await clickTopSubMenuItem('a[data-event="show:reccert:esa2"]');
						  await driver.sleep(waitShort);
						  break;
					  
					  //Close -> Area Based Closure submenu
					  case 'Proposed':
						  //Proposed submenu:
						  await UofC.mouseHover('.dropdown.industry-option:last-child>ul>li:nth-child(4)>a');
						  await clickTopSubMenuItem('a[data-id="AREA_BASED_CLOSURE_PROPOSED"]');
						  await driver.sleep(waitShort);
						  break;
					  case 'Confirmed':
						  //Confirmed submenu:
						  await UofC.mouseHover('.dropdown.industry-option:last-child>ul>li:nth-child(4)>a');
						  await clickTopSubMenuItem('a[data-id="AREA_BASED_CLOSURE_CONFIRMED"]');
						  await driver.sleep(waitShort);
						  break;
				  */
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
		it('wait for "' + expectedCssLocator + '" object to be displayed', async () => {
			// if (submenuName !== "Reclamation") {
			// 	await UofC.waitForPageLoad();
			// }
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
				UcLaw.expandCollapseAccordionItemByName('TEAMS', true, '#edit-teams-teams-3');
		------------------------------------------------------------------------------------------------------------- */
		it('click on ' + itemName + ' accordion menu to expand ' + expandItem, async () => {
			//check if accordion items exist
			const accordionItems = await UofC.findElementsByCSS('details[class*=-form]:not([style*=display]) summary');
			if (accordionItems.length > 0) {
				const accordionItemsCounter = accordionItems.length;
				
				for (let i = 0; i < 50; i++) {
					// get item i text
					const accordionTitleItem = await accordionItems[i].getText();
					
					if (accordionTitleItem) {
						if (accordionTitleItem === itemName) {
							//check if it is expanded
							let accordionItemExpanded = await accordionItems[i].getAttribute('aria-expanded');
							// console.log('accordion item ' + itemName + ' is expanded ' + accordionItemExpanded);
							
							//check if accordion item is expanded and skip or expand based on condition
							if (expandItem === true && accordionItemExpanded === 'false') {
								await accordionItems[i].click();    //expand
							} else if (expandItem === false && accordionItemExpanded === 'true') {
								await accordionItems[i].click();    //collapse
							}
							
							//wait after clicking to expand/collapse section
							driver.sleep(500);
							
							//validate that the section is expanded or collapsed
							accordionItemExpanded = await accordionItems[i].getAttribute('aria-expanded');
							// console.log('accordionItemExpanded: ' + accordionItemExpanded);
							// if (await accordionItemExpanded !== expandItem.toString()) {
							if (accordionItemExpanded !== expandItem.toString()) {
								throw 'expanding ' + itemName + ' ' + expandItem + ' failed, expected: ' +
								expandItem + ' / actual: ' + accordionItemExpanded;
							}
							
							//check if the expected locator is displayed (is truthy or falsy)
							if(expectedCssLocator) {
								await UofC.waitForObjectLoad(expectedCssLocator, waitShort * 3, 100, true);
							}
							
							//end the loop
							i = 100;
							break;
						}
					} else if (i === (accordionItemsCounter) && accordionTitleItem !== itemName) {
						throw 'accordion item ' + itemName + ' not found';
					}
					
					/*
					//this works well - disabled temporarily
					const accordionTitleItem = await driver.findElement(By.css('details[class*=-form]:nth-child(' +
						(i + 2) + ') summary'));
					
					//if matches itemTitle then
					if (accordionTitleItem && await accordionTitleItem.getText() === itemTitle) {
						//check if it is expanded
						// let accordionTitleItem = await driver.findElement(By.css('details[class*=-form]:nth-child(' + (i + 2) + ') summary'));
						
						let accordionItemExpanded = await accordionTitleItem.getAttribute('aria-expanded');
						console.log('accordion item ' + itemTitle + ' is expanded ' + accordionItemExpanded);
						
						//check if accordion item is expanded and skip or expand based on condition
						if (expandItem === true && accordionItemExpanded === 'false') {
							await accordionTitleItem.click();
						} else if (expandItem === false && accordionItemExpanded === 'true') {
							await accordionTitleItem.click();
						}
						
						//validate that the section is expanded or collapsed
						accordionItemExpanded = await accordionTitleItem.getAttribute('aria-expanded');
						if (await accordionItemExpanded !== expandItem.toString()) {
							throw 'expanding ' + itemTitle + ' ' + expandItem + ' failed, expected: ' +
							expandItem + ' / actual: ' + accordionItemExpanded;
						}
						
						//check if the expected locator is displayed (is truthy or falsy)
						if(expectedCSSLocator) {
							await UofC.waitForObjectLoad(expectedCSSLocator, waitShort, 100, true);
						}
						
						i = 10;
						break;
					} else if (i - 2 === accordionItemsCounter && accordionTitleItem.getText() !== itemTitle) {
						throw 'accordion item ' + itemTitle + ' not found';
					}
					*/
				}
			} else {
				throw 'no accordion menu found';
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
		it('select next checkbox(es) ' + itemsToSelect, async () => {
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
							throw 'checkbox ' + checkBoxLabelElementText + ' not found';
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
		it('click ' + linkNameToClick + ' link', async () => {
			//check the group
			if (await !driver.findElements(By.css(linksGroupLocator)).length) {
				//get the links number from the inside of the group locator
				const linkElementsCounter = driver.findElements(By.css(linksGroupLocator + ' a')).length;
				//validate there are any links inside the group locator (===> truthy)
				if (await !linkElementsCounter) {
					const linkElements = await driver.findElements(By.css(linksGroupLocator + ' a'));
					//loop through the links
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
			
			//check if the expected locator is displayed (is truthy or falsy)
			if(expectedCssLocator) {
				await UofC.waitForObjectLoad(expectedCssLocator, waitLong * 3, 500, true);
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
		//old one - .throbber
		/*let elementsSpinner = await driver.findElements(By.css('.ajax-progress-throbber .throbber'));
		
		if (elementsSpinner.length > 0) {
			let elementSpinner = await driver.findElement(By.css('.throbber'));
			
			while (elementsSpinner.length > 0) {
				await driver.wait(until.elementIsNotVisible(elementSpinner), (waitLong * 5));
				elementsSpinner = await driver.findElements(By.css('.ajax-progress-throbber .throbber'));
			}
		} else {
			console.warn('page spinner (.throbber) not found while expected');
		}*/
		
		//new one - .loading
		//<div class="loading" style="display: block;"></div>
		let elementsSpinner = await driver.findElements(By.css('div.loading[style*=block]'));
		if (elementsSpinner.length > 0) {
			let elementSpinner = await driver.findElement(By.css('.loading'));
			while (elementsSpinner.length > 0) {
				// console.log('spinner found - waiting while it is visible');
				await driver.wait(until.elementIsNotVisible(elementSpinner), (waitLong * 10));
				elementsSpinner = await driver.findElements(By.css('div.loading[style*=block]'));
			}
			// } else {
			// 	console.warn('page spinner (.loading) not found while expected');
		}
		
		driver.sleep(500);
	};
	
	UofC.waitForObjectLoad = async (cssLocator, waitTimeMilliseconds, minWaitMilliseconds, isEnabled) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will wait until an object appears on the screen and is Visible & Enabled = True
	
		ACCEPTED PARAMETER(S) AND VALUES:
		elementCss:             #subheader-container
		waitTimeMilliseconds:   60000   -> 60 seconds
		callback:               done
	
		USAGE:  UofC.waitForPageLoad("#subheader-container", 60000, done);
		----------------------------------------------------------------------------------------------------------------- */
		if (minWaitMilliseconds) await driver.sleep(minWaitMilliseconds);
		let element = await driver.wait(until.elementLocated(By.css(cssLocator)), waitTimeMilliseconds);
		element = await driver.wait(until.elementIsVisible(element), waitTimeMilliseconds);
		if (isEnabled) {
			await driver.wait(until.elementIsEnabled(element), waitTimeMilliseconds);
		}
	};
	
	UofC.validateDisplayedText = (cssLocator, expectedTextValue) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will validate text of any element
	
		ACCEPTED PARAMETER(S) AND VALUES:
		cssLocator:         the locator of the object containing the text to be validated
		expectedTextValue:  the expected text value
	
		USAGE:  UofC.validateDisplayedText('.license-number-notice', 'Note: This Licence number will not be editable once entered.');
		----------------------------------------------------------------------------------------------------------------- */
		it('validate the object "' + cssLocator + '" contains "' + expectedTextValue + '" text', async () => {
			const element = await driver.findElement(By.css(cssLocator));
			const text = await element.getText();
			expect(text.toLowerCase()).to.equal(expectedTextValue.toLowerCase());
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
			// let saveBtnElements = await driver.findElements(By.css('#edit-submit'));
			let saveBtnElement;
			
			if ((await driver.findElements(By.css('#edit-submit'))).length > 0) {
				saveBtnElement = await driver.findElement(By.css('#edit-submit'));
			} else {
				if ((await driver.findElements(By.css('.secondary.pagination'))).length > 0) {
					saveBtnElement = await driver.findElement(By.css('.secondary.pagination>:nth-child(1)>a'));
				}
			}
			
			//scroll to the top of the page so the button is visible
			await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', saveBtnElement);
			driver.sleep(500);
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
	
	UofC.mouseHover = async (cssLocator) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will mouse over an element by the given CSS Locator
	
		ACCEPTED PARAMETER(S) AND VALUES:
		cssLocator:   the css identifier of the element to mouse over
	
		USAGE:  UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle');
		----------------------------------------------------------------------------------------------------------------- */
		const elements = await UofC.findElementsByCSS(cssLocator);
		const actions = driver.actions({bridge: true});
		await actions.move({duration: 5000, origin: elements[0], x: 0, y: 0}).perform();
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
				i = elements.length;
				return i;
			}
		};
		
		//var loopsCounter = 0;
		await UofC.waitForObjectLoad(cssLocator, waitLong * 3, 100, true);
		await driver.wait(until.elementLocated(By.css(cssLocator)), waitLong);
		element = await driver.findElement(By.css(cssLocator));
		await driver.wait(until.elementIsVisible(element), waitShort);
		//1st click the dropdown object
		await element.click();
		await driver.sleep(100);
		
		//in a loop - search for the element to be selected and select it if found
		const dropDownElements = await driver.findElements(By.css(cssLocator + '>option'));
		// 1. read the values of all dropdown elements
		for (let i = 0; i < dropDownElements.length; i++) {
			await selectDropdownValue(dropDownElements, i);
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
		//const element = await inputElement.findElement(By.xpath('..'));
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
		const element = await driver.findElement(By.css(elementCss));
		await driver.executeScript("arguments[0].setAttribute('style', 'display:none')", element);
	};
	
	
	
	
	
	
	/* --------- to be modified / used accross UofC projects -------- */
	UofC.popUpConfirmation = async (message, waitDelay) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will wait for a confirmation popup to be displayed
						will validate that the text within the popup is correct based on the given parameter
	
		ACCEPTED PARAMETER(S) AND VALUES:
		message:    "any text"
		waitDelay:  5000   - a wait time in miliseconds (5000 = 5 seconds)
	
		USAGE:  UofC.popUpConfirmation("the text to be validated", 3000, done);
		----------------------------------------------------------------------------------------------------------------- */
		await UofC.waitForPageLoad();
		await UofC.waitForObjectLoad('.message-success .messenger-message-inner', waitDelay, 1000);
		const value = await UofC.getElementValueByCSS('.message-success .messenger-message-inner');
		expect(value).to.contain(message);
	};
	
	UofC.acceptDisclaimer = (disclaimerButtonCss, actionButtonCss) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will click on the Accept Disclaimer button
						then will click the action button based on the given parameter
	
		ACCEPTED PARAMETER(S) AND VALUES:
		disclaimerButtonCss: css for the disclaimer button to click
		actionButtonCss: css for the action button to click
	
		USAGE:  UofC.acceptDisclaimer("#disclaimer", ".agree");
		----------------------------------------------------------------------------------------------------------------- */
		it('click accept disclaimer button', async () => {
			await UofC.clickElementByCSS(disclaimerButtonCss);
			await UofC.waitForObjectLoad('.modal-body p', 10000, 500);
		});
		
		it('click ' + actionButtonCss + ' button', async () => {
			await UofC.clickElementByCSS('.modal-footer ' + actionButtonCss);
			await UofC.waitForPageLoad();
		});
	};
	
	UofC.confirmSubmission = (headerText, action) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will click the "Yes" or "No" button in a modal dialog (OK, Yes, No)
	
		ACCEPTED PARAMETER(S) AND VALUES:
		action: "yes" OR "no"   - only one of these values are accepted and will work, non capitals required
	
		USAGE:  UofC.confirmSubmission("yes");   OR  UofC.confirmSubmission("no");
		----------------------------------------------------------------------------------------------------------------- */
		UofC.confirmModalHeader(headerText);
		
		it('click ' + action + ' button', async () => {
			await UofC.clickElementByCSS('.modal-dialog .btn-' + action.toLowerCase());
			await UofC.waitForPageLoad();
		});
	};
	
	UofC.confirmAlertDialog = (confirmationText) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will validate the text from an alert dialog by given text parameter
						then will click the "Close" button to close the dialog
	
		ACCEPTED PARAMETER(S) AND VALUES:
		confirmationText:   "Thank you for your submission."
	
		USAGE:  UofC.confirmAlertDialog("Thank you for your submission.");
		----------------------------------------------------------------------------------------------------------------- */
		it('alert dialog appears with text: ' + confirmationText, async () => {
			const text = await UofC.getElementValueByCSS('.modal-body');
			expect(text).to.equal(confirmationText);
			
			const elements = await UofC.getElementsByCSS('.modal-footer .btn-close');
			elements[0].click();
		});
	};
	
	UofC.confirmModalHeader = (headerText) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will validate the title text from a modal dialog header
	
		ACCEPTED PARAMETER(S) AND VALUES:
		headerText:   string
	
		USAGE:  UofC.confirmModalHeader("Header Text");
		----------------------------------------------------------------------------------------------------------------- */
		it('modal dialog appears with header text: ' + headerText, async () => {
			await UofC.waitForObjectLoad('.modal', waitShort, 500);
			const text = await UofC.getElementValueByCSS('.modal-title');
			expect(text).to.equal(headerText);
		});
	};
	
	
	
	UofC.validateAndReport = (validateButtonCss) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function clicks the validate button and logs any validation errors
						disappears from the screen
	
		ACCEPTED PARAMETER(S) AND VALUES:
		validateButtonCss:  the css selector of the validate button
	
		USAGE:  UofC.validateAndReport('#validate-btn');
		----------------------------------------------------------------------------------------------------------------- */
		it('no validation errors exist', async () => {
			await UofC.waitForPageLoad();
			let elements = await driver.findElements(By.css(validateButtonCss));
			if (elements.length > 0) {
				await driver.wait(until.elementIsVisible(elements[0]), waitLong);
				await driver.wait(until.elementIsEnabled(elements[0]), waitLong);
				await elements[0].click();
				await UofC.waitForPageLoad();
				// this looks for the .has-error
				elements = await UofC.findElementsByCSS('.has-error .validation-text');
				if (elements.length > 0) {
					// elements = await UofC.findElementsByCSS('.has-error');
					for (let i = 0; i < elements.length; i++) {
						await logValidationMessages(elements[i]);
					}
					if (elements.length > 0) { // <-- force a failed message if validation errors exist
						await driver.sleep(1000);
						expect(elements.length).to.equal(0);
					}
				}
				// this looks for the .grid-error (mmr functionality contains this - Peace River Manual)
				elements = await UofC.findElementsByCSS('.grid-error');
				if (elements.length > 0) {
					for (let i = 0; i < elements.length; i++) {
						await logValidationMessages(elements[i]);
					}
					if (elements.length > 0) { // <-- force a failed message if validation errors exist
						await driver.sleep(1000);
						expect(elements.length).to.equal(0);
					}
				}
			}
		});
	};
	
	const logValidationMessages = async (elementIn) => {
		let elements, element, text;
		elements = await elementIn.findElements(By.css('.control-label'));
		if (elements.length > 0) {
			if (elements[0]) {
				text = await elements[0].getText();
				console.log('LABEL: ' + text);
			}
		}
		
		elements = await elementIn.findElements(By.css('.validation-text'));
		if (elements.length > 0) {
			if (elements[0]) {
				text = await elements[0].getText();
				console.log('ERROR: ' + text);
			}
		}
		
		// if (elementIn) {
		//      element = await element.findElement(By.xpath('..'));
		//     text = await elementIn.getText();
		//     console.log('ERROR: ' + text);
		// }
	};
	
	let errorMessages = '';
	const logErrorMessages = (elements, errorsCssLocator) => {
		let errorMessage = '';
		
		return new Promise(() => {
			elements.forEach(async (element) => {
				const labelElement = await element.findElement(By.css('label'));
				
				if (labelElement) {
					const labelElementText = await labelElement.getText();
					//find the error message
					const validationTextErrorElement = element.findElement(By.css(errorsCssLocator));
					if (validationTextErrorElement) {
						const validationTextErrorValue = validationTextErrorElement.getText();
						//throw 'next text validation error returned: "' + validationTextErrorValue + '"';
						errorMessage = 'label ' + labelElementText + ': ****************************************************************\nvalidation error: "' + validationTextErrorValue + '"\n';
						errorMessages = errorMessages + errorMessage;
					}
				}
			});
			
			setTimeout(() => {
				if (errorMessages.length > 0) {
					reject(errorMessages);
				} else if (errorMessages.length === 0) {
					resolve();
				}
			}, 1000);
		});
	};
	
	
	
	
	
	UofC.clickTopMenuItems = (menuName, submenuName, expectedCssLocator) => {
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
		it('click the ' + menuName + ' menu', async () => {
			//click top level menu
			switch (menuName) {
				case 'Home':
					await clickTopMenuItem('li>a[data-event="show:workspace"]');  //OR: .header-button-navigation a[data-event="show:workspace"]
					break;
				case 'Assessment':
					await clickTopMenuItem('.dropdown.internal-option>a');
					break;
				case 'Statement of Concern':
					await clickTopMenuItem('#soc-menu>a');
					break;
				case 'Initiate':
					await clickTopMenuItem('.industry-option.can-create-integrated-app>a');
					break;
				case 'Construct':
					await clickTopMenuItem('#constructTab>a');
					break;
				case 'Operate':
					await clickTopMenuItem('#operateTab>a');
					break;
				case 'Close':
					await clickTopMenuItem('.dropdown:last-child>a.dropdown-toggle'); //OR:   .dropdown.industry-option:last-child>a.dropdown-toggle
					break;
				default:
					break;
			}
		});
		
		if (submenuName) {
			//handle submenus with multiple levels
			it('click the ' + submenuName + ' submenu', async () => {
				switch (submenuName) {
				  //Assessment ->
					case 'Initiate':
						await clickTopSubMenuItem('.can-create-inspection');    //OR: 'a[data-event="show:inspection:initiate"]'
						break;
					case 'Tour Exports':
						await clickTopSubMenuItem('a[data-event="show:etour-export"]');
						break;
				  //Initiate ->
					case 'New Application':
						await clickTopSubMenuItem('a[data-event="show:application"]');
						break;
				  //Construct ->
					case 'Water Code of Practice':
						await clickTopSubMenuItem('a[data-event="show:water-cop"]');
						break;
					case 'Tour Submission':
						await clickTopSubMenuItem('#tourSubmission>a');    //OR: a[data-event="show:etour-licencesearch"]
						break;
				  //Construct -> Notification ->
					case 'New Line':
						//Notification submenu:
						await UofC.mouseHover('#constructGroup>ul>li:last-child>a');
						//Pipeline submenu:
						await UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle');  //OR '#constructGroup li>ul:last-child a.dropdown-toggle'
						//New Line submenu
						await clickTopSubMenuItem('a[data-event="show:notification:new-construction"]');
						break;
					case 'Liner Installation':
						//Notification submenu:
						await UofC.mouseHover('#constructGroup>ul>li:last-child>a');
						//Pipeline submenu:
						await UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle');  //OR     '#constructGroup li>ul:last-child a.dropdown-toggle'
						//Liner Installation submenu
						await clickTopSubMenuItem('#liner-installation');
						break;
					case 'Line Test':
						//Notification submenu
						await UofC.mouseHover('#constructGroup>ul>li:last-child>a');
						//Pipeline submenu
						await UofC.mouseHover('#constructGroup ul:last-child a.dropdown-toggle'); //OR: '#constructGroup li>ul:last-child a.dropdown-toggle'
						//Line Test submenu
						await clickTopSubMenuItem('#line-test');
						break;
				  //Operate ->
					case 'Methane Emissions':
						await clickTopSubMenuItem('a[data-event="show:emissions:methane-emissions-manual-landing"]');
						break;
					case 'Benzene Emissions':
						await clickTopSubMenuItem('a[data-event="show:emissions:benzene-emissions-manual"]');
						break;
					case 'Emissions Reporting':
						//clickTopSubMenuItem('a[data-event="show:emissions:peace-river"]');
						await clickTopSubMenuItem('a[data-event="show:emissions:reporting"]');
						break;
					case 'Authorization Amendment':
						await clickTopSubMenuItem('a[data-event="show:amendment:wizard"]');  //OR: .can-create-integrated-app>a:last-child OR:
						break;
				  
				  //Operate -> Notification
					case 'Flaring':
						//Flaring submenu:
						await UofC.mouseHover('#operate-notification');
						await clickTopSubMenuItem('a[data-event="show:notification:flaring"]');
						break;
					case 'Venting':
						//Venting submenu:
						await UofC.mouseHover('#operate-notification');
						await clickTopSubMenuItem('a[data-event="show:notification:venting"]');
						break;
				  //Close submenu
					case 'New Reclamation':
						await clickTopSubMenuItem('a[data-event="show:reccert:application"]');
						await driver.sleep(waitShort);
						break;
					case 'New ESA Phase 1':
						await clickTopSubMenuItem('a[data-event="show:reccert:esa1"]');
						await driver.sleep(waitShort);
						break;
					case 'New ESA Phase 2/3':
						await clickTopSubMenuItem('a[data-event="show:reccert:esa2"]');
						await driver.sleep(waitShort);
						break;
				  
				  //Close -> Area Based Closure submenu
					case 'Proposed':
						//Proposed submenu:
						await UofC.mouseHover('.dropdown.industry-option:last-child>ul>li:nth-child(4)>a');
						await clickTopSubMenuItem('a[data-id="AREA_BASED_CLOSURE_PROPOSED"]');
						await driver.sleep(waitShort);
						break;
					case 'Confirmed':
						//Confirmed submenu:
						await UofC.mouseHover('.dropdown.industry-option:last-child>ul>li:nth-child(4)>a');
						await clickTopSubMenuItem('a[data-id="AREA_BASED_CLOSURE_CONFIRMED"]');
						await driver.sleep(waitShort);
						break;
					default:
						break;
				}
			});
		}
		
		const clickTopMenuItem = async (menuCssLocator) => {
			await driver.findElement(By.css(menuCssLocator));
			await UofC.clickElementByCSS(menuCssLocator);
		};
		
		const clickTopSubMenuItem = async (subMenuCssLocator) => {
			await driver.findElement(By.css(subMenuCssLocator));
			await UofC.clickElementByCSS(subMenuCssLocator);
		};
		
		//wait for returned object
		it('wait for "' + expectedCssLocator + '" object to be displayed', async () => {
			if (submenuName !== "Reclamation") {
				await UofC.waitForPageLoad();
			}
			await UofC.waitForObjectLoad(expectedCssLocator, waitLong * 5, waitShort);
		});
	};
	
	UofC.clickLeftSideMenuItems = (leftSideMenu, expectedCssLocator) => {
		/*
		//OBJECTS - LINKS CSSLocators:
		--- 1st level
		General: - this is selected     a[data-id="generalTab"]
		Confirmation: - disabled        a[data-id="confirmationTab"]
	
		--- 2nd level
		Contact Information:            a[data-id="generalTab:contactInfo"]         - displayed as default
		Application Information:        a[data-id="generalTab:applicationInfo"]     - displayed as default
	
		- displayed after clicking on 'General, 'Contact Information' or 'Application Information' links
		Proposed Activity:              a[data-id="generalTab:proposedActivity"]
		Additional Information:         a[data-id="generalTab:additionalInfo"]
		Activity Details:               a[data-id="generalTab:activityDetails"]
		Confirmation:                   *see the locator above
	
		- displayed after clicking on the 'Confirmation' link
		Validation/Rules                a[data-id="confirmationTab:validationRules"]
	
		NOTES: -------------------------------------------------------------------------------------------------------------
		if user is on 'Application Information' cannot navigate away until we select the '..want to add the app to an existing proj'
		on other tabs can easily navigate to any/all other tabs
	
		'Confirmation' can be clicked right away after it gets displayed - after clicking on any other links than 'Application Information'
		- all tabs will become hidden
		- but General will show a warning image):
		- now if navigate to General tab it'll display all other
	
		--------------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will click on left side menu items (which is expected to be displayed before the click)
	
		ACCEPTED PARAMETER(S) AND VALUES:
		leftSideTopMenu:    a[data-id="authorizationTab"] - this represents the top level menu's css locator
		leftSideSubMenu:    a[data-id="authorizationTab:authorizationAdditionalInformation"] - this is the submenu css locator
		expectedCssLocator: contactInformationPanelHeading - some css locator for an element to be loaded after a menu item is clicked
	
		USAGE:  UofC.clickLeftSideMenuItems('a[data-id="authorizationTab:authorizationAdditionalInformation"]', "#activityDetailsPanelHeading");
				UofC.clickLeftSideMenuItems('a[data-id="authorizationTab"]', "#activityDetailsPanelHeading");
		----------------------------------------------------------------------------------------------------------------- */
		//get menu paths ready
		let element = null;
		let elementClass = null;
		
		leftSideMenu = leftSideMenu.split(':');
		const menuItem = 'a[data-id="' + leftSideMenu[0] + '"]';
		const menuItemActive = '#nav-item-header-' + leftSideMenu[0];
		
		it('click left side ' + menuItem + ' menu', async () => {
			//click the menu if it is not yet active
			element = await driver.findElement(By.css(menuItemActive));
			elementClass = await element.getAttribute('class');
			if (!elementClass.includes('active-nav-item-header')) {
				//click the main menu
				element = await driver.findElement(By.css(menuItem));
				await driver.wait(until.elementIsVisible(element), waitLong);
				
				//click leftSideTopMenu
				await UofC.clickElementByCSS(menuItem);
				await UofC.waitForPageLoad();
				await driver.sleep(1000);
				await UofC.waitForPageLoad();
			}
		});
		
		if (leftSideMenu.length > 1) {
			const subMenuItem = 'a[data-id="' + leftSideMenu[0] + ':' + leftSideMenu[1] + '"]';
			const subMenuItemActive = '#step-row-' + leftSideMenu[1];
			
			it('click left side ' + subMenuItem + ' sub menu', async () => {
				//click the sub menu if it is not yet active
				element = await driver.findElement(By.css(subMenuItemActive));
				elementClass = await element.getAttribute('class');
				if (!elementClass.includes('active-step-row')) {
					//click the main menu
					element = await driver.findElement(By.css(subMenuItem));
					element = await driver.wait(until.elementIsVisible(element), waitLong);
					element = await element.getText();
					const expectedTitle = element;
					
					//click leftSideTopMenu
					await UofC.clickElementByCSS(subMenuItem);
					await UofC.waitForPageLoad();
					await driver.sleep(1000);
					await UofC.waitForPageLoad();
					element = await driver.findElement(By.css('.wizard-step-heading span:nth-child(2)'));
					const text = await element.getText();
					expect(text).to.equal('- ' + expectedTitle);
				}
			});
		}
		
		if (expectedCssLocator) {
			it('expected ' + expectedCssLocator + ' object loaded after left side menu clicked', async () => {
				await UofC.waitForObjectLoad(expectedCssLocator, waitLong, 500);
			});
		}
	};
	
	UofC.clickRightSideTopLinks = (linkCssLocator, waitObjectCssLocator) => {
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will click on right side top links
	
		ACCEPTED PARAMETER(S) AND VALUES:
		linkCssLocator:         the css of the link to be clicked
		waitObjectCssLocator:   a css locator for an element to wait for after the click is done
	
		USAGE:  UofC.clickRightSideTopLinks('a[data-event="show:workspace:search"]', '#ApplicationSearchPanelHeading');
				UofC.clickRightSideTopLinks('a[data-event="show:geocortex:map"]', '#???');
		----------------------------------------------------------------------------------------------------------------- */
		it('click top right side ' + linkCssLocator + ' link', async () => {
			await driver.wait(until.elementLocated(By.css(linkCssLocator)), waitLong * 3);
			await UofC.clickElementByCSS(linkCssLocator);
			await UofC.waitForPageLoad();
			if (waitObjectCssLocator) {
				//-- works for gis-external but not for gis-internal (new tab is launched)
				await UofC.waitForObjectLoad(waitObjectCssLocator, waitLong, waitShort);
			}
		});
	};
	
	
	
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
		DESCRIPTION:    ?! code is same as above - temp function ?!
						this function will find a text field by the given CSS Locator
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
		await driver.wait(until.elementLocated(By.css(fieldCss)), waitLong);
		const element = await driver.findElement(By.css(fieldCss));
		await element.sendKeys(value);
		await driver.sleep(waitShort);
		await UofC.waitForPageLoad();
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
	
	UofC.openApplicationByLink = () => {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function will
						then it will
	
		ACCEPTED PARAMETER(S) AND VALUES:
		element:    ?????????   - the ?! for the object to be clicked - must be unique
		value:      "any text"  - the value of
	
		USAGE:  UofC.populateGridElementValue(elements[i], "value to be typed");
				UofC.populateGridElementValue(elements[i], wetlandReplacementGridValuesArray[i]);
		------------------------------------------------------------------------------------------------------------- */
		
		before(async () => {
			const appTypeParsed = appType.split('-');
			await driver.get(UofC.getBaseUrl() + '/#' + appTypeParsed[0] + '/' +
			  harnessObj.getMostRecentApplication(appType, appSubType, false).appId);
			await UofC.waitForPageLoad();
		});
	};
	
	UofC.openReportDocuments = (tableauBaseInternalUrl, reportsArray, i) => {
		describe('validate "' + reportsArray[i].name + '" report', () => {
			it('open the report', async () => {
				await driver.get(tableauBaseInternalUrl + reportsArray[i].url);
			});
			
			it('the report page is loaded', async () => {
				await UofC.waitForObjectLoad('.tab-dashboard:nth-child(1)', waitLong * 20, waitShort, true);
			});
			
			it('there is no error and the title is ' + reportsArray[i].expectedTitle, async () => {
				const text = await UofC.getElementValueByCSS('body');
				expect(text).to.not.contain('Resource not found');
				expect(text).to.not.contain('Unable to connect to the data source.');
				expect(text).to.not.contain('Try Again');
				expect(text).to.contain(reportsArray[i].expectedTitle);
			});
		});
	};
	
	let authorizationId = '';
	UofC.findTheAuthorizationIdByApplicationId = (applicationId) => {
		//find the application by it's ID and select view from the dropdown
		UofC.searchForAnApplicationByIdAndSelectAnAction(applicationId, 'View', '#PanelHeading');
		
		describe('retrieve the activity id for the application ' + applicationId, () => {
			//find and retrieve the Activity ID
			it('find the activity id and retrieve/store it', async () => {
				const elements = await UofC.getElementsByCSS(
				  '#ProposedWaterPanelBody .proposed-water-grid tbody .applicationAssignment'
				);
				const elementText = await elements[0].getText();
				if (elementText.length > 0) {
					authorizationId = elementText;
					console.log('authorizationId ' + authorizationId);
				} else {
					throw "activity id not found - not longer than 0";
				}
			});
		});
		
		return authorizationId;
	};
	
	return UofC;
})();

module.exports = UofC;