/**
 * Created by valeriu.jecov on 18/10/2018.
 */

/* jshint -W024 */
/* jshint -W014 */
/* jshint laxcomma:true */
/* jshint expr:true */

const expect = require('chai').expect;

const UofC = (() => {
	
	const UofC = require('./UofCApps-base');
	
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
	
	UofC.init = (harnessObjIn, waitShortIn, waitLongIn) => {
		UofC.initBase(harnessObjIn, waitShortIn, waitLongIn);
		
		const attrs = UofC.getAttrs();
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
	
	UofC.createBasicPage = (newPageParameters) => {
		describe('create a new basic page', () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			//set up the variable used across the function:
			const pageTitle = newPageParameters.pageTitle + ' ' + Math.floor((Math.random() * 100) + 1);
			
			let menuLinkTitle, menuDescription, menuParentItem, menuWeight;
			
			if (newPageParameters.menuSettingsValues) {
				menuLinkTitle = newPageParameters.menuSettingsValues.menuLinkTitle + ' ' +
				 Math.floor((Math.random() * 99) + 1);
				
				menuDescription = newPageParameters.menuSettingsValues.menuDescription + ' ' +
				 Math.floor((Math.random() * 99) + 1);
				
				menuParentItem = newPageParameters.menuSettingsValues.menuParentItem;
				
				menuWeight = (newPageParameters.menuSettingsValues.menuWeight) ?
				 newPageParameters.menuSettingsValues.menuWeight : Math.floor((Math.random() * 9) + 3);
			}
			
			describe('admin menu - navigate to content -> add content -> basic page', () => {
				UofC.navigateThroughAdminMenu('Content', 'BasicPage', '.page-title');
			});
			
			describe('setup the new basic page and fill it with data', () => {
				//TITLE - the only default required field
				it('type the "title" of the basic page as ' + pageTitle, async () => {
					await UofC.setTextFieldValueByCSS('input[id*=edit-title]', pageTitle);
				});
				//PUBLISHED
				if (newPageParameters.isPublished === true) {
					it('set the "published" checkbox to ' + newPageParameters.isPublished, async () => {
						await UofC.setButtonCheckboxByCSS('#edit-status-value', newPageParameters.isPublished);
					});
				}
				
				//MENU SETTINGS
				if (newPageParameters.menuSettingsValues) {
					describe('assign menu settings', () => {
						UofC.expandCollapseAccordionItemByName('MENU SETTINGS', true, '#edit-menu-enabled');
						//PROVIDE A MENU LINK checkbox
						it('check the "provide a menu link" checkbox', async () => {
							await UofC.setButtonCheckboxByCSS('#edit-menu-enabled', true);
						});
						//MENU LINK TITLE field
						it('type the "menu link title" as ' + menuLinkTitle, async () => {
							await UofC.setTextFieldValueByCSS('#edit-menu-title', menuLinkTitle);
						});
						//DESCRIPTION field
						it('type the "description" as ' + menuDescription, async () => {
							await UofC.setTextFieldValueByCSS('#edit-menu-description', menuDescription);
						});
						//PARENT ITEM dropdown
						it('select the "parent item" as ' + menuParentItem, async () => {
							await UofC.setSelectDropDownValueByCSS('#edit-menu-menu-parent', menuParentItem)
							
							//temp - to close the dropdown after needed option is selected:
							// UofC.clickElementByCSS('#edit-menu-weight');
						});
						//WEIGHT field
						if (menuWeight) {
							it('type the "weight" of the menu as ' + menuWeight, async () => {
								await UofC.setTextFieldValueByCSS('#edit-menu-weight', menuWeight);
							});
						}
					});
				}
				//TEAMS
				if (newPageParameters.assignTeams) {
					// let teamsToAssign = newPageParameters.assignTeams;
					describe('assign next teams ' + newPageParameters.assignTeams, () => {
						//expand TEAMS accordion:
						UofC.expandCollapseAccordionItemByName('TEAMS', true, '#edit-teams-teams-1');
						//select the checkboxes
						UofC.selectMultipleCheckboxesInAGroup('#edit-teams-teams', newPageParameters.assignTeams);
					});
				}
				
				describe('save the newly created page ' + pageTitle, () => {
					it('scroll up to get the save button visible', async () => {
						const saveBtnElement = await driver.findElement(By.css('#edit-submit'));
						// await driver.executeScript('document.getElementById("#edit-submit").scrollTop(0)');                              //Cannot read property 'scrollTop' of null
						// await driver.executeScript(saveBtnElement.scrollTop(0));                                                         // saveBtnFindElement.scrollTop is not a function
						// await driver.executeScript('arguments[0].scrollIntoView(true);', saveBtnElement);                                //this works but not enough
						// await driver.executeScript('arguments[0].scrollIntoView(true);', pageTitleElement);                              //this works but not enough
						// await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "start"});', pageTitleElement);    //this works but not enough
						await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', saveBtnElement);    //works perfectly
					});
					
					UofC.clickSave();
					
					//find the status message and validate it then close it
					const pageCreatedMessage = 'Close Status Message\n' + 'Status message\n' + 'Basic page ' + pageTitle +
					 ' has been created.';
					UofC.validateDisplayedTextEquals('.messages.status', pageCreatedMessage);
					
					it('close the status message popup', async () => {
						await UofC.clickElementByCSS('.messages.status>button');
						driver.sleep(500);
					});
				});
				
				if (newPageParameters.verifyPage === true) {
					describe('retrieve and validate page\'s title and the url', () => {
						//1. check new page's title
						it('page\'s title includes "' + pageTitle.toLowerCase() + '"', async () => {
							const actualPageTitle = await driver.getTitle();
							// console.log('actual page title is: ' + actualPageTitle);
							expect(actualPageTitle.toLowerCase()).to.include(pageTitle.toLowerCase());
						});
						
						if (newPageParameters.isPublished === true) {
							//2. check new page's url
							const includedInUrl = menuLinkTitle.replace(/\s+/g, '-').toLowerCase();
							it('page\'s url includes "' + includedInUrl + '"', async () => {
								const actualUrl = await driver.getCurrentUrl();
								// console.log('\nthe actualUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.url1 + '\n');
								expect(actualUrl.toLowerCase()).to.include(includedInUrl);
							});
							
							//check if the menu got added to the page and the menu title matches menuLinkTitle
							if (newPageParameters.menuSettingsValues) {
								it('verify that "' + menuLinkTitle + '" link is displayed in the ' + '<main menu>', async () => {
									await UofC.waitForObjectLoad('.uc-mainmenu.current>a', waitLong * 3, 500, true);
								});
								
								//verify menu link's title
								UofC.validateDisplayedTextEquals('.uc-mainmenu.current>a', menuLinkTitle);
							}
						}
					});
				}
			});
		});
	};
	
	UofC.editBasicPage = (pageParameters) => {
		describe('edit a basic page ---- NOT YET DONE', () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			//TODO: editBasicPage - build the function
			
		});
	};
	
	UofC.deleteBasicPage = (pageTitle) => {
		describe('create a new basic page', () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			//set up the variable used across the function:
			const deleteConfirmationMessage = 'The Basic page ' + pageTitle + ' has been deleted.';
			
			describe('delete the created page', () => {
				UofC.clickOnTabByText('Edit', 'a[id*=delete]');
				
				it('click the delete button to delete the page', async () => {
					await UofC.clickElementByCSS('a[id*=delete]');
					await UofC.waitForPageLoad();
				});
				
				it('wait for the new page with the delete confirmation section to display', async () => {
					await UofC.waitForObjectLoad('#node-page-delete-form', waitLong * 5, 500, true);
				});
				
				UofC.validateDisplayedTextContains('#node-page-delete-form', 'This action cannot be undone.');
				
				it('click the delete button to confirm page deletion', async () => {
					await UofC.clickElementByCSS('input[id*=edit-submit]');
					await UofC.waitForPageLoad();
				});
				
				//validate the confirmation message & close the popup: The Basic page Page Title ## has been deleted.
				// UofC.validateDisplayedTextContains('.messages:not(h2):not(button)', 'The Basic page ' + pageTitle);
				// UofC.validateDisplayedTextContains('.messages:not(h2):not(button)', 'has been deleted.');
				UofC.popUpConfirmation(deleteConfirmationMessage, waitShort);
			});
		});
	};
	
	UofC.addNewLayout = (addLayoutBtnNr, columnsLayoutNr) => {
		//By default, on a new basic page, there should only be 1 add block and 1 add layout button
		//The default add block button will only contain hero blocks you would have to add a layout to add the other blocks
		//When a Layout is added we'll have 2 Add Block & 2 Add Layout btns
		//However if you add a hero block, the 1st add block btn will be hidden
		//
		describe('add a new layout section by clicking the add layout btn #' + addLayoutBtnNr +
		 ' and select the ' + columnsLayoutNr + ' columns layout', () => {
			before(async () => {
			
			});
			
			after(async () => {
			
			});
			
			it('click the add layout button nr ' + addLayoutBtnNr, async () => {
				//was:  #layout-builder>.new-section>a
				const addLayoutLinkElements = await driver.findElements(By.css('#layout-builder>.new-section:not([style*="display: none"])>a'));
				const addLayoutLinksCounter = addLayoutLinkElements.length;
				if (addLayoutLinksCounter > 0) {
					if (addLayoutBtnNr <= addLayoutLinksCounter) {
						const addLayoutLinkElement = addLayoutLinkElements[(addLayoutBtnNr - 1)];
						// if (addLayoutLinksCounter > 1) {
						//scroll down on the page if we need to click the add section buttons other than the first hero
						// this will bring the buttons up on the screen so they are visible and can be clicked
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});',
						 addLayoutLinkElement);
						await addLayoutLinkElement.click();
						await UofC.waitForPageLoad();
						await UofC.waitForObjectLoad('.ui-dialog', waitShort, 500, true);
						// }
					} else {
						throw 'you cannot click on add layout button nr ' + addLayoutBtnNr +
						' because only next ' + addLayoutLinksCounter + ' add layout button nrs are available'
					}
				} else {
					throw "no add layout buttons could be found, please check your parameters or if there is anything wrong in the app"
				}
			});
			
			it('choose the ' + columnsLayoutNr + ' column(s) layout', async () => {
				await UofC.clickElementByCSS('.layout-selection>li>a[href*=layout_col' + columnsLayoutNr + ']');
				await UofC.waitForPageLoad();
			});
			
			UofC.popUpConfirmation('You have unsaved changes.', waitShort);
		});
	};
	
	UofC.addNewBlock = (addBlockValues) => {
		// if we click the 1st Add Block btn from the page (the one on the top) we should see the hero links
		// while if we press the 2nd Add Block it should display the other non-hero links
		describe('click the add block btn nr ' + addBlockValues.addBlockBtnNr + ' then ' +
		 addBlockValues.categoryLinkNameToClick + ' link', () => {
			before(async () => {
			
			});
			
			after(async () => {
			
			});
			
			it('click the add block button nr ' + addBlockValues.addBlockBtnNr, async () => {
				await UofC.waitForPageLoad();
				
				let addBlockLinkElements = await driver.findElements(By.css('#layout-builder .new-block>a'));
				const addBlockBtnsCounter = addBlockLinkElements.length;
				if (addBlockBtnsCounter > 0) {
					if (addBlockBtnsCounter <= addBlockValues.addBlockBtnNr) {
						const addBlockLinkElement = addBlockLinkElements[(addBlockValues.addBlockBtnNr - 1)];
						if (addBlockBtnsCounter > 1) {
							//scroll down on the page if we need to click the add section buttons other than the first hero
							// this will bring the buttons up on the screen so they are visible and can be clicked
							await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', addBlockLinkElement);
						}
						await driver.sleep(500);
						await addBlockLinkElement.click();
						await UofC.waitForPageLoad();
						await UofC.waitForObjectLoad('.ui-dialog', waitLong * 7, 1000, true); //waiting for the right side lists
					} else {
						throw 'you cannot click on add block button nr ' + addBlockValues.addBlockBtnNr +
						' because only next add block button nrs are available: ' + addBlockBtnsCounter;
					}
				} else {
					throw "no add block buttons could be found, please check your parameters or if there is anything wrong in the app";
				}
			});
			
			//expand the block category you need
			UofC.expandCollapseAccordionItemByName(addBlockValues.blockCategory, true, addBlockValues.blockExpectedCssLocator);
			
			//click the link under your category
			UofC.clickLinkFromGroupByName(addBlockValues.categoryLinkGroupLocator, addBlockValues.categoryLinkNameToClick,
			 addBlockValues.categoryExpectedCssLocator);
			
			//UCWS-683
			it('the reusable checkbox is false as default', async () => {
				let inputElement = await driver.findElement(By.css('input[name*="settings[reusable]"]'));
				inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
				const elementChecked = await inputElement.isSelected();
				expect(elementChecked).to.equal(false);
			});
			
			//UCWS-683
			if (addBlockValues.isReusable && addBlockValues.isReusable === true) {
				it('set the reusable checkbox to ' + addBlockValues.isReusable, async () => {
					await UofC.setButtonCheckboxByCSS('input[name*="settings[reusable]"]', addBlockValues.isReusable);
				});
				
				//UCWS-683
				it('the reusable block name text field exists, is is visible and enabled when the checkbox is selected', async () => {
					await UofC.waitForObjectLoad('input[name*="settings[reusable_block_title]"]', waitShort, 500, true)
				});
				
				//UCWS-683
				if (addBlockValues.reusableBlockName) {
					it('type the reusable block name as ' + addBlockValues.reusableBlockName, async () => {
						await UofC.setTextFieldValueByCSS('input[name*="settings[reusable_block_title]"]', addBlockValues.reusableBlockName);
					});
				}
			}
			
			if (addBlockValues.teamsCheckBoxesToSelect) {
				//assign the Teams (select the checkboxes for the teams you want)
				UofC.selectMultipleCheckboxesInAGroup('div[id*=edit-settings-teams]', addBlockValues.teamsCheckBoxesToSelect);
			}
			
			it('click add block button', async () => {
				await UofC.clickElementByCSS('input[id*=edit-actions-submit]');
				await UofC.waitForPageLoad();
			});
			
			it('the empty ' + (addBlockValues.categoryLinkNameToClick.replace('Add ', '')) + ' block was created, the ' +
			 addBlockValues.expectedCssLocatorAfterBlockAdded + ' object exists', async () => {
				//.draggable:nth-child(2) a[title="Edit More Information block"]  //--make sure the ..child(#) is correct here
				await UofC.waitForObjectLoad(addBlockValues.expectedCssLocatorAfterBlockAdded, waitLong * 5, 1000, true);
			});
			
			if (addBlockValues.categoryLinkNameToClick === 'Add Hero CTA' || addBlockValues.categoryLinkNameToClick === 'Add Image with Text') {
				UofC.popUpConfirmation('You have unsaved changes.', waitShort);
			}
		});
	};
	us 
	UofC.deleteBlock = (blockType, blockNr) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		//blockType = 'banner'; //comes as an argument
		//was: div[class*=ucws-banner] ===> 'div[class*=ucws-' + blockType + ']'
		//new: div[class*=banner].block ===> 'div[class*=' + blockType + '].block'
		describe('delete the ' + blockType + ' block #' + blockNr, () => {
			const blockCssLocator = (blockType.toLowerCase()).includes('image with text') ?
			 'div[class*=' + ((blockType.toLowerCase()).replace(/ /gi, '-')).replace('-with-text', '_text') + '].block' :
			 'div[class*=' + (blockType.toLowerCase()).replace(/ /gi, '-') + '].block';
			
			//navigate to Layout tab
			UofC.clickOnTabByText('Layout', 'ul>li>a[href*="layout/save"]');
			
			clickBlockConfigurationButton(blockCssLocator, blockNr, 'Remove block');
			
			UofC.confirmModalHeader('Are you sure you want to remove this block?');
			
			UofC.validateDisplayedTextContains('.ui-dialog form', 'This action cannot be undone.');
			
			it('click the remove button to confirm block removal', async () => {
				UofC.clickElementByCSS('.ui-dialog form input[value=Remove]');
			});
			
			UofC.popUpConfirmation('You have unsaved changes.', waitShort);
		});
	};
	
	UofC.configureBlock = (blockType, blockNr) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('configure the ' + blockType + ' block', () => {
			const blockCssLocator = (blockType.toLowerCase()).includes('image with text') ?
			 'div[class*=ucws-' + ((blockType.toLowerCase()).replace(/ /gi, '-')).replace('-with-text', '_text') + ']' :
			 'div[class*=ucws-' + (blockType.toLowerCase()).replace(/ /gi, '-') + ']';
			
			//TODO: build this function - later, when needed (similarities with deleteBlock function above)
			
		});
	};
	
	
	// EDIT BLOCKS FUNCTIONS -------------------------------------------------------------------------------------------
	//NOTE: multiple editBlock functions are needed based on block type
	//e.g. editHeroCtaBlock / editTextHeroCTABlock/ editStreamingMediaBlock / etc...
	UofC.editHeroCtaBlock = (ctaHeroValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the hero cta block', () => {
			clickEditBlockButton('.hero a[title="Edit Hero Call to Action block"]', 0);
			
			const HEADING_VALUE = ctaHeroValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-hero-cta-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = ctaHeroValues.descriptionValue ? ctaHeroValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (ctaHeroValues.descriptionValue) {
				typeBlockDescription('ucws-hero-cta-desc', DESCRIPTION_VALUE);
			}
			
			if (ctaHeroValues.textPosition) {
				//select[id*=hero-cta-tposition]
				setTextPosition(ctaHeroValues.textPosition);
			}
			
			if (ctaHeroValues.textAlignment) {
				//select[id*=hero-cta-talignment]
				setTextAlignment(ctaHeroValues.textAlignment);
			}
			
			//the value of bgColor should be numeric (from 1 to 7) to match available colors & css locators
			if (ctaHeroValues.bgColourItemNr) {
				setBackgroundColour(ctaHeroValues.bgColourItemNr);
			}
			
			if (ctaHeroValues.overlaidTextColour) {
				setOverlaidTextColour(ctaHeroValues.overlaidTextColour);
			}
			
			uploadBackgroundImage(ctaHeroValues.imageUpload, attachmentPath);
			
			if (ctaHeroValues.doNotApplyGradient) {
				setDoNotApplyGradient(ctaHeroValues.doNotApplyGradient);
			}
			
			if (ctaHeroValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (ctaHeroValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (ctaHeroValues.ctaButtons.url1) {
					typeCtaButtonsAndLabels(1, ctaHeroValues.ctaButtons.url1, ctaHeroValues.ctaButtons.btnLabel1);
				}
				
				if (ctaHeroValues.ctaButtons.url2) {
					typeCtaButtonsAndLabels(2, ctaHeroValues.ctaButtons.url2, ctaHeroValues.ctaButtons.btnLabel2);
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate hero cta block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'Hero CTA'
				 , null
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , ctaHeroValues.displayStyle
				 , ctaHeroValues.bgColourItemNr
				 , ctaHeroValues.ctaButtons ? ctaHeroValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editTextHeroCTABlock = (ctaTextHeroValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the text hero cta block', () => {
			//.text-hero-cta .block-editing>a
			clickEditBlockButton('.hero a[title*="Edit Text Hero Call to Action block"]', 0);
			
			it('check dialog\'s width', async () => {
				//get dialog's width and print it out - there are differences between different block's dialogs:
				const dialogElement = await driver.findElement(By.css('.ui-dialog'));
				const dialogWidth = await dialogElement.getCssValue('width');
				console.log('dialogWidth: ' + dialogWidth);
			});
			
			const HEADING_VALUE = ctaTextHeroValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-text-hero-cta-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = ctaTextHeroValues.descriptionValue ? ctaTextHeroValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (ctaTextHeroValues.descriptionValue) {
				typeBlockDescription('ucws-text-hero-cta-desc', DESCRIPTION_VALUE);
			}
			
			if (ctaTextHeroValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (ctaTextHeroValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (ctaTextHeroValues.ctaButtons.url1) {
					typeCtaButtonsAndLabels(1, ctaTextHeroValues.ctaButtons.url1, ctaTextHeroValues.ctaButtons.btnLabel1);
				}
				
				if (ctaTextHeroValues.ctaButtons.url2) {
					typeCtaButtonsAndLabels(2, ctaTextHeroValues.ctaButtons.url2, ctaTextHeroValues.ctaButtons.btnLabel2);
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate text hero cta block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'Text Hero CTA'
				 , null
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , ctaTextHeroValues.displayStyle
				 , ctaTextHeroValues.bgColourItemNr
				 , ctaTextHeroValues.ctaButtons ? ctaTextHeroValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editBannerBlock = (bannerBlockValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the banner block nr ' + bannerBlockValues.nrBannerBlockToEdit, () => {
			//was   .text-hero-cta .block-editing>a
			clickEditBlockButton('div.block a[title="Edit Banner block"]', bannerBlockValues.nrBannerBlockToEdit);
			
			const HEADING_VALUE = bannerBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-banner-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = bannerBlockValues.descriptionValue ? bannerBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (bannerBlockValues.descriptionValue) {
				typeBlockDescription('ucws-banner-desc', DESCRIPTION_VALUE);
			}
			
			if (bannerBlockValues.displayStyle) {
				it('select the display style as ' + bannerBlockValues.displayStyle, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=banner-display-style]', bannerBlockValues.displayStyle);
				});
			}
			
			if (bannerBlockValues.textAlignment) {
				//select[id*=ucws-banner-talignment]
				setTextAlignment(bannerBlockValues.textAlignment);
			}
			
			if (bannerBlockValues.displayStyle === 'Background Image') {
				if (bannerBlockValues.textPosition) {
					setTextPosition(bannerBlockValues.textPosition);
				}
				
				uploadBackgroundImage(bannerBlockValues.imageUpload, attachmentPath);
				
				if (bannerBlockValues.overlaidTextColour) {
					setOverlaidTextColour(bannerBlockValues.overlaidTextColour);
				}
				
				if (bannerBlockValues.doNotApplyGradient) {
					setDoNotApplyGradient(bannerBlockValues.doNotApplyGradient);
				}
			} else if (bannerBlockValues.displayStyle === 'Background Colour') {
				//the value of bgColor should be numeric (from 1 to 7) to match available colors & css locators
				if (bannerBlockValues.bgColourItemNr) {
					setBackgroundColour(bannerBlockValues.bgColourItemNr);
					
					//here & more info block
					if (bannerBlockValues.roundedCorners) {
						//select[id*=ucws-banner-round-corners]
						setRoundedCorners(bannerBlockValues.roundedCorners);
					}
				}
			}
			
			if (bannerBlockValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (bannerBlockValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (bannerBlockValues.ctaButtons.url1) {
					typeCtaButtonsAndLabels(1, bannerBlockValues.ctaButtons.url1, bannerBlockValues.ctaButtons.btnLabel1);
				}
				
				if (bannerBlockValues.ctaButtons.url2) {
					typeCtaButtonsAndLabels(2, bannerBlockValues.ctaButtons.url2, bannerBlockValues.ctaButtons.btnLabel2);
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('banner block #' + bannerBlockValues.nrBannerBlockToEdit + ' edits were applied', () => {
				validateBlockEditsApplied(
				 'Banner'
				 , bannerBlockValues.nrBannerBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , bannerBlockValues.displayStyle
				 , bannerBlockValues.bgColourItemNr
				 , bannerBlockValues.ctaButtons ? bannerBlockValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editChecklistBlock = (checklistBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the checklist block nr ' + checklistBlockValues.nrChecklistBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Checklist block"]', checklistBlockValues.nrChecklistBlockToEdit);
			
			const HEADING_VALUE = checklistBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-checklist-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = checklistBlockValues.descriptionValue ? checklistBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (checklistBlockValues.descriptionValue) {
				//div[id*=ucws-checklist-desc] iframe
				typeBlockDescription('ucws-checklist-desc', DESCRIPTION_VALUE);
			}
			
			if (checklistBlockValues.bgColourItemNr) {
				setBackgroundColour(checklistBlockValues.bgColourItemNr);
			}
			
			//TODO: accentColour - this is also used within the AddMoreInfo test -- move it within a reusable sub-function
			if (checklistBlockValues.accentColourItemNr) {
				//validate that the parameter matches the available values
				if (checklistBlockValues.accentColourItemNr > 10 || checklistBlockValues.accentColourItemNr < 1) {
					throw 'checklistBlockValues.accentColourItemNr is ' + checklistBlockValues.accentColourItemNr + ' but it should' +
					' be between 1 and 10, please correct the data';
				}
				
				let color1, color2, color3, color4, color5, color6, color7, color8, color9, color10;
				color1 = '#CF0722';
				color2 = '#FF671F';
				color3 = '#FFA300';
				color4 = '#CE0058';
				color5 = '#A6192E';
				color6 = '#6B3529';
				color7 = '#C4BFB6';
				color8 = '#8C857B';
				color9 = '#B5BD00';
				color10 = '#FFCD00';
				
				const bgColor = checklistBlockValues.bgColourItemNr;
				let selectedColor = (bgColor === 1) ? color1 : (bgColor === 2) ? color2 : (bgColor === 3) ? color3 :
				 (bgColor === 4) ? color4 : (bgColor === 5) ? color5 : (bgColor === 6) ? color6 : (bgColor === 7) ?
					color7 : (bgColor === 8) ? color8 : (bgColor === 9) ? color9 : (bgColor === 10) ? color10 :
					 'this color is not available: ' + bgColor;
				// console.log('accent selectedColor: ' + selectedColor);
				
				it('set the accent color to ' + selectedColor, async () => {
					await UofC.clickElementByCSS('div[class*="accent_color"]>button[class*=color][color*="' + selectedColor + '"]');
				});
			}
			
			if (checklistBlockValues.roundedCorners) {
				//select[id*=ucws-more-info-rcorners]
				setRoundedCorners(checklistBlockValues.roundedCorners);
			}
			
			if (checklistBlockValues.addChecklistItemSections) {
				//loop through the list of Add More Info block sections and add as many as needed
				for (let i = 0; i < checklistBlockValues.addChecklistItemSections.length; i++) {
					it('click add checklist items block\'s button time ' + (i + 1), async () => {
						await UofC.clickElementByCSS('.field-add-more-submit');
						await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') input[id*=checklist][id*=remove-button]',
						 waitShort, 500, true);
					});
					
					//TODO: this piece does not exist for AddChecklist blocks (only AddMoreInfo)
					/*//select an icon
					if (checklistBlockValues.addMoreInfoSections[i].icon) {
						it('click the down arrow icon to expand the icon list of information block ' + i, async () => {
							await UofC.clickElementByCSS('tr:nth-child(' + (i + 1) + ') .fip-grey i.fip-icon-down-dir');
							await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .fip-icons-container', waitShort, 500, true);
						});
						
						it('select the ' + checklistBlockValues.addMoreInfoSections[i].icon + ' icon', async () => {
							await UofC.clickElementByCSS('.selector-popup:not([style*="display: none"]) .'
							 + checklistBlockValues.addMoreInfoSections[i].icon);
						});
					}*/
					
					//add section heading
					if (checklistBlockValues.addChecklistItemSections[i].heading) {
						it('type the item ' + (i + 1) + '\'s subheading as ' +
						 checklistBlockValues.addChecklistItemSections[i].heading, async () => {
							//TODO: update this css locator within the EditMoreInfoBlock function as well
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=ucws-checklist][id*=shead]', checklistBlockValues.addChecklistItemSections[i].heading);
						});
					}
					
					//add section description
					if (checklistBlockValues.addChecklistItemSections[i].description) {
						it('switching to the ' + (i + 1) + ' description\'s iframe', async () => {
							await driver.switchTo().frame(driver.findElement(By.css('.ui-dialog .draggable:nth-child(' +
							 (i + 1) + ') iframe')));
						});
						
						it('type the description as ' + checklistBlockValues.addChecklistItemSections[i].description, async () => {
							await UofC.setTextFieldValueByCSS('.cke_editable',
							 checklistBlockValues.addChecklistItemSections[i].description);
						});
						
						//here might need to switch off the iframe above
						it('switching out of the description iframe', async () => {
							const handles = await driver.getAllWindowHandles();
							await driver.switchTo().window(handles[0]);
						});
					}
					
					//add URL & Text Link Label
					if (checklistBlockValues.addChecklistItemSections[i].url) {
						it('type the section ' + (i + 1) + '\'s cta url as ' + checklistBlockValues.addChecklistItemSections[i].url, async () => {
							/*await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*="ucws-more-info-block-cta-0-uri"]', checklistBlockValues.addChecklistItemSections[i].url);*/
							//TODO: update this css locator within the EditMoreInfoBlock function as well
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=ucws-checklist][id*=cta-0-uri]', checklistBlockValues.addChecklistItemSections[i].url);
							//.ui-dialog .draggable:nth-child(1) input[id*=ucws-checklist][id*=cta-0-uri]
						});
						
						it('type the section ' + (i + 1) + '\'s text link label as ' + checklistBlockValues.addChecklistItemSections[i].textLinkLabel, async () => {
							/*await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*="ucws-more-info-block-cta-0-title"]', checklistBlockValues.addChecklistItemSections[i].textLinkLabel);*/
							//TODO: update this css locator within the EditMoreInfoBlock function as well
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=ucws-checklist][id*=cta-0-title]', checklistBlockValues.addChecklistItemSections[i].textLinkLabel);
						});
					}
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate more info block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'Checklist'
				 , checklistBlockValues.nrChecklistBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , checklistBlockValues.displayStyle
				 , checklistBlockValues.bgColourItemNr
				 , checklistBlockValues.ctaButtons ? checklistBlockValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editMoreInfoBlock = (moreInfoBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the more info block nr ' + moreInfoBlockValues.nrMoreInfoBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit More Information block"]', moreInfoBlockValues.nrMoreInfoBlockToEdit);
			
			const HEADING_VALUE = moreInfoBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-more-info-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = moreInfoBlockValues.descriptionValue ? moreInfoBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (moreInfoBlockValues.descriptionValue) {
				//div[id*=ucws-more-info-desc] iframe
				typeBlockDescription('ucws-more-info-desc', DESCRIPTION_VALUE);
			}
			
			if (moreInfoBlockValues.bgColourItemNr) {
				setBackgroundColour(moreInfoBlockValues.bgColourItemNr);
			}
			
			//TODO: accentColour - this is also used within the AddChecklist test -- move it within a reusable sub-function
			if (moreInfoBlockValues.accentColourItemNr) {
				//validate that the parameter matches the available values
				if (moreInfoBlockValues.accentColourItemNr > 10 || moreInfoBlockValues.accentColourItemNr < 1) {
					throw 'moreInfoBlockValues.accentColourItemNr is ' + moreInfoBlockValues.accentColourItemNr + ' but it should' +
					' be between 1 and 10, please correct the data';
				}
				
				let color1, color2, color3, color4, color5, color6, color7, color8, color9, color10;
				color1 = '#CF0722';
				color2 = '#FF671F';
				color3 = '#FFA300';
				color4 = '#CE0058';
				color5 = '#A6192E';
				color6 = '#6B3529';
				color7 = '#C4BFB6';
				color8 = '#8C857B';
				color9 = '#B5BD00';
				color10 = '#FFCD00';
				
				const bgColor = moreInfoBlockValues.bgColourItemNr;
				let selectedColor = (bgColor === 1) ? color1 : (bgColor === 2) ? color2 : (bgColor === 3) ? color3 :
				 (bgColor === 4) ? color4 : (bgColor === 5) ? color5 : (bgColor === 6) ? color6 : (bgColor === 7) ?
					color7 : (bgColor === 8) ? color8 : (bgColor === 9) ? color9 : (bgColor === 10) ? color10 :
					 'this color is not available: ' + bgColor;
				// console.log('accent selectedColor: ' + selectedColor);
				
				it('set the accent color to ' + selectedColor, async () => {
					await UofC.clickElementByCSS('div[class*="accent_color"]>button[class*=color][color*="' + selectedColor + '"]');
				});
			}
			
			if (moreInfoBlockValues.addMoreInfoSections) {
				//loop through the list of Add More Info block sections and add as many as needed
				for (let i = 0; i < moreInfoBlockValues.addMoreInfoSections.length; i++) {
					it('click add more information block\'s button time ' + (i + 1), async () => {
						const addMoreInfoBlockBtn = await driver.findElement(By.css('.field-add-more-submit'));
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', addMoreInfoBlockBtn);
						await addMoreInfoBlockBtn.click();
						// await UofC.clickElementByCSS('.field-add-more-submit');  //was this (3 lines above)
						await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .icons-selector', waitLong * 3, 500, true);
					});
					
					//select an icon
					if (moreInfoBlockValues.addMoreInfoSections[i].icon) {
						it('click down arrow icon to expand the icons list of information block ' + i, async () => {
							await UofC.clickElementByCSS('tr:nth-child(' + (i + 1) + ') .fip-grey i.fip-icon-down-dir');
							await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .fip-icons-container', waitShort, 500, true);
						});
						
						it('type the ' + moreInfoBlockValues.addMoreInfoSections[i].icon + ' icon name into the search field' + i, async () => {
							await UofC.setTextFieldValueByCSS('.selector-popup:not([style*="display: none"]) input[class=icons-search-input]',
							 moreInfoBlockValues.addMoreInfoSections[i].icon);  //.ucws-more-info-picture
							await UofC.waitForObjectLoad('.selector-popup:not([style*="display: none"]) .' +
							 moreInfoBlockValues.addMoreInfoSections[i].icon, waitLong, 500, true);
						});
						
						it('select the ' + moreInfoBlockValues.addMoreInfoSections[i].icon + ' icon', async () => {
							//bring the icon to the center of the screen befor selecting it
							const iconElement = await driver.findElement(By.css('.selector-popup:not([style*="display: none"]) .'
							 + moreInfoBlockValues.addMoreInfoSections[i].icon));
							await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', iconElement);
							//.selector-popup:not([style*="display: none"]) .ucws-more-info-bookmark
							await UofC.clickElementByCSS('.selector-popup:not([style*="display: none"]) .'
							 + moreInfoBlockValues.addMoreInfoSections[i].icon);
						});
					}
					
					//add section heading
					if (moreInfoBlockValues.addMoreInfoSections[i].heading) {
						it('type the section ' + (i + 1) + ' heading as ' + moreInfoBlockValues.addMoreInfoSections[i].heading, async () => {
							/*await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*="ucws-more-info-block-shead"]', moreInfoBlockValues.addMoreInfoSections[i].heading);*/
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=ucws-more-info][id*=shead]', moreInfoBlockValues.addMoreInfoSections[i].heading);
						});
					}
					
					//add section description
					if (moreInfoBlockValues.addMoreInfoSections[i].description) {
						it('switching to the section ' + (i + 1) + ' description\'s iframe', async () => {
							await driver.switchTo().frame(driver.findElement(By.css('.ui-dialog .draggable:nth-child(' +
							 (i + 1) + ') iframe')));
						});
						
						it('type the description as ' + moreInfoBlockValues.addMoreInfoSections[i].description, async () => {
							await UofC.setTextFieldValueByCSS('.cke_editable', moreInfoBlockValues.addMoreInfoSections[i].description);
						});
						
						//here might need to switch off the iframe above
						it('switching out of the description iframe', async () => {
							const handles = await driver.getAllWindowHandles();
							await driver.switchTo().window(handles[0]);
						});
					}
					
					//add URL & Text Link Label
					if (moreInfoBlockValues.addMoreInfoSections[i].url) {
						it('type the section ' + (i + 1) + '\'s cta url as ' + moreInfoBlockValues.addMoreInfoSections[i].url, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*="ucws-more-info-block-cta-0-uri"]', moreInfoBlockValues.addMoreInfoSections[i].url);
						});
						
						it('type the section ' + (i + 1) + '\'s text link label as ' + moreInfoBlockValues.addMoreInfoSections[i].textLinkLabel, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*="ucws-more-info-block-cta-0-title"]', moreInfoBlockValues.addMoreInfoSections[i].textLinkLabel);
						});
					}
				}
			}
			
			if (moreInfoBlockValues.roundedCorners) {
				//select[id*=ucws-more-info-rcorners]
				setRoundedCorners(moreInfoBlockValues.roundedCorners);
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate more info block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'More Info'
				 , moreInfoBlockValues.nrMoreInfoBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , moreInfoBlockValues.displayStyle
				 , moreInfoBlockValues.bgColourItemNr
				 , moreInfoBlockValues.ctaButtons ? moreInfoBlockValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editSideKickBlock = (sideKickBlockValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the sidekick block nr ' + sideKickBlockValues.nrSideKickBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Sidekick Call to Action block"]', sideKickBlockValues.nrSideKickBlockToEdit);
			
			const HEADING_VALUE = sideKickBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-sidekick-cta-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = sideKickBlockValues.descriptionValue ? sideKickBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (sideKickBlockValues.descriptionValue) {
				//div[id*=ucws-more-info-desc] iframe
				typeBlockDescription('ucws-sidekick-cta-desc', DESCRIPTION_VALUE);
			}
			
			if (sideKickBlockValues.textPosition) {
				setTextPosition(sideKickBlockValues.textPosition);
			}
			
			//IMAGE UPLOAD - required
			uploadBackgroundImage(sideKickBlockValues.imageUpload, attachmentPath);
			
			if (sideKickBlockValues.bgColourItemNr) {
				setBackgroundColour(sideKickBlockValues.bgColourItemNr);
			}
			
			if (sideKickBlockValues.ctaButtons) {
				if (sideKickBlockValues.ctaButtons.url1) {
					typeCtaButtonsAndLabels(1, sideKickBlockValues.ctaButtons.url1, sideKickBlockValues.ctaButtons.btnLabel1);
				}
				
				if (sideKickBlockValues.ctaButtons.url2) {
					typeCtaButtonsAndLabels(2, sideKickBlockValues.ctaButtons.url2, sideKickBlockValues.ctaButtons.btnLabel2);
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate sidekick block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'SideKick'
				 , sideKickBlockValues.nrSideKickBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , sideKickBlockValues.imageUpload
				 , sideKickBlockValues.bgColourItemNr
				 , sideKickBlockValues.ctaButtons ? sideKickBlockValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editTextBlock = (textBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the text block nr ' + textBlockValues.nrTextBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Text block"]', textBlockValues.nrTextBlockToEdit);
			
			const HEADING_VALUE = textBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-text-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = textBlockValues.descriptionValue ? textBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (textBlockValues.descriptionValue) {
				typeBlockDescription('ucws-text-desc', DESCRIPTION_VALUE);
			}
			
			if (textBlockValues.textAlignment) {
				//select[id*=talignment]
				setTextAlignment(textBlockValues.textAlignment);
			}
			
			if (textBlockValues.numberOfColumns) {
				//select[id*=num-cols]
				selectBlockNumberOfColumns(textBlockValues.numberOfColumns);
			}
			
			if (textBlockValues.roundedCorners) {
				setRoundedCorners(textBlockValues.roundedCorners);
			}
			
			if (textBlockValues.ctaButtons) {
				if (textBlockValues.ctaButtons.url1) {
					typeCtaButtonsAndLabels(1, textBlockValues.ctaButtons.url1, textBlockValues.ctaButtons.btnLabel1);
				}
				
				if (textBlockValues.ctaButtons.url2) {
					typeCtaButtonsAndLabels(2, textBlockValues.ctaButtons.url2, textBlockValues.ctaButtons.btnLabel2);
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate text block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'Text'
				 , textBlockValues.nrTextBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , textBlockValues.numberOfColumns
				 , null
				 , null
				 , textBlockValues.ctaButtons ? textBlockValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editImageBlock = (imageBlockValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the image block nr ' + imageBlockValues.nrTextBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Image block"]', imageBlockValues.nrTextBlockToEdit);
			
			//1. HEADING
			const HEADING_VALUE = imageBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-image-heading', HEADING_VALUE);
			
			//2. Image Upload / Alternative Text / Image Title / Crop (not implemented yet - see the comment in the function)
			uploadBackgroundImage(imageBlockValues.imageUpload, attachmentPath);
			
			//3. Caption For Image
			if (imageBlockValues.captionForImage) {
				const captionForImage = (imageBlockValues.captionForImage).length > 40 ?
				 (imageBlockValues.captionForImage).substring(0, 40) + '...' : imageBlockValues.captionForImage;
				it('type the caption for image as ' + captionForImage, async () => {
					await UofC.setTextFieldValueByCSS('textarea[id*=ucws-image-caption]', imageBlockValues.captionForImage);
				});
			}
			
			//4. Photographer Credit
			if (imageBlockValues.photographerCredit) {
				const photographerCredit = (imageBlockValues.photographerCredit).length > 40 ?
				 (imageBlockValues.photographerCredit).substring(0, 40) + '...' : imageBlockValues.photographerCredit;
				it('type the photographer credit as ' + photographerCredit, async () => {
					await UofC.setTextFieldValueByCSS('input[id*=ucws-image-photo-credit]', imageBlockValues.photographerCredit);
				});
			}
			
			//5. Image Link
			if (imageBlockValues.imageLink) {
				it('type the image link as ' + imageBlockValues.imageLink, async () => {
					await UofC.setTextFieldValueByCSS('input[id*=image-link]', imageBlockValues.imageLink);
				});
			}
			
			//6. Round Image Corners (not same as rounded corners - dropdown vs checkbox)
			// 	input[id*=corners]
			it('set the round image corners checkbox to ' + imageBlockValues.roundedImageCorners, async () => {
				await UofC.setButtonCheckboxByCSS('input[id*=corners]', imageBlockValues.roundedImageCorners);
			});
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate image block\'s edits were applied', () => {
				let imageBlockElements;
				it('the heading of the image block #' + imageBlockValues.nrImageBlockToEdit + ' is ' + HEADING_VALUE, async () => {
					///this is the only place where we set the element - all others below should only use it
					imageBlockElements = await driver.findElements(By.css('div[class*=ucws-image]'));  //hero or non-hero heading (h1 or h2)
					
					//2nd find the header element within the block
					const headingElement = await imageBlockElements[(imageBlockValues.nrImageBlockToEdit - 1)].findElement(By.css('h2'));
					let headingText = await headingElement.getText();
					// console.log('headingText: ' + headingText);
					expect(headingText.toLowerCase()).to.equal(HEADING_VALUE.toLowerCase());
				});
				
				//validate caption (if any)
				if (imageBlockValues.captionForImage) {
					const captionForImage = (imageBlockValues.captionForImage).length > 40 ?
					 (imageBlockValues.captionForImage).substring(0, 40) + '...' : imageBlockValues.captionForImage;
					it('the caption of the image block #' + imageBlockValues.nrImageBlockToEdit + ' is ' + captionForImage, async () => {
						const imageBlockCaption = await imageBlockElements[(imageBlockValues.nrImageBlockToEdit - 1)].findElement(By.css('p.caption'));
						const imageBlockCaptionText = await imageBlockCaption.getText();
						expect(imageBlockCaptionText.toLowerCase()).to.equal((imageBlockValues.captionForImage).toLowerCase());
					});
				}
				
				//validate photographer credit (if any)
				if (imageBlockValues.photographerCredit) {
					const photographerCredit = (imageBlockValues.photographerCredit).length > 40 ?
					 (imageBlockValues.photographerCredit).substring(0, 40) + '...' : imageBlockValues.photographerCredit;
					it('the photographer credit of the image block #' + imageBlockValues.nrImageBlockToEdit + ' is ' + photographerCredit, async () => {
						const imageBlockCredit = await imageBlockElements[(imageBlockValues.nrImageBlockToEdit - 1)].findElement(By.css('p.credit'));
						const imageBlockCreditText = await imageBlockCredit.getText();
						expect(imageBlockCreditText.toLowerCase()).to.equal((imageBlockValues.photographerCredit).toLowerCase());
					});
				}
				
				//validate image's link (if any)
				if (imageBlockValues.imageLink) {
					it('click on the image block\'s image', async () => {
						let imageBlockImageElement = await imageBlockElements[(imageBlockValues.nrImageBlockToEdit - 1)].findElement(By.css('.image-wrapper'));
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', imageBlockImageElement);
						await imageBlockImageElement.click();
					});
					
					switchToOtherTabAndOrVerifyTheUrl(imageBlockValues.imageLink);
					close2ndOpenTabOrNavigateBack();
				}
			});
		});
	};
	
	UofC.editImageWithTextBlock = (imageWithTextBlockValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the image with text block nr ' + imageWithTextBlockValues.nrImageWithTextBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Image with Text block"]', imageWithTextBlockValues.nrImageWithTextBlockToEdit);
			
			//1. HEADING
			const HEADING_VALUE = imageWithTextBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-image-text-heading', HEADING_VALUE);
			
			//2. DESCRIPTION
			const DESCRIPTION_VALUE = imageWithTextBlockValues.descriptionValue ? imageWithTextBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (imageWithTextBlockValues.descriptionValue) {
				typeBlockDescription('ucws-image-text-desc', DESCRIPTION_VALUE);
			}
			
			//3. Text Position
			if (imageWithTextBlockValues.textPosition) {
				setTextPosition(imageWithTextBlockValues.textPosition);
			}
			
			//4. Background Colour
			if (imageWithTextBlockValues.bgColourItemNr) {
				setBackgroundColour(imageWithTextBlockValues.bgColourItemNr);
			}
			
			//5. Image Upload / Alternative Text / Image Title / Crop (not implemented yet - see the comment in the function)
			uploadBackgroundImage(imageWithTextBlockValues.imageUpload, attachmentPath);
			
			if (imageWithTextBlockValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (bannerBlockValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (imageWithTextBlockValues.ctaButtons.url1) {
					typeCtaButtonsAndLabels(1, imageWithTextBlockValues.ctaButtons.url1, imageWithTextBlockValues.ctaButtons.btnLabel1);
				}
			}
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate image with text block\'s edits were applied', () => {
				validateBlockEditsApplied(
				 'Image with Text'
				 , imageWithTextBlockValues.nrImageWithTextBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , null
				 , imageWithTextBlockValues.bgColourItemNr
				 , imageWithTextBlockValues.ctaButtons ? imageWithTextBlockValues.ctaButtons : null);
			});
		});
	};
	
	//THIS ONE NEEDS TOTAL REVAMP (not working in a reusable fashion)
	UofC.editStreamingMediaBlock = (blockHeadingValue, blockDescriptionValue, accessibilityText, captionForMediaValue,
	                                creatorCreditValue, mediaTypeValue, mediaTypeEmbedUrl, extraCssClasses,
	                                createNewRevision, revisionLogMessage) => {
		describe('edit the streaming media block', () => {
			//NOTE: figure out what are the required fields here and add 'ifs' for those which are not
			it('click the edit this block button', async () => {
				// await UofC.clickElementByCSS('.streaming-media .block-editing>a');
				// await UofC.waitForPageLoad();
				// await UofC.waitForObjectLoad('.ui-dialog', waitLong * 3, 1000, true);
				
				const editBlockElements = await UofC.findElementsByCSS('.streaming-media .block-editing>a');
				if (editBlockElements.length > 0) {
					//bring the button into the view
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', editBlockElements[0]);
					editBlockElements[0].click();
					await UofC.waitForPageLoad();
					await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
				} else {
					throw '"edit this block" button could not be found';
				}
			});
			
			it('type the heading as ' + blockHeadingValue, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=ucws-streaming-media-head]', blockHeadingValue);
			});
			
			it('switching to the description iframe', async () => {
				await driver.switchTo().frame(driver.findElement(By.css('div[id*=ucws-streaming-media-desc] iframe')));
			});
			
			it('type the description as ' + blockDescriptionValue, async () => {
				await UofC.setTextFieldValueByCSS('.cke_editable', blockDescriptionValue);
			});
			
			//here might need to switch off the iframe above
			it('switching out of the description iframe', async () => {
				const handles = await driver.getAllWindowHandles();
				await driver.switchTo().window(handles[0]);
			});
			
			it('type the accessibility text as ' + accessibilityText, async () => {
				await UofC.setTextFieldValueByCSS('input[id*=ahead]', accessibilityText);
			});
			
			it('type the caption for media as ' + captionForMediaValue, async () => {
				await UofC.setTextFieldValueByCSS('input[id*=capt]', captionForMediaValue);
			});
			
			it('type the creator credit as ' + creatorCreditValue, async () => {
				await UofC.setTextFieldValueByCSS('input[id*=ccred]', creatorCreditValue);
			});
			
			it('select the media type as ' + mediaTypeValue, async () => {
				//scroll the page down so the drop down is displayed on the top of the page
				const mediaTypeDropDown = await driver.findElements(By.css('select[id*=type]'));
				await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', mediaTypeDropDown[0]);
				await driver.sleep(500);
				await UofC.setSelectDropDownValueByCSS('select[id*=type]', mediaTypeValue);
			});
			
			if (mediaTypeEmbedUrl) {
				it('type the ' + mediaTypeValue.toLowerCase() + ' embed url as ' + mediaTypeEmbedUrl, async () => {
					let mediaTypeEmbedUrlLocator = (mediaTypeValue.toLowerCase() === 'youtube') ? 'input[id*=youem]' : 'input[id*=uri]';
					await UofC.clickElementByCSS(mediaTypeEmbedUrlLocator);
					await UofC.setTextFieldValueByCSS(mediaTypeEmbedUrlLocator, mediaTypeEmbedUrl);
				});
			}
			
			if (mediaTypeValue.toLowerCase() === 'youtube') {
				it('type the ' + mediaTypeValue.toLowerCase(), async () => {
					//hide suggested videos
					
					//doNotShowYTLogo
					
					//use a light coloured bar
					
					//use white video progress bar
					
					//enableUseOfIframeApi
					
					//fixOverlayProblemInIE
					
					console.log('console.log: TODO: youtube parameters section is not yet done -- all as default for now | to update later');  //TODO
				});
			}
			
			if (extraCssClasses) {
				it('type the extra css classes as ' + extraCssClasses, async () => {
					await UofC.setTextFieldValueByCSS('input[id*=css]', extraCssClasses);
				});
			}
			
			if (createNewRevision === 'true') {
				it('set the create new revision checkbox to ' + createNewRevision, async () => {
					await UofC.setButtonCheckboxByCSS('input[id*=edit-revision]', createNewRevision);
				});
				
				it('type the revision log message as ' + revisionLogMessage, async () => {
					await UofC.setTextFieldValueByCSS('textarea[id*=edit-revision-log]', revisionLogMessage);
				});
			}
			
			it('click save button', async () => {
				const saveBtnElements = await driver.findElements(By.css('[id*=edit-submit]'));
				if (saveBtnElements.length > 0) {
					//scroll to the bottom of the page so the button is visible
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', saveBtnElements[0]);
					await driver.sleep(500);
					// const saveBtnElement = await driver.findElements(By.css('[id*=edit-submit]'));
					await saveBtnElements[0].click();
					await UofC.waitForPageLoad();
				} else {
					throw 'save button not found';
				}
			});
			
			describe('validate more info block\'s edits were applied', () => {
				// validate that the confirmation message message is displayed (status)
				let validationMessage = 'More information has been updated.';
				it('validate the confirmation status message contains the "' + validationMessage + '" text', async () => {
					const element = await driver.findElement(By.css('.messages.status:not(h2):not(button)'));
					let text = await element.getText();
					text = text.replace(text.substring(0, text.lastIndexOf('\n') + 1), '').replace(/[0-9]/g, '').replace(/ /g, '');
					expect(text.toLowerCase()).to.equal(validationMessage.replace(/ /g, '').toLowerCase());
				});
				
				// const confirmationMessage = 'Streaming Media ' + '729' + ' has been updated';
				// // validate that the confirmation message message is displayed (status)
				// UofC.validateDisplayedTextEquals('.messages.status:not(h2):not(button)', confirmationMessage);
				
				it('close the status message popup', async () => {
					await UofC.clickElementByCSS('.messages.status>button');
				});
				
				
				it('close the status message popup', async () => {
					await UofC.clickElementByCSS('.messages.status>button');
					await driver.sleep(500);
				});
				
				//validate inserted values are displayed on the screen
				UofC.validateDisplayedTextEquals('.header h2', blockHeadingValue);
				UofC.validateDisplayedTextEquals('.header p', blockDescriptionValue);
				UofC.validateDisplayedTextEquals('p.caption', captionForMediaValue);
				UofC.validateDisplayedTextEquals('p.credit', creatorCreditValue);
				
				//validate css parameters are correct
				it('find ' + mediaTypeValue + ' container\'s margin bottom size and make sure it is not higher than 15px', async () => {
					const mediaTypeElements = await UofC.findElementsByCSS('.youtube-container');
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
					const captionElements = await UofC.findElementsByCSS('p.caption');
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
					const creatorCreditElements = await UofC.findElementsByCSS('p.credit');
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
		});
	};
	
	
	//------------------------------------------------------------------------------------------------------------------
	//EDIT BLOCKS COMMON REUSABLE SUB-FUNCTIONS ------------------------------------------------------------------------
	const clickEditBlockButton = async (editThisBlockCssLocator, editBlockBtnNr) => {
	//USAGE: clickEditBlockButton('div.block a[title="Edit Banner block"]', bannerBlockValues.nrBannerBlockToEdit);
		before(async () => {
			await UofC.hideElementByCSS('.insightera-bar');
			await UofC.hideElementByCSS('.insightera-tab-container');
		});
		
		it('click the edit this block button', async () => {
			const EDIT_BLOCK_ELEMENTS = await UofC.findElementsByCSS(editThisBlockCssLocator);
			if (EDIT_BLOCK_ELEMENTS.length > 0 && !(EDIT_BLOCK_ELEMENTS.length < editBlockBtnNr)) {
				//bring the button into the view
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});',
				 EDIT_BLOCK_ELEMENTS[editBlockBtnNr ? (editBlockBtnNr - 1) : 0]);
				await driver.sleep(500);
				EDIT_BLOCK_ELEMENTS[editBlockBtnNr ? (editBlockBtnNr - 1) : 0].click();
				await UofC.waitForPageLoad();
				await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
			} else {
				throw '\'edit this block\' button could not be found, the css locator is: ' + editThisBlockCssLocator +
				' and the element # is: ' + editBlockBtnNr;
			}
		});
	};
	
	const clickBlockConfigurationButton = async (blockCssLocator, blockNr, configurationAction) => {
		before(async () => {
			await UofC.hideElementByCSS('.insightera-bar');
			await UofC.hideElementByCSS('.insightera-tab-container');
		});
		
		let BLOCK_ELEMENTS;
		blockNr = blockNr ? (blockNr - 1) : 0;
		configurationAction = configurationAction.includes(' block') ?
		 (configurationAction.replace(' block', '')).toLowerCase() : configurationAction.toLowerCase();
		it('mouse over the block we want to ' + configurationAction, async () => {
			BLOCK_ELEMENTS = await UofC.findElementsByCSS(blockCssLocator);
			if (BLOCK_ELEMENTS.length > 0 && !(BLOCK_ELEMENTS.length < blockNr)) {
				//bring the block into the view
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', BLOCK_ELEMENTS[blockNr]);
				await UofC.mouseHover(BLOCK_ELEMENTS[blockNr]);
			} else {
				throw 'the \'' + blockCssLocator + '\' block #' + blockNr + ' could not be found';
			}
		});
		
		it('click the ' + configurationAction + ' button', async () => {
			//find the hidden block's configuration button
			const BLOCK_ELEMENT = await BLOCK_ELEMENTS[blockNr].findElement(By.xpath('..'));
			const CONFIG_BTN_ELEMENT = await BLOCK_ELEMENT.findElement(By.css('button'));
			//bring the configuration button into the view
			await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', CONFIG_BTN_ELEMENT);
			await driver.sleep(500);
			// console.log('CONFIG_BTN_ELEMENT.getText(): ' + (await CONFIG_BTN_ELEMENT.getText()));
			//click the Configuration button
			await CONFIG_BTN_ELEMENT.click();
			
			const CONFIG_SUBMENU_BTN_ELEMENT = await BLOCK_ELEMENT.findElement(By.css('li[class*=block-' + configurationAction + ']>a'));
			// console.log('CONFIG_SUBMENU_BTN_ELEMENT.getText(): ' + (await CONFIG_SUBMENU_BTN_ELEMENT.getText()));
			//click the configurationAction button
			await CONFIG_SUBMENU_BTN_ELEMENT.click();
			
			await UofC.waitForPageLoad();
			await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
		});
	};
	
	const typeBlockHeading = async (headingFieldCssLocator, headingValue) => {
		const blockHeadingValue = headingValue.length > 40 ? headingValue.substring(0, 40) + '...' : headingValue;
		it('type the heading as ' + blockHeadingValue, async () => {
			await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=' + headingFieldCssLocator + ']', headingValue);
		});
	};
	
	const typeBlockDescription = async (descFrameCssLocator, descriptionValue) => {
		const blockDescriptionValue = descriptionValue.length > 40? descriptionValue.substring(0, 40) + '...' : descriptionValue;
		it('switching to the description iframe', async () => {
			await driver.switchTo().frame(driver.findElement(By.css('div[id*=' + descFrameCssLocator + '] iframe')));
		});
		
		it('type the description as ' + blockDescriptionValue, async () => {
			await UofC.setTextFieldValueByCSS('.cke_editable', descriptionValue);
		});
		
		//here might need to switch off the iframe above
		it('switching out of the description iframe', async () => {
			const HANDLES = await driver.getAllWindowHandles();
			await driver.switchTo().window(HANDLES[0]);
		});
	};
	
	//USAGES:   HERO CTA, BANNER,
	const setTextAlignment = async (textAlignment) => {
		it('select the text alignment as ' + textAlignment, async () => {
			await UofC.setSelectDropDownValueByCSS('select[id*=talignment]', textAlignment);
		});
	};
	
	//*REQUIRED   ->  USAGES:   HERO CTA, BANNER, SIDEKICK CTA,
	const setTextPosition = async (textPosition) => {
		it('select the text position as ' + textPosition, async () => {
			await UofC.setSelectDropDownValueByCSS('select[id*=edit-field-ucws][id*=tpos]', textPosition);
		});
	};
	
	// Default Value - Left
	// USAGES:   HERO CTA, BANNER, IMAGE, IMAGE GALLERY, SIDEKICK CTA,
	const uploadBackgroundImage = async (imageUploadValues, attachmentPath) => {
		const BACKGROUND_IMAGE = imageUploadValues.backgroundImage;
		const imagePreviewAndLinkLocator = BACKGROUND_IMAGE.substring(0, BACKGROUND_IMAGE.lastIndexOf('.'));//remove the . and everything afterwards
		
		if (imageUploadValues.bgImageStyle) {
			it('select the background image style as ' + imageUploadValues.bgImageStyle, async () => {
				const bgImageElement = await driver.findElement(By.css('select[id*=bgimg-style]'));
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', bgImageElement);
				
				// await UofC.setSelectDropDownValueByCSS('select[id*=ucws-banner-bgimg-style]', bannerBlockValues.bgImageStyle);
				await UofC.setSelectDropDownValueByCSS('select[id*=bgimg-style]', imageUploadValues.bgImageStyle);
			});
		}
		
		it('upload the ' + BACKGROUND_IMAGE + ' background image', async () => {
			await UofC.setFileUploadByCSS('input[id*=upload][type=file]', attachmentPath);
		});
		
		it('validate that image\'s preview and the ' + BACKGROUND_IMAGE + ' link are displayed', async () => {
			await UofC.waitForObjectLoad('img[data-drupal-selector*=preview]', waitLong * 3, 500, true);
			
			//validate image link is displayed
			await UofC.waitForObjectLoad('a[href*="' + imagePreviewAndLinkLocator + '"]', waitLong, 500, true);
		});
		
		//validate that the image link contains the correct title
		UofC.validateDisplayedTextContains('a[href*="' + imagePreviewAndLinkLocator + '"]', imagePreviewAndLinkLocator);
		
		const IMAGE_ALT_TEXT = imageUploadValues.imageAltText + ' ' + Math.floor((Math.random() * 100) + 1);
		it('type the alternative text as ' + IMAGE_ALT_TEXT, async () => {
			await UofC.setTextFieldValueByCSS('input[id*=alt]', IMAGE_ALT_TEXT);
		});
		
		if (imageUploadValues.imageTitle) { //this only exists for the Image Block
			it('type the title as ' + imageUploadValues.imageTitle, async () => {
				await UofC.setTextFieldValueByCSS('input[id*=image][id*=title]', imageUploadValues.imageTitle);
			});
		}
		
		//crop image - this functionality is not yet done - Keanu said it is not used and there isn't much we can
		// test as this is more of a visual validation of few different cropping options --- DISABLED FOR NOW <--- OLD COMMENT
		//NOTE: 2014.04.18 - this functionality already works but not well enough yet --- might get some changes/updates later
		// the issue is that changing the style of the page but clicking the Desktop / Mobile / Tablet does nothing, user
		// has to save then just change browser's window size -- which is not something to waste the time on now, pressing
		// the buttons should resize the image example or something and then I could retrieve the size and compare with expected
		/* //to be developed when functionality's requirements are clear
		if (imageUploadValues.cropImage) {
			if cropImage = true then:
			1. expand the Crop image section
			2. click one of the crop links - select the area of the image that will appear to users
			3. check that the text of select crop option is displayed underneath the available options links
		}
		*/
	};
	
	const setOverlaidTextColour = async (overlaidTextColour) => {
		it('select the overlaid text colour as ' + overlaidTextColour, async () => {
			await UofC.setSelectDropDownValueByCSS('select[id*=tcolour]', overlaidTextColour);
		});
	};
	
	const setDoNotApplyGradient = async (doNotApplyGradientValue) => {
		it('set the do not apply gradient checkbox to ' + doNotApplyGradientValue, async () => {
			await UofC.setButtonCheckboxByCSS('input[id*=gradient-value]', doNotApplyGradientValue);
		});
	};
	
	//USAGES:   HERO CTA, BANNER, CHECKLIST, SIDEKICK CTA,
	//NOTE: the value of bgColor should be numeric (from 1 to 8) to match available colors & css locators
	const setBackgroundColour = async (bgColourItemNr) => {
		//validate that the parameter matches the available values
		if (bgColourItemNr > 8 || bgColourItemNr < 1) {
			throw 'bgColourItemNr is ' + bgColourItemNr + ' but it should be between 1 and 8, please correct the data';
		}
		
		let color1, color2, color3, color4, color5, color6, color7, color8;
		color1 = '#CF0722';
		color2 = '#FF671F';
		color3 = '#FFA300';
		color4 = '#CE0058';
		color5 = '#A6192E';
		color6 = '#6B3529';
		color7 = '#8D827A';
		color8 = '#FFFFFF';
		
		// const BG_COLOR = bgColourItemNr;
		let selectedColor = (bgColourItemNr === 1) ? color1 : (bgColourItemNr === 2) ? color2 : (bgColourItemNr === 3) ? color3 :
		 (bgColourItemNr === 4) ? color4 : (bgColourItemNr === 5) ? color5 : (bgColourItemNr === 6) ? color6 :
			(bgColourItemNr === 7) ? color7 : (bgColourItemNr === 8) ? color8 : 'this color is not available: ' + bgColourItemNr;
		// console.log('selectedColor: ' + selectedColor);
		
		it('set the background color to ' + selectedColor, async () => {
			//bring the button to the screen:
			//'button[class*=color][color*="' + selectedColor + '"]'
			const colorBtnElement = await driver.findElement(By.css('button[class*=color][color*="' + selectedColor + '"]'));
			// await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', colorBtnElement);
			await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', colorBtnElement);
			await colorBtnElement.click();
			//css another e.g. which works: button[class*=color][color*="#FF671F"] OR button[color*="#FF671F"]
			// await UofC.clickElementByCSS('button[class*=color][color*="' + selectedColor + '"]');
		});
	};
	
	//USAGES:   BANNER, CHECKLIST, SIDEKICK CTA,
	///NOTE !!!!! ---- there is a checkbox also, called "Round image corners" -- IMAGE,
	const setRoundedCorners = async (roundedCornersValue) => {
		it('select the rounded corners as ' + roundedCornersValue, async () => {
			//select[id*=ucws-banner-round-corners]
			//select[id*=ucws-more-info-rcorners]
			// const ROUNDED_CORNERS_ELEMENT_LOCATOR = 'select[id*=ucws-' + blockType + '-round-corners]';
			await UofC.setSelectDropDownValueByCSS('select[id*=corners]', roundedCornersValue);
		});
	};
	
	const typeCtaButtonsAndLabels = async (buttonNr, buttonUrl, buttonLabel) => {
		if (buttonUrl && buttonLabel) {
			it('type the url of button #' + buttonNr + ' as ' + buttonUrl, async () => {
				//input[id*=cta-0-uri]  OR   input[id*=cta-1-uri]
				await UofC.setTextFieldValueByCSS('input[id*=cta-' + (buttonNr - 1) + '-uri]', buttonUrl);
			});
			
			it('type the label of button #' + buttonNr + ' as ' + buttonLabel, async () => {
				//input[id*=cta-1-title]  OR   input[id*=cta-1-title]
				await UofC.setTextFieldValueByCSS('input[id*=cta-' + (buttonNr - 1) + '-title]', buttonLabel);
			});
		} else {
			throw 'button\'s URL or Label is not defined but should be!\nbuttonUrl: ' + buttonUrl + '\nbuttonLabel: ' + buttonLabel;
		}
	};
	
	const clickSaveButtonAfterBlockEdited = async () => {
		it('click save button', async () => {
			const SAVE_BTN_ELEMENTS = await driver.findElements(By.css('[id*=edit-submit]'));
			if (SAVE_BTN_ELEMENTS.length > 0) {
				//scroll to the bottom of the page so the button is visible
				await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});',
				 SAVE_BTN_ELEMENTS[0]);
				await driver.sleep(500);
				await SAVE_BTN_ELEMENTS[0].click();
				await UofC.waitForPageLoad();
			} else {
				throw 'save button not found';
			}
			
			await UofC.hideElementByCSS('.insightera-bar-shadow-bottom');
		});
	};
	
	const selectBlockNumberOfColumns = async (numberOfColumnsValue) => {
		it('select the number of columns for this block as ' + numberOfColumnsValue, async () => {
			await UofC.setSelectDropDownValueByCSS('select[id*=num-cols]', numberOfColumnsValue);
		});
	};
	
	const validateBlockEditsApplied = async (blockType, blockNumber, headingValue, descriptionValue, numberOfColumns,
	                                         displayStyle, bgColourItemNr, ctaButtons) => {
		before(async () => {
			//yellow bottom bar & yellow navigation up arrow
			await UofC.hideElementByCSS('.insightera-bar');
			await UofC.hideElementByCSS('.insightera-tab-container');
			
			//viewport dimensions bottom div
			//await UofC.hideElementByCSS('#window-size');
		});
		
		//if block# was not declared then set it to 1 by default (e.g.: hero blocks are always 1)
		blockNumber = blockNumber ? blockNumber : 1;  //block number is always 1 if not declared (else whatever was declared)
		
		//TODO: figure out if this this function can be done as one for all block types and finish it if doable
		const popupMessage = ((blockType.toLowerCase().includes('more info')) ? 'More Information' :
		 (blockType.toLowerCase().includes('sidekick')) ? 'Sidekick CTA' : blockType) + ' has been updated.';
		UofC.popUpConfirmation(popupMessage, waitShort);  //Image with Text (this is how it is for this block type)
		
		//******************************************************************************************************************
		const blockCssLocator = (blockType.toLowerCase()).includes('image with text') ?
		 'div[class*=ucws-' + ((blockType.toLowerCase()).replace(/ /gi, '-')).replace('-with-text', '_text') + ']' :
		 'div[class*=ucws-' + (blockType.toLowerCase()).replace(/ /gi, '-') + ']';
		let blockElements;
		//******************************************************************************************************************
		//1. check HEADING -- headingValue / field is required
		it('the heading of the ' + blockType + ' block is ' + headingValue, async () => {
			///this is the only place where we set the element - all others below should only use it
			blockElements = await driver.findElements(By.css(blockCssLocator));  //hero or non-hero heading (h1 or h2)
			
			//2nd find the header element within the block
			const headingElement = await blockElements[(blockNumber - 1)].findElement(By.css('h' +
			 (blockType.toLowerCase().includes('hero') ? 1 : 2)));
			let headingText = await headingElement.getText();
			// console.log('headingText: ' + headingText);
			expect(headingText.toLowerCase()).to.equal(headingValue.toLowerCase());
		});
		
		//2. check DESCRIPTION -- descriptionValue / field not required
		if (descriptionValue) {
			const blockDescriptionValue = descriptionValue.length > 40 ? descriptionValue.substring(0, 40) + '...' : descriptionValue;
			it('the description of the ' + blockType + ' block is ' + blockDescriptionValue, async () => {
				const descriptionElement = await blockElements[(blockNumber - 1)].findElement(By.css('p'));
				let descriptionText = await descriptionElement.getText();
				// console.log('descriptionText: ' + descriptionText);
				expect(descriptionText.toLowerCase()).to.equal(descriptionValue.toLowerCase());
			});
		}
		
		//3. check NUMBER OF COLUMNS -- numberOfColumns / not required --- BLOCKS: Text / ???)
		if (numberOfColumns) {
			it('the number of columns within the ' + blockType + ' block is ' + numberOfColumns, async () => {
				const columnsElement = await driver.findElement(By.css('div[class*=layout-blocks-ucws-text] div[class*=-col]'));
				const elementClass = await columnsElement.getAttribute('class');
				
				if (numberOfColumns.includes('1')) {
					numberOfColumns = 'one';
				} else if (numberOfColumns.includes('2')) {
					numberOfColumns = 'two';
				}
				
				const expectedClass = numberOfColumns + '-col';
				expect(elementClass.toLowerCase()).to.contain(expectedClass.toLowerCase());
			});
		}
		
		//4. check DISPLAY STYLE -- displayStyle / field not required OR imageUpload.backgroundImage exists
		////4.1 --------------------- BACKGROUND IMAGE --------------------------------------------
		//if (displayStyle && displayStyle === 'Background Image') {
		if ((displayStyle && displayStyle === 'Background Image') || displayStyle.backgroundImage) {
			//4. check image's size is at least w1024*h800 (was 990x600px)
			it('block\'s background image\'s size is at least 800px high'/* and 1024px wide'*/, async () => {
				const bgImageElement = await blockElements[(blockNumber - 1)].findElement(By.css('[style*=background-image]'));
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', bgImageElement);
				
				// const IMG_WIDTH = await bgImageElement.getCssValue('width');
				const IMG_HEIGHT = await bgImageElement.getCssValue('height');
				
				// console.log('\nIMG_WIDTH: ' + IMG_WIDTH + '\nIMG_HEIGHT: ' + IMG_HEIGHT);
				console.log('IMG_HEIGHT: ' + IMG_HEIGHT);
				if (parseInt(parseInt(IMG_HEIGHT.replace('px', '')) < 800)) {
					throw 'background-image\'s height is less than 800px: ' + '-> actual height is: ' + IMG_HEIGHT;
				}
			});
		////4.2 --------------------- BACKGROUND COLOUR -------------------------------------------
		} else if(displayStyle && displayStyle === 'Background Colour') {
			if (bgColourItemNr) {
				if (bgColourItemNr > 8 || bgColourItemNr < 1) {
					throw 'bgColourItemNr is ' + bgColourItemNr + ' but it should be between 1 and 8, please correct the data';
				}
				
				let color1, color2, color3, color4, color5, color6, color7, color8;
				color1 = '#CF0722';
				color2 = '#FF671F';
				color3 = '#FFA300';
				color4 = '#CE0058';
				color5 = '#A6192E';
				color6 = '#6B3529';
				color7 = '#8D827A';
				color8 = '#FFFFFF';
				
				let selectedColor = (bgColourItemNr === 1) ? color1 : (bgColourItemNr === 2) ? color2 : (bgColourItemNr === 3) ?
				 color3 : (bgColourItemNr === 4) ? color4 : (bgColourItemNr === 5) ? color5 : (bgColourItemNr === 6) ? color6 :
					(bgColourItemNr === 7) ? color7 : (bgColourItemNr === 8) ? color8 : 'this color is not available: ' + bgColourItemNr;
				// console.log('selectedColor: ' + selectedColor);
				
				//find the block & retrieve it's bg color and compare with the expected color
				it('block\'s background colour is ' + selectedColor, async () => {
					const bgElement = await blockElements[(blockNumber - 1)].findElement(By.css('div.row'));
					await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', bgElement);
					let elementBgColour = await bgElement.getCssValue('background-color');  //rgba(207, 7, 34, 1) -> red
					elementBgColour = await returnHexColor(elementBgColour);  //transform from rgb to hex
					// console.log('elementBgColour: ' + elementBgColour);
					expect(elementBgColour.toLowerCase()).to.equal(selectedColor.toLowerCase());
				});
			} //else here leaves the colour to the default select one
		} else {
			// throw 'displayStyle can equal only to Background Image or Colour, now it is: ' + displayStyle;
			console.log('displayStyle can equal only to Background Image or Colour, now it is: ' + displayStyle);
		}
		
		//5. check CTA -- btn's label, click on it and validate the correct URL loads in a new tab
		// close the tab and do same for 2nd CTA btn if it got added above
		//TODO: review if I can somehow modify this piece of the function and make it smaller (it repeats twice, for URL1 & URL2)
		if (ctaButtons && ctaButtons.btnLabel1) {
			let ctaButtonElements, ctaButtonElement;
			it('the cta button 1 label\'s text equals to ' + ctaButtons.btnLabel1, async () => {
				//ctaButton1Element = await blockElements[(blockNumber - 1)].findElement(By.css('.btn-wrapper>a:nth-child(1)'));
				ctaButtonElements = await blockElements[(blockNumber - 1)].findElements(By.css('a.btn-default')); //was: .btn-wrapper
				ctaButtonElement = ctaButtonElements[0];
				const ctaButton1LabelText = await ctaButtonElement.getText();
				// console.log('ctaButton1LabelText: ' + ctaButton1LabelText);
				expect(ctaButton1LabelText.toLowerCase()).to.equal((ctaButtons.btnLabel1).toLowerCase());
			});
			
			it('click the ' + ctaButtons.btnLabel1 + ' button', async () => {
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', ctaButtonElement);
				await ctaButtonElement.click();
			});
			
			switchToOtherTabAndOrVerifyTheUrl(ctaButtons.url1);
			close2ndOpenTabOrNavigateBack();
		}
		
		if (ctaButtons && ctaButtons.btnLabel2) {
			let ctaButtonElements, ctaButtonElement;
			it('the cta button 2 label\'s text equals to ' + ctaButtons.btnLabel2, async () => {
				ctaButtonElements = await blockElements[(blockNumber - 1)].findElements(By.css('a.btn-default'));
				ctaButtonElement = ctaButtonElements[1];
				const ctaButton2LabelText = await ctaButtonElement.getText();
				// console.log('ctaButton2LabelText: ' + ctaButton2LabelText);
				expect(ctaButton2LabelText.toLowerCase()).to.equal((ctaButtons.btnLabel2).toLowerCase());
			});
			
			it('click the ' + ctaButtons.btnLabel2 + ' button', async () => {
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', ctaButtonElement);
				await ctaButtonElement.click();
			});
			
			switchToOtherTabAndOrVerifyTheUrl(ctaButtons.url2);
			close2ndOpenTabOrNavigateBack();
		}
	};
	
	const switchToOtherTabAndOrVerifyTheUrl = async (expectedUrl) => {
		it('if another tab loaded switch to it either verify that the current url includes ' + expectedUrl, async () => {
			//get all tabs and switch to the newly created one
			const HANDLES = await driver.getAllWindowHandles();
			let actualUrl;
			//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
			// navigate back in the browser
			if (HANDLES.length > 1 && HANDLES.length < 3) {
				//switch to the other tab
				await driver.switchTo().window(HANDLES[1]); //there are / should be only 2 tabs -> [0] & [1]
				await UofC.waitForPageLoad();
				actualUrl = await driver.getCurrentUrl();
				expect(actualUrl.toLowerCase()).to.include(expectedUrl.toLowerCase());
			} else if (HANDLES.length === 1) {
				actualUrl = await driver.getCurrentUrl();
				expect(actualUrl.toLowerCase()).to.include(expectedUrl.toLowerCase());
			} else {
				throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
				HANDLES.length + ' tabs displayed in the browser';
			}
			// console.log('\nactualUrl is: ' + actualUrl + '\nincluded in url: ' + expectedUrl);
		});
	};
	
	const close2ndOpenTabOrNavigateBack = async () => {
		it('close the opened tab if multiple exist either navigate back in the browser', async () => {
			const HANDLES = await driver.getAllWindowHandles();
			//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
			// navigate back in the browser - we should be on the 2nd tab already - from the step above
			if (HANDLES.length > 1 && HANDLES.length < 3) {
				//close the recently opened tab and switch back to tab[0] - 1st one:
				await driver.close();
				await driver.switchTo().window(HANDLES[0]);
				// await driver.sleep(500);
			} else if (HANDLES.length === 1) {
				//navigate back in the browser / actual tab
				await driver.navigate().back();
				// await driver.sleep(500);
			} else {
				throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
				HANDLES.length + ' tabs displayed in the browser';
			}
		});
	};
	
	const returnHexColor = async (rgbORrgbaColor) => {
		const rgb2hex = require('rgb2hex');
		// let hexColor = await rgb2hex(rgbORrgbaColor).hex;
		// console.log(hexColor);
		return await rgb2hex(rgbORrgbaColor).hex;
	};
	
	//EDIT BLOCKS COMMON REUSABLE SUB-FUNCTIONS ------------------------------------------------------------------------
	//------------------------------------------------------------------------------------------------------------------
	
	
	UofC.clickLayoutActionButtons = (btnName, expectedMessageStatusText) => {
		let fullBtnName = (btnName.toLowerCase() === 'save') ? 'save page layout' :
		 (btnName.toLowerCase() === 'cancel') ? 'cancel layout' : (btnName.toLowerCase() === 'revert') ?
			'revert to defaults' : (btnName.toLowerCase() === 'clone') ?
			 'clone page layout' : 'this option is not available: ' + btnName;
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function clicks one of the layout action buttons (Save / Cancel / Revert / Clone)
						then will check a message text to be expected and validate against it
						will also close the message popup after the text is validated
	
		ACCEPTED PARAMETER(S) AND VALUES:
		btnName     only next 3 values are accepted - save, cancel, revert (nothing else will work)
	
		USAGE:      UofC.clickLayoutActionButtons('save');
					UofC.clickLayoutActionButtons('cancel');
					UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
		------------------------------------------------------------------------------------------------------------- */
		//stop the test when the used button name is not a match / is wrong:
		if (fullBtnName.includes('this option is not available')) {
			throw 'clicking layout action button not possible as ' + fullBtnName;
		}
		
		it('click ' + fullBtnName + ' button', async () => {
			//find the button
			let btnElement = await driver.findElement(By.css('a[href*=' + btnName.toLowerCase() + ']')); //.secondary.pagination>:nth-child(1)>a
			
			//scroll to the top of the page so the button is visible
			await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', btnElement);
			//click the btnElement button
			await btnElement.click();
			await UofC.waitForPageLoad();
		});
		
		if (expectedMessageStatusText) {
			UofC.validateDisplayedTextEquals('.messages.status', expectedMessageStatusText);
			
			it('close the status message popup', async () => {
				await UofC.clickElementByCSS('.messages.status>button');
				await UofC.waitForPageLoad();
			});
		}
	};
	
	
	return UofC;
})();

module.exports = UofC;
