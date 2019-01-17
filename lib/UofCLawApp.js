/**
 * Created by valeriu.jecov on 18/10/2018.
 */

/* jshint -W024 */
/* jshint -W014 */
/* jshint laxcomma:true */
/* jshint expr:true */

const expect = require('chai').expect;

const UcLaw = (() => {
	
	const UcLaw = require('./UofCApps-base');
	
	let driver
	  // , webDriver
	  , By
	  , until
	  , waitShort
	  , waitLong
	  , initialized
	  , harnessObj
	  , username
	  , password
	  , baseUrl
	  , displayName
	  , env;
	
	UcLaw.init = (harnessObjIn, waitShortIn, waitLongIn) => {
		UcLaw.initBase(harnessObjIn, waitShortIn, waitLongIn);
		
		const attrs = UcLaw.getAttrs();
		// webDriver = attrs.webdriver;
		driver = attrs.driver;
		By = attrs.By;
		until = attrs.until;
		waitShort = attrs.waitShort;
		waitLong = attrs.waitLong;
		initialized = attrs.initialized;
		harnessObj = attrs.harnessObj;
		username = attrs.username;
		password = attrs.password;
		baseUrl = attrs.baseUrl;
		displayName = attrs.displayName;
		env = attrs.env;
	};
	
	UcLaw.createBasicPage = (newPageParameters) => {
		describe('create a new basic page', () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			describe('admin menu - navigate to content -> add content -> basic page', () => {
				UcLaw.navigateThroughAdminMenu('Content', 'BasicPage', '.page-title');
			});
			
			describe('setup the new basic page and fill it with data', () => {
				const pageTitle = newPageParameters.pageTitle + ' ' + Math.floor((Math.random() * 100) + 1);
				const isPublished = newPageParameters.isPublished;
				
				it('type the "title" of the basic page as ' + pageTitle, async () => {
					await UcLaw.setTextFieldValueByCSS('input[id*=edit-title]', pageTitle);
				});
				
				it('check the "published" checkbox ' + isPublished, async () => {
					await UcLaw.setButtonCheckboxByCSS('#edit-status-value', isPublished);
				});
				
				if (newPageParameters.menuSettingsValues) {
					const menuLinkTitle = newPageParameters.menuSettingsValues.menuLinkTitle +
					  ' ' + Math.floor((Math.random() * 99) + 1);
					
					const menuDescription = newPageParameters.menuSettingsValues.menuDescription +
					  ' ' + Math.floor((Math.random() * 99) + 1);
					
					const menuParentItem = newPageParameters.menuSettingsValues.menuParentItem;
					
					let menuWeight = (newPageParameters.menuSettingsValues.menuWeight) ?
					  newPageParameters.menuSettingsValues.menuWeight : Math.floor((Math.random() * 9) + 3);
					
					describe('assign menu settings', () => {
						UcLaw.expandCollapseAccordionItemByName('MENU SETTINGS', true, '#edit-menu-enabled');
						
						it('check the "provide a menu link" checkbox', async () => {
							await UcLaw.setButtonCheckboxByCSS('#edit-menu-enabled', true);
						});
						
						it('type the "menu link title" as ' + menuLinkTitle, async () => {
							await UcLaw.setTextFieldValueByCSS('#edit-menu-title', menuLinkTitle);
						});
						
						it('type the description as ' + menuDescription, async () => {
							await UcLaw.setTextFieldValueByCSS('#edit-menu-description', menuDescription);
						});
						
						it('select the parent item as ' + menuParentItem, async () => {
							await UcLaw.setSelectDropDownValueByCSS('#edit-menu-menu-parent', menuParentItem)
						});
						
						it('type the "weight" of the menu as ' + menuWeight, async () => {
							await UcLaw.setTextFieldValueByCSS('#edit-menu-weight', menuWeight);
						});
					});
				}
				
				if (newPageParameters.assignTeams) {
					// let teamsToAssign = newPageParameters.assignTeams;
					describe('assign next teams ' + newPageParameters.assignTeams, () => {
						UcLaw.expandCollapseAccordionItemByName('TEAMS', true, '#edit-teams-teams-3');
						
						UcLaw.selectMultipleCheckboxesInAGroup('#edit-teams-teams', newPageParameters.assignTeams);
					});
				}
				
				describe('save the newly created page ' + pageTitle, () => {
					it('scroll up to get the save button visible', async () => {
						const saveBtnElement = await driver.findElement(By.css('#edit-submit'));
						// if(saveBtnElement) {
						// 	console.log('saveBtnElement found');
						// } else {
						// 	console.log('saveBtnElement not found');
						// }
						
						// await driver.executeScript('document.getElementById("#edit-submit").scrollTop(0)');                              //Cannot read property 'scrollTop' of null
						// await driver.executeScript(saveBtnElement.scrollTop(0));                                                         // saveBtnFindElement.scrollTop is not a function
						// await driver.executeScript('arguments[0].scrollIntoView(true);', saveBtnElement);                                //this works but not enough
						// await driver.executeScript('arguments[0].scrollIntoView(true);', pageTitleElement);                              //this works but not enough
						// await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "start"});', pageTitleElement);    //this works but not enough
						await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', saveBtnElement);    //works perfectly
					});
					
					UcLaw.clickSave();
					
					//find the status message and validate it then close it
					const expectedText = 'Close Status Message\n' + 'Status message\n' + 'Basic page ' + pageTitle +
					  ' has been created.';
					UcLaw.validateDisplayedText('.messages.status', expectedText);
					
					it('close the status message popup', async () => {
						await UcLaw.clickElementByCSS('.messages.status>button');
						driver.sleep(500);
					});
				});
			});
		});
	};
	
	UcLaw.addNewSection = (addSectionBtnNr, columnsLayout) => {
		describe('add a new section using btn nr ' + addSectionBtnNr + ' and choose the layout ' + columnsLayout, () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			it('click the add section button nr ' + addSectionBtnNr, async () => {
				let addSectionLinkElement = await driver.findElements(By.css('#layout-builder>.new-section>a'));
				const addSectionBtnsCounter = addSectionLinkElement.length;
				if (addSectionBtnsCounter > 0) {
					if (addSectionBtnsCounter <= addSectionBtnNr) {
						addSectionLinkElement = addSectionLinkElement[(addSectionBtnNr - 1)];
						if (addSectionBtnsCounter > 1) {
							//scroll down on the page if we need to click the add section buttons other than the first hero
							// this will bring the buttons up on the screen so they are visible and can be clicked
							await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});',
							  addSectionLinkElement);
						}
						driver.sleep(200);
					} else {
						throw 'you cannot click on add section button nr ' + addSectionBtnNr +
						' because only next add section button nrs are available: ' + addSectionBtnsCounter
					}
				} else {
					throw "no add section buttons could be found, please check your parameters or if there is anything wrong in the app"
				}
				
				await addSectionLinkElement.click();
				driver.sleep(500);
				await UcLaw.waitForPageLoad();
				await UcLaw.waitForObjectLoad('.ui-dialog', waitShort, 500, true);
			});
			
			it('choose the ' + columnsLayout + ' column(s) layout', async () => {
				await UcLaw.clickElementByCSS('.layout-selection>li>a[href*=layout_col' + columnsLayout + ']');
				await UcLaw.waitForPageLoad();
			});
		});
	};
	
	UcLaw.addNewBlock = (addBlockBtnNr, blockCategory, blockExpectedCssLocator, categoryLinkGroupLocator,
	                     categoryLinkNameToClick, categoryExpectedCssLocator, teamsCheckBoxesToSelect,
	                     expectedCssLocatorAfterBlockAdded, expectedMessageStatusText) => {
		describe('add a new block using btn nr 2', () => {
			before(async () => {
			
			});
			
			after(async () => {
			
			});
			
			// describe('admin menu - navigate to content -> add content -> basic page', () => {
			// 	UcLaw.navigateThroughAdminMenu('Content', 'BasicPage', '.page-title');
			// });
			
			it('click the add block button nr ' + addBlockBtnNr, async () => {
				await UcLaw.waitForPageLoad();
				
				let addBlockLinkElements = await driver.findElements(By.css('#layout-builder .new-block>a'));
				const addBlockBtnsCounter = addBlockLinkElements.length;
				if (addBlockBtnsCounter > 0) {
					if (addBlockBtnsCounter <= addBlockBtnNr) {
						const addBlockLinkElement = addBlockLinkElements[(addBlockBtnNr - 1)];
						if (addBlockBtnsCounter > 1) {
							//scroll down on the page if we need to click the add section buttons other than the first hero
							// this will bring the buttons up on the screen so they are visible and can be clicked
							await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});',
							  addBlockLinkElement);
						}
						
						driver.sleep(500);
						
						await addBlockLinkElement.click();
						await UcLaw.waitForPageLoad();
						await UcLaw.waitForObjectLoad('.ui-dialog', waitLong * 3, 1000, true); //right side lists
					} else {
						throw 'you cannot click on add block button nr ' + addBlockBtnNr +
						' because only next add block button nrs are available: ' + addBlockBtnsCounter;
					}
				} else {
					throw "no add block buttons could be found, please check your parameters or if there is anything wrong in the app";
				}
			});
			
			//expand the block category you need
			UcLaw.expandCollapseAccordionItemByName(blockCategory, true, blockExpectedCssLocator);
			
			//click the link under your category
			UcLaw.clickLinkFromGroupByName(categoryLinkGroupLocator, categoryLinkNameToClick, categoryExpectedCssLocator);
			
			//assign the Teams (select the checkboxes for the teams you want)
			UcLaw.selectMultipleCheckboxesInAGroup('div[id*=edit-settings-teams]', teamsCheckBoxesToSelect);
			
			it('click add block button', async () => {
				await UcLaw.clickElementByCSS('input[id*=edit-actions-submit]');
				await UcLaw.waitForPageLoad();
				await UcLaw.waitForObjectLoad(expectedCssLocatorAfterBlockAdded, waitLong * 5, 1000, true);
			});
			
			//click save page layout
			UcLaw.clickSave();
			
			UcLaw.validateDisplayedText('.messages.status', expectedMessageStatusText);
			
			it('close the status message popup', async () => {
				await UcLaw.clickElementByCSS('.messages.status>button');
				driver.sleep(500);
			});
		});
	};
	
	//NOTE: might need to have multiple editBlock functions based on block type
	//e.g. editStreamingMediaBlock
	UcLaw.editStreamingMediaBlock = (blockHeadingValue, blockDescriptionValue, accessibilityText, captionForMediaValue,
	                                 creatorCreditValue, mediaTypeValue, mediaTypeEmbedUrl, extraCssClasses, createNewRevision) => {
		describe('edit the newly added block', () => {
			//NOTE: figure out what are the required fields here and add ifs for those which are not
			it('click the edit this block button', async () => {
				await UcLaw.clickElementByCSS('.streaming-media .block-editing>a');
				await UcLaw.waitForPageLoad();
				await UcLaw.waitForObjectLoad('.ui-dialog', waitLong * 3, 1000, true);
			});
			
			it('type the heading as ' + blockHeadingValue, async () => {
				await UcLaw.setTextFieldValueByCSS('.ui-dialog input[id*="field-ucws-streaming-media-head"]',
				  blockHeadingValue);
			});
			
			it('switching to the description iframe', async () => {
				await driver.switchTo().frame(driver.findElement(By.css('.ui-dialog iframe')));
			});
			
			it('type the description as ' + blockDescriptionValue, async () => {
				await UcLaw.setTextFieldValueByCSS('.cke_editable', blockDescriptionValue);
			});
			
			//here might need to switch off the iframe above
			it('switching out of the description iframe', async () => {
				const handles = await driver.getAllWindowHandles();
				await driver.switchTo().window(handles[0]);
			});
			
			it('type the accessibility text as ' + accessibilityText, async () => {
				await UcLaw.setTextFieldValueByCSS('input[id*=ahead]', accessibilityText);
			});
			
			it('type the caption for media as ' + captionForMediaValue, async () => {
				await UcLaw.setTextFieldValueByCSS('input[id*=capt]', captionForMediaValue);
			});
			
			it('type the creator credit as ' + creatorCreditValue, async () => {
				await UcLaw.setTextFieldValueByCSS('input[id*=ccred]', creatorCreditValue);
			});
			
			it('select the media type as ' + mediaTypeValue, async () => {
				await UcLaw.setSelectDropDownValueByCSS('select[id*=type]', mediaTypeValue);
			});
			
			if (mediaTypeEmbedUrl) {
				it('type the ' + mediaTypeValue.toLowerCase() + ' embed url as ' + mediaTypeEmbedUrl, async () => {
					let mediaTypeEmbedUrlLocator = (mediaTypeValue.toLowerCase() === 'youtube') ? 'input[id*=youem]' : 'input[id*=uri]';
					await UcLaw.setTextFieldValueByCSS(mediaTypeEmbedUrlLocator, mediaTypeEmbedUrl);
				});
			}
			
			if (mediaTypeValue.toLowerCase() === 'youtube') {
				//hide suggested videos
				
				//doNotShowYTLogo
				
				//use a light coloured bar
				
				//use white video progress bar
				
				//enableUseOfIframeApi
				
				//fixOverlayProblemInIE
				
				console.log('console.log: TODO: youtube parameters section is not yet done -- all as default for now | to update later');  //TODO
			}
			
			if (extraCssClasses) {
				it('type the extra css classes as ' + extraCssClasses, async () => {
					await UcLaw.setTextFieldValueByCSS('input[id*=css]', extraCssClasses);
				});
			}
			
			it('set the create new revision checkbox to ' + createNewRevision, async () => {
				await UcLaw.setButtonCheckboxByCSS('input[id*=edit-revision]', createNewRevision);
			});
			
			it('click save button', async () => {
				const saveBtnElements = await driver.findElements(By.css('[id*=edit-submit]'));
				if (saveBtnElements.length > 0) {
					//scroll to the bottom of the page so the button is visible
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', saveBtnElements[0]);
					driver.sleep(500);
					// const saveBtnElement = await driver.findElements(By.css('[id*=edit-submit]'));
					await saveBtnElements[0].click();
					await UcLaw.waitForPageLoad();
				} else {
					throw 'save button not found';
				}
			});
			
			// const confirmationMessage = 'Streaming Media ' + '729' + ' has been updated';
			// // validate that the confirmation message message is displayed (status)
			// UcLaw.validateDisplayedText('.messages.status:not(h2):not(button)', confirmationMessage);
			
			it('close the status message popup', async () => {
				await UcLaw.clickElementByCSS('.messages.status>button');
				driver.sleep(500);
			});
			
			//validate inserted values are displayed on the screen
			UcLaw.validateDisplayedText('.header h2', blockHeadingValue);
			UcLaw.validateDisplayedText('.header p', blockDescriptionValue);
			UcLaw.validateDisplayedText('p.caption', captionForMediaValue);
			UcLaw.validateDisplayedText('p.credit', creatorCreditValue);
			
			//validate css parameters are correct
			it('find ' + mediaTypeValue + ' container\'s margin bottom size and make sure it is not higher than 15px', async () => {
				const mediaTypeElements = await UcLaw.findElementsByCSS('.youtube-container');
				if (mediaTypeElements) {
					const mediaTypeMarginBottom = await mediaTypeElements[0].getCssValue('margin-bottom');
					// console.log(mediaTypeMarginBottom);
					if (mediaTypeMarginBottom.replace('px', '') > 15) {
						throw 'mediaTypeValue container\'s margin bottom is higher than 15px, actual is ' + mediaTypeMarginBottom;
					}
				} else {
					throw 'no ' + mediaTypeValue + ' container found';
				}
			});
			
			it('find the media caption and validate its margin parameters equal to 0', async () => {
				const captionElements = await UcLaw.findElementsByCSS('p.caption');
				if (captionElements) {
					const captionMargin = await captionElements[0].getCssValue('margin');
					// console.log(captionMargin);
					if (captionMargin.replace('px', '') > 0) {
						throw 'media caption element\'s margin property is not 0 but ' + captionMargin;
					}
				} else {
					throw 'no caption element was found';
				}
			});
			
			it('find the creator credit and validate its margin parameters equal to 0', async () => {
				const creatorCreditElements = await UcLaw.findElementsByCSS('p.credit');
				if (creatorCreditElements) {
					const creatorCreditMargin = await creatorCreditElements[0].getCssValue('margin');
					// console.log(creatorCreditMargin);
					if (creatorCreditMargin.replace('px', '') > 0) {
						throw 'creator credit element\'s margin property is not 0 but ' + creatorCreditMargin;
					}
				} else {
					throw 'no creator credit element was found';
				}
			});
		});
	};
	
	
	return UcLaw;
})();

module.exports = UcLaw;
