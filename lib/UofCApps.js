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
					it('set the published checkbox to ' + newPageParameters.isPublished, async () => {
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
		describe('delete a basic page', () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			//set up the variable used across the function:
			const deleteConfirmationMessage = 'The Basic page ' + pageTitle + ' has been deleted.';
			
			// describe('delete the created page', () => {
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
			// });
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
		describe('click the add block btn nr ' + addBlockValues.addBlockBtnNr + ' then hit the ' +
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
			it('reusable checkbox is false as default', async () => {
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
	
	//TODO: write this function when needed
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
				setTextPosition(ctaHeroValues.textPosition);
			}
			
			if (ctaHeroValues.textAlignment) {
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
				
				const validationValues = {
					"blockType": "Hero CTA",
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"imageUpload": ctaHeroValues.imageUpload,
					"bgColourItemNr": ctaHeroValues.bgColourItemNr,
					"ctaButtons": ctaHeroValues.ctaButtons ? ctaHeroValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				// validateBlockEditsApplied(
				//  'Hero CTA'
				//  , null
				//  , HEADING_VALUE
				//  , DESCRIPTION_VALUE
				//  , null
				//  , ctaHeroValues.displayStyle
				//  , ctaHeroValues.bgColourItemNr
				//  , ctaHeroValues.ctaButtons ? ctaHeroValues.ctaButtons : null);
			});
		});
	};
	
	UofC.editTextHeroCTABlock = (ctaTextHeroValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the text hero cta block', () => {
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
				const validationValues = {
					"blockType": "Text Hero CTA",
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"imageUpload": ctaTextHeroValues.imageUpload,
					"ctaButtons": ctaTextHeroValues.ctaButtons ? ctaTextHeroValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				/*
				validateBlockEditsApplied(
				 'Text Hero CTA'
				 , null
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , ctaTextHeroValues.displayStyle
				 , ctaTextHeroValues.bgColourItemNr
				 , ctaTextHeroValues.ctaButtons ? ctaTextHeroValues.ctaButtons : null);
				 */
			});
		});
	};
	
	UofC.editAccordionBlock = (accordionBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the accordion block nr ' + accordionBlockValues.nrAccordionBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Accordion block"]', accordionBlockValues.nrAccordionBlockToEdit);
			
			const HEADING_VALUE = accordionBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-accordion-heading', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = accordionBlockValues.descriptionValue ? accordionBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (accordionBlockValues.descriptionValue) {
				typeBlockDescription('ucws-accordion-desc', DESCRIPTION_VALUE);
			}
			
			if (accordionBlockValues.accordionContentSections) {
				for (let i = 0; i < accordionBlockValues.accordionContentSections.length; i++) {
					describe('add accordion content #' + (i + 1), () => {
						//content blocks locators:
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1)  //content #1 -- no sections exist unless add section is clicked
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2)  //content #2 -- no sections exist unless add section is clicked
						//********************************************************************************************************
						// 1. click add accordion button in a loop
						it('click add accordion content section button time ' + i, async () => {
							UofC.clickElementByCSS('input[id*=ucws-accordion-item-add]');
							
							//validate accordion content's heading is there -  'tr.draggable:nth-child(#) input[name*=item_headng]'
							// await UofC.waitForObjectLoad('.ui-dialog tr.draggable:nth-child('+ (i + 1) + ') input[name*=item_headng]');
							await UofC.waitForObjectLoad('table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
							 (i + 1) + ') input[name*=item_headng]', waitLong * 3, 500, true);
						});
						
						// 2. type accordion content heading  | content heading locators:
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) input[name*=item_headng] //content #1 heading
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) input[name*=item_headng] //content #2 heading
						it('type the ' + accordionBlockValues.accordionContentSections[i].contentHeading + ' accordion content heading #' + (i + 1), async () => {
							const contentHeadingCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
							 (i + 1) + ') input[name*=item_headng]';
							await UofC.setTextFieldValueByCSS(contentHeadingCssLocator,
							 accordionBlockValues.accordionContentSections[i].contentHeading);
						});
						
						// 3. type accordion content description  | content description locators:
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) iframe[title*="Accordion description"] //content #1 description
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) iframe[title*="Accordion description"] //content #2 description
						if (accordionBlockValues.accordionContentSections[i].contentDescription) {
							it('switching to the accordion content\'s description iframe #' + (i + 1), async () => {
								const contentDescriptionIFrameCssLocator = '.ui-dialog tr.draggable:nth-child(' +
								 (i + 1) + ') iframe[title*="Accordion description"]';
								await driver.switchTo().frame(driver.findElement(By.css(contentDescriptionIFrameCssLocator)));
							});
							
							it('type the accordion content #' + (i + 1) + ' description as ' +
							 (accordionBlockValues.accordionContentSections[i].contentDescription).substring(0, 40), async () => {
								await UofC.setTextFieldValueByCSS('.cke_editable', accordionBlockValues.accordionContentSections[i].contentDescription);
							});
							
							it('switching out of the description iframe', async () => {
								const handles = await driver.getAllWindowHandles();
								await driver.switchTo().window(handles[0]);
							});
						}
						
						// 4. select accordion content number of columns  | content number of columns locators:
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) select[id*=num][id*=col] //content #1 number of columns
						// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) select[id*=num][id*=col] //content #2 number of columns
						if (accordionBlockValues.accordionContentSections[i].numberOfColumns) {
							selectBlockNumberOfColumns((i + 1), accordionBlockValues.accordionContentSections[i].numberOfColumns);
						}
						
						// 5. Accordion Content[#] Sections
						if (accordionBlockValues.accordionContentSections[i].accordionSections) {
							//content sections locators:
							// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) //content #1 section #1
							// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) //content #1 section #2
							// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) //content #2 section #1
							// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(2) //content #1 section #2
							for (let j = 0; j < accordionBlockValues.accordionContentSections[i].accordionSections.length; j++) {
								describe('add section #' +  (j + 1) + ' to the accordion content #' + (i + 1), () => {
									//5.0 sections remove btn locators:
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) input[name*=remove] //content #1 section #1 remove
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) input[name*=remove] //content #1 section #2 remove
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) input[name*=remove] //content #2 section #1 remove
									
									if (j > 0) {
										//click the Add Accordion Content Section
										//table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) input[name*=accordion_section_add_more]
										//table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) input[name*=accordion_section_add_more]
										it('click add accordion content section button to add the section ' + (i + 1), async () => {
											UofC.clickElementByCSS('table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child('+
											 (i + 1) + ') input[name*=accordion_section_add_more]');
											
											//validate accordion content's heading is there -  'tr.draggable:nth-child(#) input[name*=item_headng]'
											// await UofC.waitForObjectLoad('.ui-dialog tr.draggable:nth-child('+ (i + 1) + ') input[name*=item_headng]');
											await UofC.waitForObjectLoad('table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
											 (i + 1) + ') .draggable:nth-child(' + (j + 1) + ') input[name*=section_hdg]', waitLong * 5, 500, true);
										});
									}
									
									//5.1: accordion content[i] section [j] - type section's heading  | sections heading field locators:
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) input[name*=section_hdg] //content #1 section #1 heading
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) input[name*=section_hdg] //content #1 section #2 heading
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) input[name*=section_hdg] //content #2 section #1 heading
									it('type the ' + accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionHeading +
									 ' accordion content #' + i + ' section #' + j + ' heading', async () => {
										const sectionHeadingCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
										 (i + 1) + ') .draggable:nth-child(' + (j + 1) + ') input[name*=section_hdg]';
										await UofC.setTextFieldValueByCSS(sectionHeadingCssLocator,
										 accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionHeading);
									});
									
									//5.2: accordion content[i] section [j] - type section's description  | sections description iframe's locators:
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) iframe[title*="Section description"] //content #1 section #1 description iframe
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) iframe[title*="Section description"] //content #1 section #2 description iframe
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) iframe[title*="Section description"] //content #2 section #1 description iframe
									if (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionDescription) {
										it('switching to the accordion content #' + (i + 1) + ' section #' + (j + 1) + ' description iframe', async () => {
											const sectionDescriptionIFrameLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
											 (i + 1) + ') .draggable:nth-child(' + (j + 1) + ') iframe[title*="Section description"]';
											await driver.switchTo().frame(driver.findElement(By.css(sectionDescriptionIFrameLocator)));
										});
										
										it('type the accordion content #' + (i + 1) + ' section # ' + (j + 1) + ' description as ' +
										 (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionDescription).substring(0, 40), async () => {
											await UofC.setTextFieldValueByCSS('.cke_editable', accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionDescription);
										});
										
										it('switching out of the description iframe', async () => {
											const handles = await driver.getAllWindowHandles();
											await driver.switchTo().window(handles[0]);
										});
									}
									
									// 5.3: accordion content[i] section [j] - set the Numbered step checkbox's value (true/false)  | sections numbered step checkbox locators:
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) input[type=checkbox][name*=nst] //content #1 section #1 numbered step checkbox
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) input[type=checkbox][name*=nst] //content #1 section #2 numbered step checkbox
									// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) input[type=checkbox][name*=nst] //content #2 section #1 numbered step checkbox
									if (accordionBlockValues.accordionContentSections[i].accordionSections[j].numberedStep) {
										it('set the numbered step checkbox to ' +
										 accordionBlockValues.accordionContentSections[i].accordionSections[j].numberedStep, async () => {
											const numberedStepCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
											 (i + 1) + ') .draggable:nth-child(' + (j + 1) + ') input[type=checkbox][name*=nst]';
											await UofC.setButtonCheckboxByCSS(numberedStepCssLocator,
											 accordionBlockValues.accordionContentSections[i].accordionSections[j].numberedStep);
										});
									}
									
									//5.4: CTA Button fields
									if (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons) {
										// 5.4.1: accordion content[i] section [j] - type the section URL | sections Call to Action URL field locators:
										// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) input[name*=uri] //content #1 section #1 uri field
										// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) input[name*=uri] //content #1 section #2 uri field
										// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) input[name*=uri] //content #2 section #1 uri field
										if (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons.url) {
											it('type the accordion content #' + (i + 1) + ' section # ' + (j + 1) + ' url as ' +
											 (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons.url), async () => {
												const sectionCtaUrlCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
												 (i + 1) + ') .draggable:nth-child(' + (j + 1) + ') input[name*=uri]';
												
												await UofC.setTextFieldValueByCSS(sectionCtaUrlCssLocator,
												 accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons.url);
											});
										}
										
										// 5.4.2: accordion content[i] section [j] - type the section Button Label | sections Call to Action button label field locators:
										// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(1) input[name*=title] //content #1 section #1 button label field
										// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(1) .draggable:nth-child(2) input[name*=title] //content #1 section #2 button label field
										// table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(2) .draggable:nth-child(1) input[name*=title] //content #2 section #1 button label field
										if (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons.btnLabel) {
											it('type the accordion content #' + (i + 1) + ' section # ' + (j + 1) + ' button label as ' +
											 (accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons.btnLabel), async () => {
												const sectionCtaUrlCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
												 (i + 1) + ') .draggable:nth-child(' + (j + 1) + ') input[name*=title]';
												await UofC.setTextFieldValueByCSS(sectionCtaUrlCssLocator,
												 accordionBlockValues.accordionContentSections[i].accordionSections[j].sectionCtaButtons.btnLabel);
											});
										}
									}
								});
							}
						}
						
						//6. accordion content - CTA
						if (accordionBlockValues.accordionContentSections[i].contentCtaButtons) {
							describe('set accordion content #' + (i + 1) + ' cta button', () => {
								//6.1: CTA URL
								if (accordionBlockValues.accordionContentSections[i].contentCtaButtons.url) {
									it('type the accordion content #' + (i + 1) + ' cta url as ' +
									 (accordionBlockValues.accordionContentSections[i].contentCtaButtons.url), async () => {
										const contentCtaUrlCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
										 (i + 1) + ') input[name*=uri]';
										await UofC.setTextFieldValueByCSS(contentCtaUrlCssLocator,
										 accordionBlockValues.accordionContentSections[i].contentCtaButtons.url);
									});
								}
								
								//6.2: CTA Button Label
								if (accordionBlockValues.accordionContentSections[i].contentCtaButtons.btnLabel) {
									it('type the accordion content #' + (i + 1) + ' cta button label as ' +
									 (accordionBlockValues.accordionContentSections[i].contentCtaButtons.btnLabel), async () => {
										const contentCtaLabelCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
										 (i + 1) + ') input[name*=title]';
										await UofC.setTextFieldValueByCSS(contentCtaLabelCssLocator,
										 accordionBlockValues.accordionContentSections[i].contentCtaButtons.btnLabel);
									});
								}
								
								//6.3. accordion content - Button Alignment
								if (accordionBlockValues.accordionContentSections[i].buttonAlignment) {
									it('select the accordion content #' + (i + 1) + ' button alignment as ' +
									 (accordionBlockValues.accordionContentSections[i].buttonAlignment), async () => {
										const btnAlignmentCssLocator = 'table[id*=ucws-accordion-item-values]>tbody>tr.draggable:nth-child(' +
										 (i + 1) + ') select[name*=btnaln]';
										await UofC.setSelectDropDownValueByCSS(btnAlignmentCssLocator, accordionBlockValues.accordionContentSections[i].buttonAlignment);
									});
								}
							});
						}
					});
				}
			}
			
			describe('save the edited accordion block', () => {
				clickSaveButtonAfterBlockEdited();
			});
			
			describe('validate accordion block\'s edits were applied', () => {
				const validationValues = {
					"blockType": "Accordion",
					"blockNumber": accordionBlockValues.nrAccordionBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					// "numberOfColumns": accordionBlockValues.numberOfColumns, //TODO:this piece is not implemented for the accordion
					"ctaButtons": accordionBlockValues.ctaButtons ? accordionBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				
				//TODO: finish next steps - part of the test
				//validate 1st accordion content section is expanded while all others are collapsed
				// div[aria-expanded=true]   VS   div[aria-expanded=false]
				if (accordionBlockValues.accordionContentSections) {
					describe('validate accordion #' + accordionBlockValues.nrAccordionBlockToEdit +
					 ' content sections are correctly expanded/collapsed as default and the heading colours are right', () => {
						let accordionBlockElements, contentSectionElements, contentSectionElement, contentSectionClassValue,
						 contentHeadingElements, contentHeadingElement, contentHeadingColor;
						it('find all available accordion block(s)', async () => {
							accordionBlockElements = await UofC.findElementsByCSS('div[class*=ucws-accordion');
							
							if (!accordionBlockElements.length > 0) {
								throw 'no accordion blocks were found but expected';
							}
						});
						
						it('find accordion #' + accordionBlockValues.nrAccordionBlockToEdit + ' block\'s content headings', async () => {
							//div[class*=ucws-accordion] div[class*=panel-heading]
							contentHeadingElements = await accordionBlockElements[(accordionBlockValues.nrAccordionBlockToEdit - 1)].findElements(By.css('div[class*=panel-heading]'));
							
							if (!contentHeadingElements.length > 0) {
								throw 'no content headings found within the accordion block #' +
								accordionBlockValues.nrAccordionBlockToEdit + ' but expected';
							}
						});
						
						it('find accordion #' + accordionBlockValues.nrAccordionBlockToEdit + ' block\'s content sections', async () => {
							//div[class*=ucws-accordion] div[role=tabpanel]
							contentSectionElements = await accordionBlockElements[(accordionBlockValues.nrAccordionBlockToEdit - 1)].findElements(By.css('div[role=tabpanel]'));
							
							if (!contentSectionElements.length > 0) {
								throw 'no content sections found within the accordion block #' +
								accordionBlockValues.nrAccordionBlockToEdit + ' but expected';
							}
						});
						
						for (let i = 0; i < accordionBlockValues.accordionContentSections.length; i++) {
							it('accordion #' + accordionBlockValues.nrAccordionBlockToEdit +
							 ' block\'s content #1 is expanded while other contents are collapsed', async () => {
								//div[class*=ucws-accordion] --> div[aria-expanded=true] OR div[aria-expanded=false]
								contentSectionElement = await contentSectionElements[i];
								contentSectionClassValue = await contentSectionElement.getAttribute('class');
								
								if (i === 0) {
									//expect the 1st element to have the aria-expanded = true
									//aria-expanded attribute -- returns null by default -- there is no such a property on the accordion
									//block unless we first click expand/collapse and this property will get added to the object
									//cannot use the getAttribute() below because of the issue above - even though this would be the correct way
									// let contentSectionAriaExpandedValue = await contentSectionElement.getAttribute('aria-expanded');
									// console.log('contentSectionAriaExpandedValue (expected - true): ' + contentSectionAriaExpandedValue);
									// expect(contentSectionAriaExpandedValue).to.equal('true');
									// console.log('contentSectionClassValue (expected to contain "in"): ' + contentSectionClassValue);
									expect(contentSectionClassValue).to.contain(' in');
								} else {
									//expect all other elements to have the aria-expanded = false
									//aria-expanded attribute -- returns null by default -- there is no such a property on the accordion
									//block unless we first click expand/collapse and this property will get added to the object
									//cannot use the getAttribute() below because of the issue above - even though this would be the correct way
									// let contentSectionAriaExpandedValue = await contentSectionElement.getAttribute('aria-expanded');
									// console.log('contentSectionAriaExpandedValue (expected - false): ' + contentSectionAriaExpandedValue);
									// expect(contentSectionAriaExpandedValue).to.equal('false');
									// console.log('contentSectionClassValue (expected to not contain "in"): ' + contentSectionClassValue);
									expect(contentSectionClassValue).to.not.contain(' in');
								}
							});
							
							it('accordion #' + accordionBlockValues.nrAccordionBlockToEdit +
							' block\'s content #1 is displayed in red while others are gray', async () => {
								contentHeadingElement = await contentHeadingElements[i];
								
								//expected: //rgba(207, 7, 34, 1) -> red (#cf0722) OR rgba(196, 191, 182, 1) -> gray (#c4bfb6)
								contentHeadingColor = await contentHeadingElement.getCssValue('background-color');
								contentHeadingColor = await returnHexColor(contentHeadingColor);  //transform from rgb to hex
								
								if (i === 0) {
									// console.log('contentHeadingColor (expected red): ' + contentHeadingColor);
									expect(contentHeadingColor).to.equal('#cf0722');
								} else {
									// console.log('contentHeadingColor (expected gray): ' + contentHeadingColor);
									expect(contentHeadingColor).to.equal('#c4bfb6');
								}
							});
						}
					});
				}
			});
			//TODO: add more validations for: nr of sections (for each section heading / description / cta links /etc..)
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
				//note: here we cannot have both imageUpload & bgColourItemNr set at the same time
				//should set only one in the data.json file - never set both of them
				if (bannerBlockValues.displayStyle === 'Background Image' && bannerBlockValues.bgColourItemNr) {
					throw 'cannot have the display style as background image with a colour';
				} else if (bannerBlockValues.displayStyle === 'Background Colour' && bannerBlockValues.imageUpload) {
					throw 'cannot have the display style as background colour with an image';
				}
				const validationValues = {
					"blockType": "Banner",
					"blockNumber": bannerBlockValues.nrBannerBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"displayStyle": bannerBlockValues.displayStyle,
					"imageUpload": bannerBlockValues.imageUpload,
					"bgColourItemNr": bannerBlockValues.bgColourItemNr,
					"ctaButtons": bannerBlockValues.ctaButtons ? bannerBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				/*
				validateBlockEditsApplied(
				 'Banner'
				 , bannerBlockValues.nrBannerBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , bannerBlockValues.displayStyle
				 , bannerBlockValues.bgColourItemNr
				 , bannerBlockValues.ctaButtons ? bannerBlockValues.ctaButtons : null);
				*/
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
				typeBlockDescription('ucws-checklist-desc', DESCRIPTION_VALUE);
			}
			
			//NOTE: if bgColourItemNr !== default (8 or white) then accentColour is hidden
			if (checklistBlockValues.bgColourItemNr) {
				setBackgroundColour(checklistBlockValues.bgColourItemNr);
			}
			
			//accentColour - this is also used within the MoreInfo / Checklist / Divider tests
			if (checklistBlockValues.bgColourItemNr === 8 && checklistBlockValues.accentLineColourItemNr ||
			 !checklistBlockValues.bgColourItemNr && checklistBlockValues.accentLineColourItemNr) {
				setAccentOrLineColour(checklistBlockValues.accentColourItemNr);
			}
			
			if (checklistBlockValues.roundedCorners) {
				setRoundedCorners(checklistBlockValues.roundedCorners);
			}
			
			if (checklistBlockValues.addChecklistItemSections) {
				//loop through the list of Add More Info block sections and add as many as needed
				for (let i = 0; i < checklistBlockValues.addChecklistItemSections.length; i++) {
					it('click add checklist items block\'s button time ' + (i + 1), async () => {
						await UofC.clickElementByCSS('.field-add-more-submit');
						await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') input[id*=checklist][id*=remove-button]',
						 waitLong, 500, true);
					});
					
					//add section heading
					if (checklistBlockValues.addChecklistItemSections[i].heading) {
						it('type the item ' + (i + 1) + '\'s subheading as ' +
						 checklistBlockValues.addChecklistItemSections[i].heading, async () => {
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
						
						it('type the description as ' +
						 (checklistBlockValues.addChecklistItemSections[i].description).substring(0, 40), async () => {
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
						it('type the section ' + (i + 1) + '\'s cta url as ' +
						 checklistBlockValues.addChecklistItemSections[i].url, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=ucws-checklist][id*=cta-0-uri]', checklistBlockValues.addChecklistItemSections[i].url);
						});
						
						it('type the section ' + (i + 1) + '\'s text link label as ' +
						 checklistBlockValues.addChecklistItemSections[i].textLinkLabel, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=ucws-checklist][id*=cta-0-title]',
							 checklistBlockValues.addChecklistItemSections[i].textLinkLabel);
						});
					}
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate more info block\'s edits were applied', () => {
				const validationValues = {
					"blockType": "Checklist",
					"blockNumber": checklistBlockValues.nrChecklistBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"bgColourItemNr": checklistBlockValues.bgColourItemNr,
					"accentLineColourItemNr": checklistBlockValues.accentLineColourItemNr,
					"ctaButtons": checklistBlockValues.ctaButtons ? checklistBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
			});
		});
	};
	
	UofC.editDividerBlock = (dividerBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the divider block nr ' + dividerBlockValues.nrDividerBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Divider block"]', dividerBlockValues.nrDividerBlockToEdit);
			
			if (dividerBlockValues.lineStyle) {
				it('select the line style as ' + dividerBlockValues.lineStyle, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=line-style]', dividerBlockValues.lineStyle);
				});
			}
			
			//accentColour - this is also used within the MoreInfo / Checklist / Divider tests
			if (dividerBlockValues.accentLineColourItemNr) {
				setAccentOrLineColour(dividerBlockValues.accentLineColourItemNr);
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate text block\'s edits were applied', () => {
				const validationValues = {
					"blockType": "Divider",
					"blockNumber": dividerBlockValues.nrDividerBlockToEdit,
					"lineStyle": dividerBlockValues.lineStyle,
					"accentLineColourItemNr": dividerBlockValues.accentLineColourItemNr
				};
				
				validateBlockEditsApplied(validationValues);
			});
		});
	};
	
	UofC.editInfoShimBlock = (infoShimBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the info shim block nr ' + infoShimBlockValues.nrInfoShimBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Info Shim block"]', infoShimBlockValues.nrInfoShimBlockToEdit);
			
		//1. DESCRIPTION
			const DESCRIPTION_VALUE = infoShimBlockValues.descriptionValue ? infoShimBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 100) + 1) : '';
			if (infoShimBlockValues.descriptionValue) {
				it('type the description as ' + DESCRIPTION_VALUE, async () => {
					await UofC.setTextFieldValueByCSS('.ui-dialog textarea[name*=shim_desc]', DESCRIPTION_VALUE);
				});
			}
			
		//2. CTA URL & LABEL
			// cta URL:     input[id*=info-shim-cta][id*=uri]
			// cta Label:   input[id*=info-shim-cta][id*=title]
			// typeCtaButtonsAndLabels(buttonNr, buttonUrl, buttonLabel);
			typeCtaButtonsAndLabels(1, infoShimBlockValues.ctaButtons.url1, infoShimBlockValues.ctaButtons.btnLabel1);
			
		//3. ICON (more info)
			it('click the down arrow icon to expand the icons list of info shim block', async () => {
				await UofC.clickElementByCSS('.fip-grey i.fip-icon-down-dir');
				await UofC.waitForObjectLoad('.fip-icons-container', waitLong, 500, true);
			});
			
			it('type the ' + infoShimBlockValues.icon + ' icon name into the search field', async () => {
				await UofC.setTextFieldValueByCSS('.selector-popup:not([style*="display: none"]) input[class=icons-search-input]',
				 infoShimBlockValues.icon);
				await UofC.waitForObjectLoad('.selector-popup:not([style*="display: none"]) .' +
				 infoShimBlockValues.icon, waitLong, 500, true);
			});
			
			it('select the ' + infoShimBlockValues.icon + ' icon', async () => {
				//bring the icon to the center of the screen before selecting it
				const iconElement = await driver.findElement(By.css('.selector-popup:not([style*="display: none"]) .'
				 + infoShimBlockValues.icon));
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', iconElement);
				await UofC.clickElementByCSS('.selector-popup:not([style*="display: none"]) .'
				 + infoShimBlockValues.icon);
			});
		
		//4. ACCENT COLOUR
			if (infoShimBlockValues.accentLineColourItemNr) {
				setAccentOrLineColour(infoShimBlockValues.accentLineColourItemNr);
			}
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate text block\'s edits were applied', () => {
				const validationValues = {
					"blockType": "Info Shim",
					"blockNumber": infoShimBlockValues.nrInfoShimBlockToEdit,
					"descriptionValue": DESCRIPTION_VALUE,
					"lineStyle": infoShimBlockValues.lineStyle,
					"accentLineColourItemNr": infoShimBlockValues.accentLineColourItemNr,
					"ctaButtons": infoShimBlockValues.ctaButtons ? infoShimBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				
				//validate selected icon
				it('the selected info shim\'s icon is ' + infoShimBlockValues.icon, async () => {
					const blockElements = await driver.findElements(By.css('div[class*=ucws-info-shim]'));
					const iconElement = await blockElements[infoShimBlockValues.nrInfoShimBlockToEdit - 1].findElement(By.css('span'));
					const blocksIcon = await iconElement.getAttribute('class');
					expect(blocksIcon).to.contain(infoShimBlockValues.icon);  //ucws-info-shim-star
					console.log('wait');
				});
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
				typeBlockDescription('ucws-more-info-desc', DESCRIPTION_VALUE);
			}
			
			//NOTE: if bgColourItemNr !== default (8 or white) then accentColour is hidden
			if (moreInfoBlockValues.bgColourItemNr) {
				setBackgroundColour(moreInfoBlockValues.bgColourItemNr);
			}
			
			//accentColour - this is also used within the MoreInfo / Checklist / Divider tests
			if (moreInfoBlockValues.bgColourItemNr === 8 && moreInfoBlockValues.accentLineColourItemNr ||
			 !moreInfoBlockValues.bgColourItemNr && moreInfoBlockValues.accentLineColourItemNr) {
				setAccentOrLineColour(moreInfoBlockValues.accentLineColourItemNr);
			}
			
			if (moreInfoBlockValues.addMoreInfoSections) {
				//loop through the list of Add More Info block sections and add as many as needed
				for (let i = 0; i < moreInfoBlockValues.addMoreInfoSections.length; i++) {
					it('click add more information block\'s button time ' + (i + 1), async () => {
						const addMoreInfoBlockBtn = await driver.findElement(By.css('.field-add-more-submit'));
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', addMoreInfoBlockBtn);
						await addMoreInfoBlockBtn.click();
						await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .icons-selector', waitLong * 5, 500, true);
					});
					
					//select an icon
					if (moreInfoBlockValues.addMoreInfoSections[i].icon) {
						it('click the down arrow icon to expand the icons list of information block ' + i, async () => {
							await UofC.clickElementByCSS('tr:nth-child(' + (i + 1) + ') .fip-grey i.fip-icon-down-dir');
							await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .fip-icons-container', waitLong, 500, true);
						});
						
						it('type the ' + moreInfoBlockValues.addMoreInfoSections[i].icon + ' icon name into the search field' + i, async () => {
							await UofC.setTextFieldValueByCSS('.selector-popup:not([style*="display: none"]) input[class=icons-search-input]',
							 moreInfoBlockValues.addMoreInfoSections[i].icon);  //.ucws-more-info-picture
							await UofC.waitForObjectLoad('.selector-popup:not([style*="display: none"]) .' +
							 moreInfoBlockValues.addMoreInfoSections[i].icon, waitLong, 500, true);
						});
						
						it('select the ' + moreInfoBlockValues.addMoreInfoSections[i].icon + ' icon', async () => {
							//bring the icon to the center of the screen before selecting it
							const iconElement = await driver.findElement(By.css('.selector-popup:not([style*="display: none"]) .'
							 + moreInfoBlockValues.addMoreInfoSections[i].icon));
							await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', iconElement);
							await UofC.clickElementByCSS('.selector-popup:not([style*="display: none"]) .'
							 + moreInfoBlockValues.addMoreInfoSections[i].icon);
						});
					}
					
					//add section heading
					if (moreInfoBlockValues.addMoreInfoSections[i].heading) {
						it('type the section ' + (i + 1) + ' heading as ' + moreInfoBlockValues.addMoreInfoSections[i].heading, async () => {
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
						
						it('type the description as ' + (moreInfoBlockValues.addMoreInfoSections[i].description).substring(0, 40), async () => {
							await UofC.setTextFieldValueByCSS('.cke_editable', moreInfoBlockValues.addMoreInfoSections[i].description);
						});
						
						//here might need to switch off the iframe above
						it('switching out of the description iframe', async () => {
							let handles = await driver.getAllWindowHandles();
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
				setRoundedCorners(moreInfoBlockValues.roundedCorners);
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate more info block\'s edits were applied', () => {
				const validationValues = {
					"blockType": "More Info",
					"blockNumber": moreInfoBlockValues.nrMoreInfoBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"bgColourItemNr": moreInfoBlockValues.bgColourItemNr,
					"accentLineColourItemNr": moreInfoBlockValues.accentLineColourItemNr,
					"ctaButtons": moreInfoBlockValues.ctaButtons ? moreInfoBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
			});
		});
	};
	
	UofC.editRelatedContentBlock = (relatedContentBlockValues, attachmentFolderPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the related content block #' + relatedContentBlockValues.nrRelatedContentBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Related Content block"]',
			 relatedContentBlockValues.nrRelatedContentBlockToEdit);
			
			if (!relatedContentBlockValues.addRelatedContentItems.length) {
				throw 'no parameters exists for editing the related content block, please add them either check if the call is needed';
			}
			
			//in a loop based on relatedContentBlockValues.addRelatedContentItems.length
			let imageFullPath, imgAltText, itemHeadingValue, itemDescriptionValue;
			
			//these are available/used background colours:
			let bgColourItemNr, selectedColor, color1, color2, color3, color4, color5, color6, color7, color8;
			color1 = '#CF0722';
			color2 = '#FF671F';
			color3 = '#FFA300';
			color4 = '#CE0058';
			color5 = '#A6192E';
			color6 = '#6B3529';
			color7 = '#8D827A';
			color8 = '#FFFFFF';
			
			for (let i = 0; i < relatedContentBlockValues.addRelatedContentItems.length; i++) {
				let bgImage = relatedContentBlockValues.addRelatedContentItems[i].imageUpload.backgroundImage;
				let imagePreviewAndLinkLocator = bgImage.substring(0, bgImage.lastIndexOf('.'));//remove the . and everything afterwards
				
			//2. Edit the Items fields ---------------------------------------------------------------------------------------
				describe('edit related content item nr ' + (i + 1), () => {
					//1. click "Add Related Content item"
					it('click the add related content item button time ' + (i + 1), async () => {
						await UofC.clickElementByCSS('input[id*=item-add-more]');
						await UofC.waitForPageLoad();
					});
					
				//2.1 upload Background Image (validate img thumbnail is displayed + image name link)
					it('upload the ' + bgImage + ' background image', async () => {
						imageFullPath = attachmentFolderPath + relatedContentBlockValues.addRelatedContentItems[i].imageUpload.backgroundImage;
						await UofC.setFileUploadByCSS('.ui-dialog input[id*=upload][type=file]', imageFullPath);
						imageFullPath = '';
					});
					
					it('validate that image\'s preview and the ' + bgImage + ' link are displayed', async () => {
						//tr.draggable:nth-child(1) img[data-drupal-selector*=preview]
						await UofC.waitForObjectLoad('.ui-dialog tr.draggable:nth-child(' + (i + 1) +
						 ') img[data-drupal-selector*=preview]', waitLong * 3, 500, true);
						
						//validate image link is displayed
						await UofC.waitForObjectLoad('.ui-dialog tr.draggable:nth-child(' + (i + 1) + ') a[href*="' +
						 imagePreviewAndLinkLocator + '"]', waitLong, 500, true);
					});
					
				//2.2 add Alt text
					//validate the image link contains the right title: tr.draggable:nth-child(1) img[data-drupal-selector*=preview]
					UofC.validateDisplayedTextContains('.ui-dialog tr.draggable:nth-child(' + (i + 1) + ') a[href*="' +
					 imagePreviewAndLinkLocator + '"]', imagePreviewAndLinkLocator);
					
					it('type the alternative text as ' + imgAltText, async () => {
						imgAltText = relatedContentBlockValues.addRelatedContentItems[i].imageUpload.imageAltText + ' ' +
						 Math.floor((Math.random() * 100) + 1);
						await UofC.setTextFieldValueByCSS('.ui-dialog tr.draggable:nth-child(' + (i + 1) + ') input[id*=alt]', imgAltText);
					});
					
				//2.3 choose a Background color
					if (relatedContentBlockValues.addRelatedContentItems[i].bgColourItemNr) {
						it('set the background color to ' + relatedContentBlockValues.addRelatedContentItems[i].bgColourItemNr, async () => {
							bgColourItemNr = relatedContentBlockValues.addRelatedContentItems[i].bgColourItemNr;
							
							if (bgColourItemNr > 8 || bgColourItemNr < 1) {
								throw 'bgColourItemNr is ' + bgColourItemNr + ' but it should be between 1 and 8, please correct the data';
							}
							
							selectedColor = (bgColourItemNr === 1) ? color1 : (bgColourItemNr === 2) ? color2 : (bgColourItemNr === 3) ? color3 :
							 (bgColourItemNr === 4) ? color4 : (bgColourItemNr === 5) ? color5 : (bgColourItemNr === 6) ? color6 :
								(bgColourItemNr === 7) ? color7 : (bgColourItemNr === 8) ? color8 : 'this color is not available: ' + bgColourItemNr;
							// console.log('selectedColor: ' + selectedColor);
							
							//bring the button to the screen: 'button[class*=color][color*="' + selectedColor + '"]'
							let colorBtnElement = await driver.findElement(By.css('.ui-dialog tr.draggable:nth-child(' + (i + 1) +
							 ') button[class*=color][color*="' + selectedColor + '"]'));
							await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', colorBtnElement);
							await colorBtnElement.click();
						});
					}
					
					//2.4 type Section Header (60 chars max) - required
					it('type the heading as ' + (relatedContentBlockValues.addRelatedContentItems[i].heading.length > 50 ?
					 relatedContentBlockValues.addRelatedContentItems[i].heading.substring(0, 50) + '...' :
					 relatedContentBlockValues.addRelatedContentItems[i].heading), async () => {
						itemHeadingValue = relatedContentBlockValues.addRelatedContentItems[i].heading + ' ' +
						 Math.floor((Math.random() * 100) + 1);
						await UofC.setTextFieldValueByCSS('.ui-dialog tr.draggable:nth-child(' + (i + 1) +
						 ') input[id*=ucws-related-content][id*=hed]', itemHeadingValue);
					});
					
					//2.5 type Section Description (300 chars max)
					if (relatedContentBlockValues.addRelatedContentItems[i].description) {
						it('switching to the description iframe', async () => {
							await driver.switchTo().frame(driver.findElement(By.css('.ui-dialog tr.draggable:nth-child(' + (i + 1) +
							 ') div[id*=ucws-related-content][id*=des] iframe')));
						});
						
						it('type the description as ' + (relatedContentBlockValues.addRelatedContentItems[i].description.length > 50 ?
						 relatedContentBlockValues.addRelatedContentItems[i].description.substring(0, 40) + '...' :
						 relatedContentBlockValues.addRelatedContentItems[i].description), async () => {
							itemDescriptionValue = relatedContentBlockValues.addRelatedContentItems[i].description ?
							 relatedContentBlockValues.addRelatedContentItems[i].description + ' ' + Math.floor((Math.random() * 100) + 1) : '';
							await UofC.setTextFieldValueByCSS('.cke_editable', itemDescriptionValue);
						});
						
						//here might need to switch off the iframe above
						it('switching out of the description iframe', async () => {
							let handles = await driver.getAllWindowHandles();
							await driver.switchTo().window(handles[0]);
						});
					}
					
					//2.6 CTA button
					if (relatedContentBlockValues.addRelatedContentItems[i].url) {
						it('type the item ' + (i + 1) + '\'s cta url as ' +
						 relatedContentBlockValues.addRelatedContentItems[i].url, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=related-content][id*=uri]', relatedContentBlockValues.addRelatedContentItems[i].url);
						});
						
						it('type the item ' + (i + 1) + '\'s text link label as ' +
						 relatedContentBlockValues.addRelatedContentItems[i].textLinkLabel, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							 ') input[id*=related-content][id*=title]', relatedContentBlockValues.addRelatedContentItems[i].textLinkLabel);
						});
					}
				});
			}
			
			describe('save the changes added to the related content block #' + relatedContentBlockValues.nrRelatedContentBlockToEdit, () => {
				clickSaveButtonAfterBlockEdited();
			});
			
			describe('validate related content block\'s edits were applied', () => {
				UofC.popUpConfirmation('Related Content has been updated.', waitShort);
				
				//in a loop - check:
				let blockElements, itemElements, itemHeadingElement, itemHeadingText,
				 itemDescriptionElement, itemDescriptionText, itemBgColour, ctaLabelElement, ctaLabelText;
				
				const nrRelatedContentBlockToEdit = relatedContentBlockValues.nrRelatedContentBlockToEdit;
				const nrOfRelatedContentItems = relatedContentBlockValues.addRelatedContentItems.length;
				const blockCssLocator = 'div[class*=ucws-related-content]';
				
				it('find the related content block #' + nrRelatedContentBlockToEdit + ' and bring it into the view', async () => {
					blockElements = await driver.findElements(By.css(blockCssLocator));
					if (blockElements.length < 1) {
						throw 'no related content block found but expected';
					} else {
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});',
						 blockElements[nrRelatedContentBlockToEdit - 1]);
					}
				});
				
				/// 1. there are relatedContentBlockValues.addRelatedContentItems[i] nr of items
				it('validate that the related content block #' + nrRelatedContentBlockToEdit + ' has ' +
				 nrOfRelatedContentItems + ' items/sections', async () => {
					itemElements = await blockElements[nrRelatedContentBlockToEdit - 1].findElements(By.css('.chicklet'));
					expect(itemElements.length).to.equal(nrOfRelatedContentItems);
				});
				
				for (let i = 0; i < nrOfRelatedContentItems; i++) {
					describe('validate related content block\'s item #' + (i + 1) + ' edits are correct', () => {
						/// 2.1 no mouse hover - each item's heading includes 'relatedContentBlockValues.addRelatedContentItems[i].heading'
						it('the heading of related content block #' + nrRelatedContentBlockToEdit + ' item #' + (i + 1) +
						 ' when no mouse hover contains ' + relatedContentBlockValues.addRelatedContentItems[i].heading, async () => {
							itemHeadingElement = await itemElements[i].findElement(By.css('h2'));
							itemHeadingText = await itemHeadingElement.getText();
							expect(itemHeadingText.toLowerCase()).to.contain((relatedContentBlockValues.addRelatedContentItems[i].heading).toLowerCase());
						});
						
						/// 2.2 mouse hover then:
						// validate the heading of each item includes 'relatedContentBlockValues.addRelatedContentItems[i].heading'
						it('the heading of related content block #' + nrRelatedContentBlockToEdit + ' item #' + (i + 1) +
						 ' on mouse hover contains ' + relatedContentBlockValues.addRelatedContentItems[i].heading, async () => {
							
							await UofC.mouseHover(itemElements[i]);
							await driver.sleep(500);  //wait for .5 sec - colour settings become fully applied (otherwise while it fades it won't match)
							
							itemHeadingElement = await itemElements[i].findElement(By.css('p.h2'));
							itemHeadingText = await itemHeadingElement.getText();
							expect(itemHeadingText.toLowerCase()).to.contain((relatedContentBlockValues.addRelatedContentItems[i].heading).toLowerCase());
						});
						
						/// 3. mouse hover - each item and validate the bg colour = selectedColor (#......)
						if(relatedContentBlockValues.addRelatedContentItems[i].bgColourItemNr) {
							//find the block & retrieve it's bg color and compare with the expected color
							it('block\'s background colour is ' + relatedContentBlockValues.addRelatedContentItems[i].bgColourItemNr, async () => {
								bgColourItemNr = relatedContentBlockValues.addRelatedContentItems[i].bgColourItemNr;
								
								if (bgColourItemNr > 8 || bgColourItemNr < 1) {
									throw 'bgColourItemNr is ' + bgColourItemNr + ' but it should be between 1 and 8, please correct the data';
								}
								
								selectedColor = (bgColourItemNr === 1) ? color1 : (bgColourItemNr === 2) ? color2 :
								 (bgColourItemNr === 3) ? color3 : (bgColourItemNr === 4) ? color4 : (bgColourItemNr === 5) ?
									color5 : (bgColourItemNr === 6) ? color6 : (bgColourItemNr === 7) ? color7 : (bgColourItemNr === 8) ?
									 color8 : 'this color is not available: ' + bgColourItemNr;
								// console.log('selectedColor: ' + selectedColor);
								
								itemBgColour = await itemElements[i].getCssValue('background-color');
								itemBgColour = await returnHexColor(itemBgColour);  //transform from rgb to hex
								// console.log('itemBgColour: ' + itemBgColour);
								expect(itemBgColour.toLowerCase()).to.equal(selectedColor.toLowerCase());
							});
						}
						/// 4. mouse hover - each item's description includes 'relatedContentBlockValues.addRelatedContentItems[i].description'
						if (relatedContentBlockValues.addRelatedContentItems[i].description) {
							it('the description of related content block #' + nrRelatedContentBlockToEdit + ' item #' +
							 (i + 1) + ' is ' + relatedContentBlockValues.addRelatedContentItems[i].description, async () => {
								itemDescriptionElement = await itemElements[i].findElement(By.css('p:not([class*=h2]):not([class*=link])'));
								itemDescriptionText = await itemDescriptionElement.getText();
								expect(itemDescriptionText.toLowerCase()).to.contain((relatedContentBlockValues.addRelatedContentItems[i].description).toLowerCase());
							});
						}
						
						/// 5.1 verify that each item's link has the correct label
						/// 5.2 click each item's link and check it opens the correct url in a new tab and close the opened tabs
						if (relatedContentBlockValues.addRelatedContentItems[i].url) {
							it('the cta link label\'s text equals to ' + relatedContentBlockValues.addRelatedContentItems[i].textLinkLabel, async () => {
								ctaLabelElement = await itemElements[i].findElement(By.css('.link>a'));
								ctaLabelText = await ctaLabelElement.getText();
								// console.log('ctaLabelText: ' + ctaLabelText);
								expect(ctaLabelText.toLowerCase()).to.equal((relatedContentBlockValues.addRelatedContentItems[i].textLinkLabel).toLowerCase());
							});
							
							it('click the ' + relatedContentBlockValues.addRelatedContentItems[i].textLinkLabel + ' cta link', async () => {
								await ctaLabelElement.click();
							});
							
							switchToOtherTabAndOrVerifyTheUrl(relatedContentBlockValues.addRelatedContentItems[i].url);
							close2ndOpenTabOrNavigateBack();
						}
					});
				}
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
				const validationValues = {
					"blockType": "Sidekick",
					"blockNumber": sideKickBlockValues.nrSideKickBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"imageUpload": sideKickBlockValues.imageUpload,
					"bgColourItemNr": sideKickBlockValues.bgColourItemNr,
					"ctaButtons": sideKickBlockValues.ctaButtons ? sideKickBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				/*
				validateBlockEditsApplied(
				 'SideKick'
				 , sideKickBlockValues.nrSideKickBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , sideKickBlockValues.imageUpload
				 , sideKickBlockValues.bgColourItemNr
				 , sideKickBlockValues.ctaButtons ? sideKickBlockValues.ctaButtons : null);
				*/
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
				setTextAlignment(textBlockValues.textAlignment);
			}
			
			if (textBlockValues.numberOfColumns) {
				selectBlockNumberOfColumns(1, textBlockValues.numberOfColumns);
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
				const validationValues = {
					"blockType": "Text",
					"blockNumber": textBlockValues.nrTextBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"numberOfColumns": textBlockValues.numberOfColumns,
					"ctaButtons": textBlockValues.ctaButtons ? textBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				/*
				validateBlockEditsApplied(
				 'Text'
				 , textBlockValues.nrTextBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , textBlockValues.numberOfColumns
				 , null
				 , null
				 , textBlockValues.ctaButtons ? textBlockValues.ctaButtons : null);
				*/
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
				const validationValues = {
					"blockType": "Image with Text",
					"blockNumber": imageWithTextBlockValues.nrImageWithTextBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE,
					"imageUpload": imageWithTextBlockValues.imageUpload,
					"bgColourItemNr": imageWithTextBlockValues.bgColourItemNr,
					"ctaButtons": imageWithTextBlockValues.ctaButtons ? imageWithTextBlockValues.ctaButtons : null
				};
				
				validateBlockEditsApplied(validationValues);
				/*
				validateBlockEditsApplied(
				 'Image with Text'
				 , imageWithTextBlockValues.nrImageWithTextBlockToEdit
				 , HEADING_VALUE
				 , DESCRIPTION_VALUE
				 , null
				 , null
				 , imageWithTextBlockValues.bgColourItemNr
				 , imageWithTextBlockValues.ctaButtons ? imageWithTextBlockValues.ctaButtons : null);
				*/
			});
		});
	};
	
	UofC.editStreamingMediaBlock = (streamingMediaBlockValues) => {
		/*
		blockHeadingValue,
		blockDescriptionValue,
		accessibilityText,
		captionForMediaValue,
    creatorCreditValue,
    */
    
    /*
    mediaTypeValue,
    mediaTypeEmbedUrl,
    extraCssClasses,
    */
    
    /*
    createNewRevision,
    revisionLogMessage
		 */
		
		describe('edit the streaming media block nr ' + streamingMediaBlockValues.nrStreamingMediaBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Streaming Media block"]', streamingMediaBlockValues.nrStreamingMediaBlockToEdit);
			
			const HEADING_VALUE = streamingMediaBlockValues.headingValue + ' ' + Math.floor((Math.random() * 1000) + 1);
			typeBlockHeading('streaming-media-head', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = streamingMediaBlockValues.descriptionValue ? streamingMediaBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 1000) + 1) : '';
			if (streamingMediaBlockValues.descriptionValue) {
				typeBlockDescription('streaming-media-desc', DESCRIPTION_VALUE);
			}
			
			//type accessibility text
			it('type the accessibility text as ' + streamingMediaBlockValues.accessibilityText, async () => {
				const accessibilityText = streamingMediaBlockValues.accessibilityText + ' ' + Math.floor((Math.random() * 1000) + 1);
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=streaming-media-ahead]', accessibilityText);
			});
			
			//type caption for media
			const captionForMediaValue = streamingMediaBlockValues.captionForMedia + ' ' + Math.floor((Math.random() * 1000) + 1);
			if (streamingMediaBlockValues.captionForMedia) {
				it('type the caption for media as ' + captionForMediaValue, async () => {
					await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=streaming-media-capt]', captionForMediaValue);
				});
			}
			
			//type creator credit
			const creatorCredit = streamingMediaBlockValues.creatorCredit + ' ' + Math.floor((Math.random() * 1000) + 1);
			if (streamingMediaBlockValues.creatorCredit) {
				it('type the creator credit as ' + creatorCredit, async () => {
					await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=streaming-media-ccred]', creatorCredit);
				});
			}
			
			///// MEDIA TYPE - YouTube OR Libsyn
			//check that YouTube is the default selected media type
			it('the default selected media type is youtube', async () => {
				const mediaTypeDropDown = await driver.findElement(By.css('.ui-dialog select[id*=streaming-media-type]'));
				//scroll the page down so the drop down is displayed on the center of the page
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', mediaTypeDropDown);
				await driver.sleep(500);
				
				//retrieve the selected value and check it to equal to "Youtube"
				const dropDownSelectedElement = await mediaTypeDropDown.findElement(By.css('option[selected=selected]'));
				const selectedValue = await dropDownSelectedElement.getText();
				expect(selectedValue.toLowerCase()).to.equal('youtube');
			});
			
			//select Youtube/Libsyn Embed URL -- REQUIRED
			if (streamingMediaBlockValues.mediaType) {
				it('select the media type as ' + streamingMediaBlockValues.mediaType, async () => {
					await UofC.setSelectDropDownValueByCSS('.ui-dialog select[id*=streaming-media-type]', streamingMediaBlockValues.mediaType);
				});
			}
			
			if (streamingMediaBlockValues.mediaEmbedUrl) {
				it('type the ' + streamingMediaBlockValues.mediaType.toLowerCase() + ' embed url as ' +
				 //Libsyn e.g.: https://html5-player.libsyn.com/embed/episode/id/6560208
				 streamingMediaBlockValues.mediaEmbedUrl, async () => {
					let mediaTypeEmbedUrlLocator = streamingMediaBlockValues.mediaType.toLowerCase() === 'youtube' ?
					 'div:not([style="display: none;"])>div>input[id*=youem]' : 'div:not([style="display: none;"])>div>input[id*=uri]';
					await UofC.clickElementByCSS(mediaTypeEmbedUrlLocator);
					await UofC.setTextFieldValueByCSS(mediaTypeEmbedUrlLocator, streamingMediaBlockValues.mediaEmbedUrl);
				});
			}
			
				//if MEDIA_TYPE = YouTube or Default (YouTube) --->
			if (!streamingMediaBlockValues.mediaType || streamingMediaBlockValues.mediaType.toLowerCase() === 'youtube') {
				//// verify checkboxes' defaults (1, 0, 0, 0, 0, 1)
				it('hide suggested videos checkbox is true as default', async () => {
					let inputElement = await driver.findElement(By.css('input[id*=suggt-value]'));
					inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
					const elementChecked = await inputElement.isSelected();
					expect(elementChecked).to.equal(true);
				});
				
				it('do not show youtube logo checkbox is false as default', async () => {
					let inputElement = await driver.findElement(By.css('input[id*=ylogo-value]'));
					inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
					const elementChecked = await inputElement.isSelected();
					expect(elementChecked).to.equal(false);
				});
				
				it('use a light coloured control bar checkbox is false as default', async () => {
					let inputElement = await driver.findElement(By.css('input[id*=light-value]'));
					inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
					const elementChecked = await inputElement.isSelected();
					expect(elementChecked).to.equal(false);
				});
				
				it('use a white coloured video progress bar checkbox is false as default', async () => {
					let inputElement = await driver.findElement(By.css('input[id*=progr-value]'));
					inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
					const elementChecked = await inputElement.isSelected();
					expect(elementChecked).to.equal(false);
				});
				
				it('enable use of iframe api checkbox is false as default', async () => {
					let inputElement = await driver.findElement(By.css('input[id*=ifram-value]'));
					inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
					const elementChecked = await inputElement.isSelected();
					expect(elementChecked).to.equal(false);
				});
				
				it('fix overlay problem in ie checkbox is true as default', async () => {
					let inputElement = await driver.findElement(By.css('input[id*=ie-value]'));
					inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
					const elementChecked = await inputElement.isSelected();
					expect(elementChecked).to.equal(true);
				});
				
				it('extra css classes field is blank as default', async () => {
					let fieldElement = await driver.findElement(By.css('input[id*=css][value]'));
					fieldElement = await driver.wait(until.elementIsVisible(fieldElement), waitShort);
					const elementText = await fieldElement.getText();
					expect(elementText).to.equal('');
				});
				
				//// set the checkboxes to whatever is needed (true / false)
				let youTubeParameters = null;
				if (streamingMediaBlockValues.youTubeParameters) {
					youTubeParameters = streamingMediaBlockValues.youTubeParameters;
					
					if (youTubeParameters.hideSuggestedVideos === false || youTubeParameters.hideSuggestedVideos === true) {
						it('set the hide suggested videos checkbox to ' + youTubeParameters.hideSuggestedVideos, async () => {
							await UofC.setButtonCheckboxByCSS('input[id*=suggt-value]', youTubeParameters.hideSuggestedVideos);
						});
					}
					
					if (youTubeParameters.doNotShowYouTubeLogo === false || youTubeParameters.doNotShowYouTubeLogo === true) {
						it('set the do not show youtube logo checkbox to ' + youTubeParameters.doNotShowYouTubeLogo, async () => {
							await UofC.setButtonCheckboxByCSS('input[id*=ylogo-value]', youTubeParameters.doNotShowYouTubeLogo);
						});
					}
					
					if (youTubeParameters.useLightControlBar === false || youTubeParameters.useLightControlBar === true) {
						it('set the use a light coloured control bar checkbox to ' + youTubeParameters.useLightControlBar, async () => {
							await UofC.setButtonCheckboxByCSS('input[id*=light-value]', youTubeParameters.useLightControlBar);
						});
					}
					
					if (youTubeParameters.useWhiteProgressBar === false || youTubeParameters.useWhiteProgressBar === true) {
						it('set the use a white coloured video progress bar checkbox to ' + youTubeParameters.useWhiteProgressBar, async () => {
							await UofC.setButtonCheckboxByCSS('input[id*=progr-value]', youTubeParameters.useWhiteProgressBar);
						});
					}
					
					if (youTubeParameters.useIFrameAPI === false || youTubeParameters.useIFrameAPI === true) {
						it('set the use of iframe api checkbox to ' + youTubeParameters.useIFrameAPI, async () => {
							await UofC.setButtonCheckboxByCSS('input[id*=ifram-value]', youTubeParameters.useIFrameAPI);
						});
					}
					
					if (youTubeParameters.fixOverlayProblemsInIE === false || youTubeParameters.fixOverlayProblemsInIE === true) {
						it('set the fix overlay problem in ie checkbox to ' + youTubeParameters.fixOverlayProblemsInIE, async () => {
							await UofC.setButtonCheckboxByCSS('input[id*=ie-value]', youTubeParameters.fixOverlayProblemsInIE);
						});
					}
					
					if (youTubeParameters.extraCssClasses) {
						it('type the extra css classes as ' + youTubeParameters.extraCssClasses, async () => {
							await UofC.setTextFieldValueByCSS('input[id*=css][value]', youTubeParameters.extraCssClasses);
						});
					}
				}
			}
			
			describe('save the changes added to the streaming media block #' + streamingMediaBlockValues.nrStreamingMediaBlockToEdit, () => {
				clickSaveButtonAfterBlockEdited();
			});
			
			describe('validate streaming media block\'s edits were applied', () => {
				const validationValues = {
					"blockType": "Streaming Media",
					"blockNumber": streamingMediaBlockValues.nrStreamingMediaBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE
				};
				validateBlockEditsApplied(validationValues);
				
				const blockNumber = streamingMediaBlockValues.nrStreamingMediaBlockToEdit ?
				 streamingMediaBlockValues.nrStreamingMediaBlockToEdit : 1;
				
				//validate the youtube video / libsyn podcast ------------------------------------------------------------------
				let blockElements, mediaElementIFrame, mediaPlayerElement, mediaPlayerClass;
				//1. src value is the correct one
				it('the ' + streamingMediaBlockValues.mediaType.toLowerCase() + ' streaming media embed url is ' +
				 streamingMediaBlockValues.mediaEmbedUrl, async () => {
					blockElements = await driver.findElements(By.css('div[class*=ucws-streaming-media]'));
					// console.log('blockElements.length: ' + blockElements.length);
					
					//div[class*=youtube-container] iframe OR div[class*=libsyn-container] iframe
					mediaElementIFrame = await blockElements[(blockNumber - 1)].findElement(By.css('div[class*=' +
					 (streamingMediaBlockValues.mediaType.toLowerCase().includes('youtube') ? 'youtube' : 'libsyn') + '-container] iframe'));
					
					//https://www.youtube.com/embed/1SqBdS0XkV4
					const mediaSrcValue = await mediaElementIFrame.getAttribute('src');
					const updatedExpectedValue = (streamingMediaBlockValues.mediaEmbedUrl.toLowerCase()).replace('watch?v=', 'embed/');
					expect(mediaSrcValue.toLowerCase()).to.contain(updatedExpectedValue);
				});
				
				//2. switch to the iframe
				it('switching to the streaming media iframe', async () => {
					await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', mediaElementIFrame);
					/*
					await driver.switchTo().frame(driver.findElement(By.css('div[class*=' +
					 (streamingMediaBlockValues.mediaType.toLowerCase().includes('youtube') ? 'youtube' : 'libsyn') + '-container] iframe')));
					*/
					await driver.switchTo().frame(mediaElementIFrame);
				});
				
				if (streamingMediaBlockValues.mediaType.toLowerCase() === 'youtube') {
					//3. click the play button
					it('click media\'s play button to start playing', async () => {
						const largePlayButtonElement = await driver.findElement(By.css('div[class*=controls] button[class*=large-play]'));
						await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', largePlayButtonElement);
						await driver.sleep(500);
						largePlayButtonElement.click();
						await driver.sleep(500);  //wait the video start playing so the class on it will change
					});
					
					//4. check the video is playing -> class.contains('playing-mode')
					it('the streaming media is playing', async () => {
						mediaPlayerElement = await driver.findElement(By.css('.html5-video-player'));
						mediaPlayerClass = await mediaPlayerElement.getAttribute('class');
						expect(mediaPlayerClass).to.contain('playing-mode');
					});
					
					//5. click play btn again
					it('click media\'s play button to pause', async () => {
						//.html5-video-player div[class*=ytp][class*=controls]:nth-child(1)>button[class*=play]
						const playButtonElement = await driver.findElement(By.css('.html5-video-player div[class*=controls] button[class*=play]'));
						playButtonElement.click();
						await driver.sleep(500);  //wait the video stop playing so the class on it will change
					});
					
					//6. check the video is paused -> class.contains('paused-mode')
					it('the streaming media is paused', async () => {
						mediaPlayerClass = await mediaPlayerElement.getAttribute('class');
						expect(mediaPlayerClass).to.contain('paused-mode');
					});
				} else if (streamingMediaBlockValues.mediaType.toLowerCase() === 'youtube') {
					/// TODO: to build this later (the test for libsyn) - this is not necessarily similar to Youtube
					//still, the steps are same -> play, validate playing, pause, validate paused - check in case it is similar
				}
				
				it('switching out of the description iframe', async () => {
					const HANDLES = await driver.getAllWindowHandles();
					await driver.switchTo().window(HANDLES[0]);
				});
				
				if (streamingMediaBlockValues.captionForMedia) {
					//streamingMediaBlockValues.captionForMedia   =   captionForMediaValue
					it('the streaming media caption is ' + captionForMediaValue, async () => {
						const captionElement = await blockElements[(blockNumber - 1)].findElement(By.css('div[class*=' +
						 (streamingMediaBlockValues.mediaType.toLowerCase().includes('youtube') ? 'youtube]' : 'libsyn]') +
						 ' p.caption'));
						let captionText = await captionElement.getText();
						// console.log('captionText: ' + captionText);
						expect(captionText.toLowerCase()).to.equal(captionForMediaValue.toLowerCase());
					});
				}
				
				
				if (streamingMediaBlockValues.creatorCredit) {
					//streamingMediaBlockValues.creatorCredit   =   creatorCredit
					it('the streaming media creator credit is ' + creatorCredit, async () => {
						const creatorCreditElement = await blockElements[(blockNumber - 1)].findElement(By.css('div[class*=' +
						 (streamingMediaBlockValues.mediaType.toLowerCase().includes('youtube') ? 'youtube]' : 'libsyn]') +
						 ' p.credit'));
						let creatorCreditText = await creatorCreditElement.getText();
						// console.log('creatorCreditText: ' + creatorCreditText);
						expect(creatorCreditText.toLowerCase()).to.equal(creatorCredit.toLowerCase());
					});
				}
			});
		});
	};
	
	UofC.editMarketoBlock = (marketoBlockValues, attachmentPath) => {
		describe('edit the marketo block nr ' + marketoBlockValues.nrMarketoBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Marketo block"]', marketoBlockValues.nrMarketoBlockToEdit);
			
			const HEADING_VALUE = marketoBlockValues.headingValue + ' ' + Math.floor((Math.random() * 1000) + 1);
			typeBlockHeading('marketo-head', HEADING_VALUE);
			
			const DESCRIPTION_VALUE = marketoBlockValues.descriptionValue ? marketoBlockValues.descriptionValue + ' '
			 + Math.floor((Math.random() * 1000) + 1) : '';
			if (marketoBlockValues.descriptionValue) {
				typeBlockDescription('marketo-desc', DESCRIPTION_VALUE);
			}
			
			//type marketo code snippet
			it('type the marketo code snippet as ' + marketoBlockValues.codeSnippet, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog textarea[id*=code-snippet]', marketoBlockValues.codeSnippet);
			});
			
			//upload the image
			if (marketoBlockValues.imageUpload && attachmentPath) {
				uploadBackgroundImage(marketoBlockValues.imageUpload, attachmentPath);
			}
			
			describe('save the changes added to the marketo block #' + marketoBlockValues.nrMarketoBlockToEdit, () => {
				clickSaveButtonAfterBlockEdited();
			});
			
			const blockNumber = marketoBlockValues.nrMarketoBlockToEdit ? marketoBlockValues.nrMarketoBlockToEdit : 1;
			describe('validate marketo block #' + blockNumber + ' edits were applied', () => {
				const validationValues = {
					"blockType": "Marketo",
					"blockNumber": marketoBlockValues.nrMarketoBlockToEdit,
					"headingValue": HEADING_VALUE,
					"descriptionValue": DESCRIPTION_VALUE
				};
				validateBlockEditsApplied(validationValues);
				
				//validate "Collection of personal Information" - title
				let blockElements;
				
				///NOTE: the legal section exists always -- these were not part of the test case at the time of development
				it('the marketo legal section\'s title is collection of personal information', async () => {
					blockElements = await driver.findElements(By.css('div[class*=ucws-marketo]'));
					// console.log('blockElements.length: ' + blockElements.length);
					
					const legalSectionTitleElement = await blockElements[blockNumber - 1].findElement(By.css('.marketo-legal span'));
					const legalSectionTitleText = await legalSectionTitleElement.getText();
					expect(legalSectionTitleText.toLowerCase()).to.equal('Collection of personal information'.toLowerCase())
				});
				
				//validate "Collection of personal Information" - context / text
				///// .marketo-legal p:not([span]) ---> not tested, probably is not working --->
				/*
				Your personal information is collected under the authority of section 33(c) of the Freedom of Information and Protection of Privacy Act, and is required for updating your email subscription preferences. If you have any questions about the collection or use of this information, please contact University Relations at digital@ucalgary.ca
				 */
				
				if (marketoBlockValues.imageUpload && attachmentPath) {
					//check the bg image exists - DONE
					it('the background of the marketo block #' + blockNumber + ' is ' +
					 marketoBlockValues.imageUpload.backgroundImage + ' image', async () => {
						const backgroundElement = await blockElements[blockNumber - 1].findElement(By.css('div'));
						const elementBgStyle = await backgroundElement.getCssValue('background-image');
						
						expect(elementBgStyle.toLowerCase()).to.contain(((marketoBlockValues.imageUpload.backgroundImage).substring(0,
						 marketoBlockValues.imageUpload.backgroundImage.lastIndexOf('.'))).toLowerCase());
					});
				} else {
					//check the bg image does not exists - DONE
					it('the background of the marketo block #' + blockNumber + ' is not an image', async () => {
						const backgroundElement = await blockElements[blockNumber - 1].findElement(By.css('div'));
						const elementBgStyle = await backgroundElement.getCssValue('background-image');
						
						expect(elementBgStyle.toLowerCase()).to.contain(('none').toLowerCase());
						expect(elementBgStyle.toLowerCase()).to.not.contain(('.jpg').toLowerCase());
						expect(elementBgStyle.toLowerCase()).to.not.contain(('.jpeg').toLowerCase());
						expect(elementBgStyle.toLowerCase()).to.not.contain(('.png').toLowerCase());
					});
					
					/// NOTE: the one below might potentially needs to be ignored as we've already verifyed above that bg is not an image
					/*
					//check bg is white
					it('the background of the marketo block #' + blockNumber + ' is white', async () => {
						//TODO -- finish this, find the correct element
						const backgroundElement = await blockElements[blockNumber - 1].findElement(By.css('div[class=row]'));
						let elementBgColour = await backgroundElement.getCssValue('background-color');  //rgba(207, 7, 34, 1) -> red
						elementBgColour = await returnHexColor(elementBgColour);  //transform from rgb to hex
						console.log('elementBgColour: ' + elementBgColour);
						
						expect(elementBgColour.toLowerCase()).to.equal(('white').toLowerCase());
						console.log('not finished - not sure what element carries the background-color: white -- sent an email to Keanu');
						
					});
					*/
				}
				
				//TODO: the checks below were not part of the test case at the time of creating this function
				if (marketoBlockValues.codeSnippet === '8233') {
					//on code snippet 8233 there are only 3 fields - check they exist
					//First Name [placeholder = First Name]
					//Last Name [placeholder = Last Name]
					//Email Address [placeholder = Email Address]
					
				} else if (marketoBlockValues.codeSnippet === '8996') {
					//on code snippet 8966 there are 4 fields & 3 checkboxes (unselected) - check they exist
					//--- Text Fields --------------------------------------
					//First Name [placeholder = First Name]
					//Last Name [placeholder = Last Name]
					//Email Address [placeholder = Email Address]
					
					//--- Checkboxes ---------------------------------------
					//Participating in research studies and trials
					//Research partnership opportunities
					//Public research events and activities
					
					//--- Text Fields --------------------------------------
					//Topics of interest [placeholder = Topics of interest]
				}
			});
		});
	};
	
	UofC.editCampusMapBlock = (campusMapBlockValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		describe('edit the campus map block nr ' + campusMapBlockValues.nrCampusMapBlockToEdit, () => {
			clickEditBlockButton('div.block a[title="Edit Campus Map block"]', campusMapBlockValues.nrCampusMapBlockToEdit);
			
			const HEADING_VALUE = campusMapBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
			typeBlockHeading('ucws-campus-map-heading', HEADING_VALUE);
			
			it('type the building number as ' + campusMapBlockValues.buildingNumber, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=build-num]', campusMapBlockValues.buildingNumber);
			});
			
			if (campusMapBlockValues.roomNumber) {
				it('type the building number as ' + campusMapBlockValues.roomNumber, async () => {
					await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=room-num]', campusMapBlockValues.roomNumber);
				});
			}
			
			clickSaveButtonAfterBlockEdited();
			
			describe('validate campus map block#' + campusMapBlockValues.nrCampusMapBlockToEdit + 'edits were applied', () => {
				const validationValues = {
					"blockType": "Campus Map",
					"blockNumber": campusMapBlockValues.nrCampusMapBlockToEdit,
					"headingValue": HEADING_VALUE
				};
				
				validateBlockEditsApplied(validationValues);
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
			await driver.switchTo().frame(driver.findElement(By.css('.ui-dialog div[id*=' + descFrameCssLocator + '] iframe')));
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
	//NOTE: the value of bgColourItemNr should be numeric (from 1 to 8) to match available colors & css locators
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
	
	//USAGES:   MORE INFO, CHECKLIST, DIVIDER
	//NOTE: the value of bgColor should be numeric (from 1 to 8) to match available colors & css locators
	const setAccentOrLineColour = async (bgColourItemNr) => {
		//validate that the parameter matches the available values
		if (bgColourItemNr > 10 || bgColourItemNr < 1) {
			throw 'bgColourItemNr is ' + bgColourItemNr + ' but it should be between 1 and 10, please correct the data';
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
		
		let selectedColor = (bgColourItemNr === 1) ? color1 : (bgColourItemNr === 2) ? color2 : (bgColourItemNr === 3) ?
		 color3 : (bgColourItemNr === 4) ? color4 : (bgColourItemNr === 5) ? color5 : (bgColourItemNr === 6) ? color6 :
			(bgColourItemNr === 7) ? color7 : (bgColourItemNr === 8) ? color8 : (bgColourItemNr === 9) ? color9 :
			 (bgColourItemNr === 10) ? color10 : 'this color is not available: ' + bgColourItemNr;
		// console.log('selectedColor: ' + selectedColor);
		
		it('set the accent/line color to ' + selectedColor, async () => {
			//same objects available for all block types even though the labels differ as next: Accent Coulour vs Line Coulour (Divider block)
			//bring the button to the screen:
			// 'button[class*=color][color*="' + selectedColor + '"]'
			// div[class*="accent_color"]>button[class*=color][color*="#CF0722"]
			const colorBtnElement = await driver.findElement(By.css('button[class*=color][color*="' + selectedColor + '"]'));
			await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', colorBtnElement);
			await colorBtnElement.click();
		});
	};
	
	//USAGES:   BANNER, CHECKLIST, SIDEKICK CTA,
	///NOTE !!!!! ---- there is a checkbox also, called "Round image corners" -- IMAGE,
	const setRoundedCorners = async (roundedCornersValue) => {
		it('select the rounded corners as ' + roundedCornersValue, async () => {
			//select[id*=ucws-banner-round-corners] OR select[id*=ucws-more-info-rcorners] OR etc..
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
	
	const selectBlockNumberOfColumns = async (contentBlockNr, numberOfColumnsValue) => {
		//USED BY: editAccordionBlock, editTextBlock
		it('select the number of columns for this block as ' + numberOfColumnsValue, async () => {
			await UofC.setSelectDropDownValueByCSS('*:nth-child(' + contentBlockNr + ') select[id*=num][id*=col]', numberOfColumnsValue);
		});
	};
	
	
	const validateBlockEditsApplied = async (validationValues) => {
		//available parameters & value examples:
		/// blockType, blockNumber, headingValue, descriptionValue, numberOfColumns, displayStyle, bgColourItemNr, ctaButtons
		// validationValues.blockType
		// validationValues.blockNumber
		// validationValues.headingValue
		// validationValues.descriptionValue
		// validationValues.numberOfColumns
		// validationValues.displayStyle
		// validationValues.bgColourItemNr          (more info / checklist)
		// validationValues.accentLineColourItemNr  (more info / checklist / divider)
		// validationValues.lineStyle               (divider)
		// validationValues.imageUpload
		// validationValues.ctaButtons
		
		///// USAGE:
		/**
		 * //1st: declare the json array this way
		 const validationValues = {
				"blockType": "Hero CTA",                        //"More Info" / "Banner"  / "Image with Text" / "etc..."
				"blockNumber": 1                                // 1  / 2 / 3 / etc..
				"headingValue": HEADING_VALUE,                  //"Hero CTA Block Heading" + Math(...)
				"descriptionValue": DESCRIPTION_VALUE,          //"Hero CTA Block Description: Lorem Ipsum.." + Math(...)
				"numberOfColumns": 1,                           // 1  / 2 / 3 / etc..
				"displayStyle": ctaHeroValues.displayStyle      //"Background Image"  / "Background Colour"
				"bgColourItemNr": ctaHeroValues.bgColourItemNr, // 1  / 2 / 3 - up to 8
				"accentLineColourItemNr": dividerBlockValues.bgColourItemNr   // 1  / 2 / 3 - up to 10
				"lineStyle": dividerBlockValues.lineStyle                     // Solid / Dotted
				"imageUpload": ctaHeroValues.imageUpload,       //{"backgroundImage": "image.jpg", "imageAltText": "Image Alt Text"}
				"ctaButtons": ctaHeroValues.ctaButtons ? ctaHeroValues.ctaButtons : null  // "ctaButtons": { "url1": "https://www.google.ca", "btnLabel1": "Hero CTA Btn#1 Label#1"}
			};
		 
		 //2nd: throw the array into the function as a parameter - it'll know what to do with the values
		 validateBlockEditsApplied(validationValues);
		 */
		
		before(async () => {
			//yellow bottom bar & yellow navigation up arrow
			await UofC.hideElementByCSS('.insightera-bar');
			await UofC.hideElementByCSS('.insightera-tab-container');
			
			//viewport dimensions bottom div
			//await UofC.hideElementByCSS('#window-size');
		});
		
		//if block# was not declared then set it to 1 by default (e.g.: hero blocks are always 1)
		const blockNumber = validationValues.blockNumber ? validationValues.blockNumber : 1;  //block number is always 1 if not declared (else whatever was declared)
		
		const popupMessage = ((validationValues.blockType.toLowerCase().includes('more info')) ? 'More Information' :
		 (validationValues.blockType.toLowerCase().includes('sidekick')) ? 'Sidekick CTA' : validationValues.blockType) +
		 ' has been updated.';
		
		UofC.popUpConfirmation(popupMessage, waitShort);  //Image with Text (this is how it is for this block type)
		
		//******************************************************************************************************************
		const blockCssLocator = (validationValues.blockType.toLowerCase()).includes('image with text') ?
		 'div[class*=ucws-' + ((validationValues.blockType.toLowerCase()).replace(/ /gi, '-')).replace('-with-text', '_text') + ']' :
		 'div[class*=ucws-' + (validationValues.blockType.toLowerCase()).replace(/ /gi, '-') + ']';
		
		let blockElements;
		it('find all the ' + validationValues.blockType + ' blocks', async () => {
			///this is the only place where we set the element - all others below should only use it
			blockElements = await driver.findElements(By.css(blockCssLocator));  //hero or non-hero heading (h1 or h2)
			// console.log('blockElements.length: ' + blockElements.length); //if object exists then the value should be > 0
		});
		
		//******************************************************************************************************************
		//1. check HEADING -- headingValue / field is required -- the divider & .. has no heading
		if ((validationValues.blockType).toLowerCase() !== 'divider' &&
		 (validationValues.blockType).toLowerCase() !== 'info shim' &&
		(validationValues.blockType).toLowerCase() !== 'related content') {
			it('the heading of the ' + validationValues.blockType + ' block #' + blockNumber + ' is ' +
			 validationValues.headingValue, async () => {
				//find the header element within the block
				const headingElement = await blockElements[(blockNumber - 1)].findElement(By.css('h' +
				 (validationValues.blockType.toLowerCase().includes('hero') ? 1 : 2)));
				let headingText = await headingElement.getText();
				// console.log('headingText: ' + headingText);
				expect(headingText.toLowerCase()).to.equal(validationValues.headingValue.toLowerCase());
			});
		}
		
		//2. check DESCRIPTION -- descriptionValue / field not required
		if (validationValues.descriptionValue) {
			const blockDescriptionValue = validationValues.descriptionValue.length > 50 ?
			 validationValues.descriptionValue.substring(0, 50) + '...' : validationValues.descriptionValue;
			it('the description of the ' + validationValues.blockType + ' block #' + blockNumber + ' is ' +
			 blockDescriptionValue, async () => {
				const descriptionElement = await blockElements[(blockNumber - 1)].findElement(By.css('p:not(a)'));
				let descriptionText = await descriptionElement.getText();
				
				if (validationValues.ctaButtons) {
					descriptionText = descriptionText.replace(' ' + validationValues.ctaButtons.btnLabel1, '')
				}
				
				// console.log('descriptionText: ' + descriptionText);
				expect(descriptionText.toLowerCase()).to.equal(validationValues.descriptionValue.toLowerCase());
			});
		}
		
		//3. check NUMBER OF COLUMNS -- numberOfColumns / not required --- BLOCKS: Text / ???)
		if (validationValues.numberOfColumns) {
			it('the number of columns within the ' + validationValues.blockType + ' block #' + blockNumber + ' is ' +
			 validationValues.numberOfColumns, async () => {
				
				//if validationValues.blockType = Accordion -> there could be multiple content sections with 1 or 2 columns
				// we need to check each one to contain the correct amount of cols for every added content section
				// div[class*=layout-blocks-ucws-accordion] div[aria-expanded=true] div[class*=-col]:not([class*=collapse])
				// TODO: add later when will have some time
				
				// div[class*=layout-blocks-ucws-text] div[class*=-col]:not([class*=collapse])
				//div[aria-expanded=true]
				// const columnsElement = await driver.findElement(By.css('div[class*=layout-blocks-ucws-text] div[class*=-col]'));
				const columnsElement = await driver.findElement(By.css('div[class*=layout-blocks-ucws-' +
				 (validationValues.blockType).toLowerCase() + '] div[class*=-col]:not([class*=collapse])'));
				const elementClass = await columnsElement.getAttribute('class');
				let numberOfColumns;
				if (validationValues.numberOfColumns.includes('1')) {
					numberOfColumns = 'one';
				} else if (validationValues.numberOfColumns.includes('2')) {
					numberOfColumns = 'two';
				}
				
				const expectedClass = numberOfColumns + '-col';
				expect(elementClass.toLowerCase()).to.contain(expectedClass.toLowerCase());
			});
		}
		
		//4. check DISPLAY STYLE -- displayStyle / field not required OR imageUpload.backgroundImage exists
		////4.1 --------------------- BACKGROUND IMAGE --------------------------------------------
		if ((validationValues.displayStyle && validationValues.displayStyle === 'Background Image') || validationValues.imageUpload) {
			//check image's size is at least w1024*h800 (was 990x600px)
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
		}
		
		////4.2 --------------------- BACKGROUND COLOUR -------------------------------------------
		if(validationValues.displayStyle && validationValues.displayStyle === 'Background Colour' || validationValues.bgColourItemNr) {
			if (validationValues.bgColourItemNr > 8 || validationValues.bgColourItemNr < 1) {
				throw 'bgColourItemNr is ' + validationValues.bgColourItemNr +
				' but it should be between 1 and 8, please correct the data';
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
			
			let selectedColor = (
			 validationValues.bgColourItemNr === 1) ? color1 : (validationValues.bgColourItemNr === 2) ?
			 color2 : (validationValues.bgColourItemNr === 3) ? color3 : (validationValues.bgColourItemNr === 4) ?
				color4 : (validationValues.bgColourItemNr === 5) ? color5 : (validationValues.bgColourItemNr === 6) ?
				 color6 : (validationValues.bgColourItemNr === 7) ? color7 : (validationValues.bgColourItemNr === 8) ?
					color8 : 'this color is not available: ' + validationValues.bgColourItemNr;
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
		}
		
		////4.3 --------------------- ACCENT / LINE COLOUR ---------------------------------------
		if (validationValues.accentLineColourItemNr) {
			if (validationValues.accentLineColourItemNr > 10 || validationValues.accentLineColourItemNr < 1) {
				throw 'accentLineColourItemNr is ' + validationValues.accentLineColourItemNr +
				' but it should be between 1 and 10, please correct the data';
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
			
			let selectedColor = (
			 validationValues.accentLineColourItemNr === 1) ? color1 : (validationValues.accentLineColourItemNr === 2) ?
			 color2 : (validationValues.accentLineColourItemNr === 3) ? color3 : (validationValues.accentLineColourItemNr === 4) ?
				color4 : (validationValues.accentLineColourItemNr === 5) ? color5 : (validationValues.accentLineColourItemNr === 6) ?
				 color6 : (validationValues.accentLineColourItemNr === 7) ? color7 : (validationValues.accentLineColourItemNr === 8) ?
					color8 : (validationValues.accentLineColourItemNr === 9) ? color9 : (validationValues.accentLineColourItemNr === 10) ?
					 color10 : 'this color is not available: ' + validationValues.accentLineColourItemNr;
			// console.log('selectedColor: ' + selectedColor);
			
			//find the block & retrieve it's bg color and compare with the expected color
			it('block\'s accent/line colour is ' + selectedColor, async () => {
				let accentLineElements;
				if ((validationValues.blockType).toLowerCase() === 'divider') { //we also have this for the checklist & more info blocks
					accentLineElements = await blockElements[(blockNumber - 1)].findElements(By.css('div[class*=ucws-divider] hr'));
				} else if ((validationValues.blockType).toLowerCase() === 'info shim') { //we also have this for the checklist & more info blocks
					accentLineElements = await blockElements[(blockNumber - 1)].findElements(By.css('div[class*=ucws-info-shim] span'));
				} else {
					accentLineElements = await blockElements[(blockNumber - 1)].findElements(By.css('div[class*="item"]:not([class*="items"]) span'));
				}
				
				if (accentLineElements.length > 0) {
					await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', accentLineElements[0]);
					
					let elementAccentLineColour;
					if ((validationValues.blockType).toLowerCase() === 'divider') {                             //div[class*=ucws-info-shim] hr
						elementAccentLineColour = await accentLineElements[0].getCssValue('border-bottom-color');
					} else if ((validationValues.blockType).toLowerCase() === 'info shim') {                    //div[class*=ucws-info-shim] span
						elementAccentLineColour = await accentLineElements[0].getCssValue('color');
					} else {
						elementAccentLineColour = await accentLineElements[0].getCssValue('background-color');    //div[class*="item"]:not([class*="items"]) span
					}
					
					// console.log('elementAccentLineColour (before transform): ' + elementAccentLineColour);
					elementAccentLineColour = await returnHexColor(elementAccentLineColour);  //transform from rgb to hex
					// console.log('elementAccentLineColour (after transform): ' + elementAccentLineColour);
					expect(elementAccentLineColour.toLowerCase()).to.equal(selectedColor.toLowerCase());
				} else {
					throw 'at least one accent/line element is expected but there are none';
				}
			});
		}
		
		if (validationValues.lineStyle) {
			it('block\'s line style is ' + validationValues.lineStyle, async () => {
				let lineElements = await blockElements[(blockNumber - 1)].findElements(By.css('div[class*=ucws-divider] hr'));
				if (lineElements.length > 0) {
					let elementLineStyle = await lineElements[0].getAttribute('class'); //should include dotted or solid
					expect(elementLineStyle.toLowerCase()).to.contain((validationValues.lineStyle).toLowerCase());
				} else {
					throw 'at least one line element is expected but there are none';
				}
			});
		}
		
		//5. check CTA -- btn's label, click on it and validate the correct URL loads in a new tab
		// close the tab and do same for 2nd CTA btn if it got added above
		//TODO: review if I can somehow modify this piece of the function and make it smaller (it repeats twice, for URL1 & URL2)
		if (validationValues.ctaButtons && validationValues.ctaButtons.btnLabel1) {
			let ctaButtonElements, ctaButtonElement;
			it('the cta button 1 label\'s text equals to ' + validationValues.ctaButtons.btnLabel1, async () => {
				
				if ((validationValues.blockType).toLowerCase() === 'info shim') {
					ctaButtonElements = await blockElements[(blockNumber - 1)].findElements(By.css('div[class*=ucws-info-shim] a[href*="' + validationValues.ctaButtons.url1 + '"]'));
				} else {
					ctaButtonElements = await blockElements[(blockNumber - 1)].findElements(By.css('a.btn-default')); //was: .btn-wrapper
				}
				
				ctaButtonElement = ctaButtonElements[0];
				const ctaButton1LabelText = await ctaButtonElement.getText();
				// console.log('ctaButton1LabelText: ' + ctaButton1LabelText);
				expect(ctaButton1LabelText.toLowerCase()).to.equal((validationValues.ctaButtons.btnLabel1).toLowerCase());
			});
			
			it('click the ' + validationValues.ctaButtons.btnLabel1 + ' button', async () => {
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', ctaButtonElement);
				await ctaButtonElement.click();
			});
			
			switchToOtherTabAndOrVerifyTheUrl(validationValues.ctaButtons.url1);
			close2ndOpenTabOrNavigateBack();
		}
		
		if (validationValues.ctaButtons && validationValues.ctaButtons.btnLabel2) {
			let ctaButtonElements, ctaButtonElement;
			it('the cta button 2 label\'s text equals to ' + validationValues.ctaButtons.btnLabel2, async () => {
				ctaButtonElements = await blockElements[(blockNumber - 1)].findElements(By.css('a.btn-default'));
				ctaButtonElement = ctaButtonElements[1];
				const ctaButton2LabelText = await ctaButtonElement.getText();
				// console.log('ctaButton2LabelText: ' + ctaButton2LabelText);
				expect(ctaButton2LabelText.toLowerCase()).to.equal((validationValues.ctaButtons.btnLabel2).toLowerCase());
			});
			
			it('click the ' + validationValues.ctaButtons.btnLabel2 + ' button', async () => {
				await driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', ctaButtonElement);
				await ctaButtonElement.click();
			});
			
			switchToOtherTabAndOrVerifyTheUrl(validationValues.ctaButtons.url2);
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
				throw 'having no tabs is not possible neither more than 2 tabs but we have: ' +
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
		let fullBtnName = (btnName.toLowerCase() === 'save') ?
		 'save page layout' : (btnName.toLowerCase() === 'cancel') ?
			'cancel layout' : (btnName.toLowerCase() === 'revert') ?
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
