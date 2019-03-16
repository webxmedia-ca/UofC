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
					UofC.validateDisplayedText('.messages.status', pageCreatedMessage);
					
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
								// console.log('\nthe actualUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url1 + '\n');
								expect(actualUrl.toLowerCase()).to.include(includedInUrl);
							});
							
							//check if the menu got added to the page and the menu title matches menuLinkTitle
							if (newPageParameters.menuSettingsValues) {
								it('verify that "' + menuLinkTitle + '" link is displayed in the <main menu>', async () => {
									await UofC.waitForObjectLoad('.uc-mainmenu.current>a', waitLong * 3, 500, true);
								});
								
								//verify menu link's title
								UofC.validateDisplayedText('.uc-mainmenu.current>a', menuLinkTitle);
							}
						}
					});
				}
			});
		});
	};
	
	UofC.addNewSection = (addLayoutBtnNr, columnsLayoutNr) => {
		describe('add a new section by clicking the add layout btn nr ' + addLayoutBtnNr +
		  ' and select the layout ' + columnsLayoutNr, () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			it('click the add layout button nr ' + addLayoutBtnNr, async () => {
				const addLayoutLinkElements = await driver.findElements(By.css('#layout-builder>.new-section>a'));
				const addLayoutLinksCounter = addLayoutLinkElements.length;
				if (addLayoutLinksCounter > 0) {
					if (addLayoutLinksCounter <= addLayoutBtnNr) {
						const addLayoutLinkElement = addLayoutLinkElements[(addLayoutBtnNr - 1)];
						// if (addLayoutLinksCounter > 1) {
							//scroll down on the page if we need to click the add section buttons other than the first hero
							// this will bring the buttons up on the screen so they are visible and can be clicked
							await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});',
							  addLayoutLinkElement);
							driver.sleep(200);
							await addLayoutLinkElement.click();
							await UofC.waitForPageLoad();
							await UofC.waitForObjectLoad('.ui-dialog', waitShort, 500, true);
						// }
					} else {
						throw 'you cannot click on add layout button nr ' + addLayoutBtnNr +
						' because only next add layout button nrs are available: ' + addLayoutLinksCounter
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
	
	UofC.addNewBlock = (addBlockBtnNr, blockCategory, blockExpectedCssLocator, categoryLinkGroupLocator,
	                    categoryLinkNameToClick, categoryExpectedCssLocator, reusableCheckbox, reusableBlockName,
	                    teamsCheckBoxesToSelect, expectedCssLocatorAfterBlockAdded) => {
		describe('click the add block btn nr ' + addBlockBtnNr + ' then ' + categoryLinkNameToClick + ' link', () => {
			before(async () => {
			
			});
			
			after(async () => {
			
			});
			
			// describe('admin menu - navigate to content -> add content -> basic page', () => {
			// 	UofC.navigateThroughAdminMenu('Content', 'BasicPage', '.page-title');
			// });
			
			it('click the add block button nr ' + addBlockBtnNr, async () => {
				await UofC.waitForPageLoad();
				
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
						await driver.sleep(500);
						await addBlockLinkElement.click();
						await UofC.waitForPageLoad();
						await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true); //waiting for the right side lists
					} else {
						throw 'you cannot click on add block button nr ' + addBlockBtnNr +
						' because only next add block button nrs are available: ' + addBlockBtnsCounter;
					}
				} else {
					throw "no add block buttons could be found, please check your parameters or if there is anything wrong in the app";
				}
			});
			
			//expand the block category you need
			UofC.expandCollapseAccordionItemByName(blockCategory, true, blockExpectedCssLocator);
			
			//click the link under your category
			UofC.clickLinkFromGroupByName(categoryLinkGroupLocator, categoryLinkNameToClick, categoryExpectedCssLocator);
			
			//UCWS-683
			it('the reusable checkbox is selected as default', async () => {
				let inputElement = await driver.findElement(By.css('input[name*="settings[reusable]"]'));
				inputElement = await driver.wait(until.elementIsVisible(inputElement), waitShort);
				const elementChecked = await inputElement.getAttribute('checked'); //or we can get the "value" which = 1 or 0
				expect(elementChecked).to.equal('true');
				// if (elementChecked !== 'true') {
				// 	throw 'the "reusable checkbox" is expected to be checked as default while it is: ' + elementChecked;
				// }
			});
			
			//UCWS-683
			if (reusableCheckbox) {
				it('set the reusable checkbox to ' + reusableCheckbox, async () => {
					await UofC.setButtonCheckboxByCSS('input[id*=gradient-value]', reusableCheckbox);
				});
			}
			
			//UCWS-683
			it('the reusable block name text field exists, is is visible and enabled', async () => {
				await UofC.waitForObjectLoad('input[name*="settings[reusable_block_title]"]', waitShort, 500, true)
			});
			
			//UCWS-683
			if(reusableBlockName) {
				it('type the reusable block name as ' + reusableBlockName, async () => {
					await UofC.setTextFieldValueByCSS('input[name*="settings[reusable_block_title]"]', reusableCheckbox);
				});
			}
			
			if (teamsCheckBoxesToSelect) {
				//assign the Teams (select the checkboxes for the teams you want)
				UofC.selectMultipleCheckboxesInAGroup('div[id*=edit-settings-teams]', teamsCheckBoxesToSelect);
			}
			
			it('click add block button', async () => {
				await UofC.clickElementByCSS('input[id*=edit-actions-submit]');
				await UofC.waitForPageLoad();
			});
			
			it('validate the ' + categoryLinkNameToClick + ' block is created by waiting for '
			  + expectedCssLocatorAfterBlockAdded + ' object', async () => {
				await UofC.waitForObjectLoad(expectedCssLocatorAfterBlockAdded, waitLong * 5, 1000, true);
			});
			
			if (categoryLinkNameToClick === 'Add Hero CTA' || categoryLinkNameToClick === 'Add Image with Text') {
				UofC.popUpConfirmation('You have unsaved changes.', waitShort);
			}
		});
	};
	
	//NOTE: multiple editBlock functions are needed based on block type
	//e.g. editHeroCTABlock / editTextHeroCTABlock/ editStreamingMediaBlock / etc...
	UofC.editHeroCTABlock = (ctaHeroValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		// headingValue, descriptionValue, textPosition, textAlignment, bgColour, overlaidTextColour, backgroundImagePath
		const headingValue = ctaHeroValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
		let descriptionValue;
		if (ctaHeroValues.descriptionValue) {
			descriptionValue = ctaHeroValues.descriptionValue + ' ' + Math.floor((Math.random() * 100) + 1);
		}
		
		describe('edit the hero cta block', () => {
			//NOTE: figure out what are the required fields here and add 'ifs' for those which are not
			it('click the edit this block button', async () => {
				//hero cta:         .hero-cta .block-editing>a
				//text hero cta:    .text-hero-cta .block-editing>a
				//both above:       div[class*="hero-cta"] .block-editing>a     OR  .block-editing>a
				const editBlockElements = await UofC.findElementsByCSS('.hero a[title="Edit Hero Call to Action block"]');
				//ANOTHER NEW:  .hero .block-editing>a[title="Edit Hero Call to Action block"]
				//OLD:          .hero-cta .block-editing>a
				if (editBlockElements.length > 0) {
					//bring the button into the view
					await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', editBlockElements[0]);
					// await UofC.clickElementByCSS('.hero-cta .block-editing>a');
					editBlockElements[0].click();
					await UofC.waitForPageLoad();
					await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
				} else {
					throw '"edit this block" button for the hero cta block could not be found';
				}
			});
			
			it('type the heading as ' + headingValue, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=ucws-hero-cta-heading]', headingValue);
			});
			
			if (ctaHeroValues.descriptionValue) {
				it('switching to the description iframe', async () => {
					await driver.switchTo().frame(driver.findElement(By.css('div[id*=ucws-hero-cta-desc] iframe')));
				});
				
				it('type the description as ' + descriptionValue, async () => {
					await UofC.setTextFieldValueByCSS('.cke_editable', descriptionValue);
				});
				
				//here might need to switch off the iframe above
				it('switching out of the description iframe', async () => {
					const handles = await driver.getAllWindowHandles();
					await driver.switchTo().window(handles[0]);
				});
			}
			
			if (ctaHeroValues.textPosition) {
				it('select the text position as ' + ctaHeroValues.textPosition, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=hero-cta-tposition]', ctaHeroValues.textPosition);
				});
			}
			
			if (ctaHeroValues.textAlignment) {
				it('select the text alignment as ' + ctaHeroValues.textAlignment, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=hero-cta-talignment]', ctaHeroValues.textAlignment);
				});
			}
			
			//the value of bgColor should be numeric (from 1 to 7) to match available colors & css locators
			if (ctaHeroValues.bgColourItemNr) {
				//validate that the parameter matches the available values
				if (ctaHeroValues.bgColourItemNr > 7 || ctaHeroValues.bgColourItemNr < 1) {
					throw 'ctaHeroValues.bgColourItemNr is ' + ctaHeroValues.bgColourItemNr + ' but it should' +
					'be between 1 and 7, please correct the data';
				}
				
				let color1, color2, color3, color4, color5, color6, color7;
				color1 = '#CF0722';
				color2 = '#FF671F';
				color3 = '#FFA300';
				color4 = '#CE0058';
				color5 = '#A6192E';
				color6 = '#6B3529';
				color7 = '#8D827A';
				
				const bgColor = ctaHeroValues.bgColourItemNr;
				let selectedColor = (bgColor === 1) ? color1 : (bgColor === 2) ? color2 : (bgColor === 3) ? color3 :
				  (bgColor === 4) ? color4 : (bgColor === 5) ? color5 : (bgColor === 6) ? color6 : (bgColor === 7) ?
					color7 : 'this color is not available: ' + bgColor;
				// console.log('selectedColor: ' + selectedColor);
				
				it('set the background color to ' + selectedColor, async () => {
					//css e.g. which works: button[class*=color][color*="#FF671F"] OR button[color*="#FF671F"]
					await UofC.clickElementByCSS('button[class*=color][color*="' + selectedColor + '"]');
				});
			}
			
			if (ctaHeroValues.overlaidTextColour) {
				it('select the overlaid text colour as ' + ctaHeroValues.overlaidTextColour, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=hero-cta-tcolour]', ctaHeroValues.overlaidTextColour);
				});
			}
			
			if (ctaHeroValues.backgroundImage) {
				const imagePreviewAndLinkLocator = ctaHeroValues.backgroundImage.substring(0, ctaHeroValues.backgroundImage.lastIndexOf('.'));
				it('upload the ' + ctaHeroValues.backgroundImage + ' background image', async () => {
					//TODO: comment/remove the lines below when the issue with finding the image in GitLab is solved
					console.log('\nimage path here: ------------------------------------------------------------------');
					console.log('attachmentPath       : ' + attachmentPath);
					console.log('image path here: ------------------------------------------------------------------\n');
					
					await UofC.setFileUploadByCSS('input[id*=upload][type=file]', attachmentPath);
				});
				
				it('validate that image\'s preview and the ' + ctaHeroValues.backgroundImage + ' link are displayed', async () => {
					//validate the image preview is displayed
					await UofC.waitForObjectLoad('img[data-drupal-selector*=preview]', waitLong * 3, 500, true);
					
					//validate image link is displayed
					await UofC.waitForObjectLoad('a[href*="' + imagePreviewAndLinkLocator + '"]', waitLong, 500, true);
				});
				
				//validate that the image link contains the correct title
				UofC.validateDisplayedText('a[href*="' + imagePreviewAndLinkLocator + '"]', ctaHeroValues.backgroundImage);
				
				if (ctaHeroValues.imageAltText) {
					const imageAltText = ctaHeroValues.imageAltText + ' ' + Math.floor((Math.random() * 100) + 1);
					it('type the alternative text as ' + imageAltText, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=alt]', imageAltText);
					});
				}
				
				// crop image - this functionality is not yet done - Keanu said it is not used and there isn't much we can
				//test as this is more of a visual validation of few different cropping options --- DISABLED FOR NOW
				/*
				if (ctaHeroValues.cropImage) {
					if cropImage = true then:
					1. expand the Crop image section
					2. click one of the crop links - select the area of the image that will appear to users
					3. check that the text of select crop option is displayed underneath the available options links
				}
				*/
			}
			
			if (ctaHeroValues.doNotApplyGradient) {
				it('set the "do not apply gradient" checkbox to ' + ctaHeroValues.doNotApplyGradient, async () => {
					await UofC.setButtonCheckboxByCSS('input[id*=gradient-value]', ctaHeroValues.doNotApplyGradient);
				});
			}
			
			if (ctaHeroValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (ctaHeroValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (ctaHeroValues.ctaButtons.Url1) {
					it('type the url of button 1 as ' + ctaHeroValues.ctaButtons.Url1, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-0-uri]', ctaHeroValues.ctaButtons.Url1);
					});
					
					it('type the label of button 1 as ' + ctaHeroValues.ctaButtons.btnLabel1, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-0-title]', ctaHeroValues.ctaButtons.btnLabel1);
					});
				}
				
				if (ctaHeroValues.ctaButtons.Url2) {
					it('type the url of button 2 as ' + ctaHeroValues.ctaButtons.Url2, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-1-uri]', ctaHeroValues.ctaButtons.Url2);
					});
					
					it('type the label of button 2 as ' + ctaHeroValues.ctaButtons.btnLabel2, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-1-title]', ctaHeroValues.ctaButtons.btnLabel2);
					});
				}
				
				// if (!ctaHeroValues.ctaButtons.Url1 || !ctaHeroValues.ctaButtons.Url2) {
				// 	throw 'it seems there were no ctaHeroValues.ctaButtons.* parameters declared while we need at least' +
				// 	' one CTA URL' + ' & BtnLabel added\n either ctaHeroValues.ctaButtons should be removed from the data file';
				// }
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			it('click save button', async () => {
				const saveBtnElements = await driver.findElements(By.css('[id*=edit-submit]'));
				if (saveBtnElements.length > 0) {
					//scroll to the bottom of the page so the button is visible
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', saveBtnElements[0]);
					await driver.sleep(500);
					await saveBtnElements[0].click();
					await UofC.waitForPageLoad();
				} else {
					throw 'save button not found';
				}
			});
			
			describe('validate banner block\'s edits were applied', () => {
				UofC.popUpConfirmation('Hero CTA has been updated.', waitShort);
				
				//validate inserted values are displayed on the screen
				//1. check Block Heading   -   headingValue
				UofC.validateDisplayedText('div[class*=hero-cta] h1', headingValue);       //.cta-content>h1
				
				//2. check Block Description   -   descriptionValue
				if (ctaHeroValues.descriptionValue) {
					UofC.validateDisplayedText('div[class*=hero-cta] p', descriptionValue);    //.cta-content>p
				}
				
				//3. check image's size 1500x600px
				it('find block\'s background image and validate it\'s height is 600px', async () => {
					// main .hero:not([class*=col1])
					// const blockBgImage = await driver.findElement(By.css('main .hero:not([class*=col1])'));
					// const imgWidth = await blockBgImage.getCssValue('width');
					// const imgHeight = await blockBgImage.getCssValue('height');
					// console.log('imgWidth: ' + imgWidth + '\nimgHeight: ' + imgHeight);
					
					//.hero .bg-image [style*=background-image]
					const blockDivBgImage = await driver.findElement(By.css('.hero .bg-image [style*=background-image]'));
					// const imgWidth = await blockDivBgImage.getCssValue('width');
					const imgHeight = await blockDivBgImage.getCssValue('height');
					
					//console.log(/*'\nPASS: imgWidth: ' + imgWidth + */'\nimgHeight: ' + imgHeight);
					if (/*parseInt(imgWidth.replace('px', '')) > 1300 || */parseInt(imgHeight.replace('px', '')) !== 600) {
						throw '".hero .bg-image [style*=background-image]" object\'s hight is not equal to 600px' +
						'\nactual image\'s height is: ' + imgHeight;
					}
				});
				
				//4. check CTA btn's label, click on it and validate the correct URL loads in a new tab
				// close the tab and do same for 2nd CTA btn if it got added above
				if (ctaHeroValues.ctaButtons && ctaHeroValues.ctaButtons.btnLabel1) {
					UofC.validateDisplayedText('div[class*=hero-cta] .btn-wrapper>a:nth-child(1)', ctaHeroValues.ctaButtons.btnLabel1);
					
					it('click the ' + ctaHeroValues.ctaButtons.btnLabel1 + ' button', async () => {
						await UofC.clickElementByCSS('div[class*=hero-cta] .btn-wrapper>a:nth-child(1)');//.cta-content div>a:nth-child(1)
					});
					
					
					//TODO: maybe embed this into a secondary function -> checkNewUrlIsLoaded
					it('if another tab loaded switch to it either just verify that the loaded url includes ' +
					  ctaHeroValues.ctaButtons.Url1, async () => {
						//get all tabs and switch to the newly created one
						const handles = await driver.getAllWindowHandles();
						let actualUrl;
						//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
						// navigate back in the browser
						if (handles.length > 1 && handles.length < 3) {
							//switch to the other tab
							await driver.switchTo().window(handles[1]); //there are 2 tabs -> [0] & [1]
							await UofC.waitForPageLoad();
							actualUrl = await driver.getCurrentUrl();
							expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url1.toLowerCase());
						} else if (handles.length === 1) {
							actualUrl = await driver.getCurrentUrl();
							expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url1.toLowerCase());
						} else {
							throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
							handles.length + ' tabs displayed in the browser';
						}
						// console.log('\ndirUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url1 + '\n');
					});
					
					it('close the opened tab if multiple exist either navigate back in the browser', async () => {
						const handles = await driver.getAllWindowHandles();
						//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
						// navigate back in the browser - we should be on the 2nd tab already - from the step above
						if (handles.length > 1 && handles.length < 3) {
							//close the recently opened tab and switch back to tab[0] - 1st one:
							await driver.close();
							await driver.switchTo().window(handles[0]);
						} else if (handles.length === 1) {
							//navigate back in the browser / actual tab
							await driver.navigate().back();
						} else {
							throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
							handles.length + ' tabs displayed in the browser';
						}
					});
				}
				
				if (ctaHeroValues.ctaButtons && ctaHeroValues.ctaButtons.btnLabel2) {
					UofC.validateDisplayedText('div[class*=hero-cta] .btn-wrapper>a:nth-child(2)', ctaHeroValues.ctaButtons.btnLabel2);
					
					it('click the ' + ctaHeroValues.ctaButtons.btnLabel2 + ' button', async () => {
						await UofC.clickElementByCSS('div[class*=hero-cta] .btn-wrapper>a:nth-child(2)');//.cta-content div>a:nth-child(2)
					});
					
					//TODO: maybe embed this into a secondary function -> checkNewUrlIsLoaded
					it('if another tab loaded switch to it either just verify that the loaded url includes "' +
					  ctaHeroValues.ctaButtons.Url2 + '"', async () => {
						//get all tabs and switch to the newly created one
						const handles = await driver.getAllWindowHandles();
						let actualUrl;
						//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
						// navigate back in the browser
						if (handles.length > 1 && handles.length < 3) {
							//switch to the other tab
							await driver.switchTo().window(handles[1]); //there are 2 tabs -> [0] & [1]
							await UofC.waitForPageLoad();
							actualUrl = await driver.getCurrentUrl();
							expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url2.toLowerCase());
						} else if (handles.length === 1) {
							actualUrl = await driver.getCurrentUrl();
							expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url2.toLowerCase());
						} else {
							throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
							handles.length + ' tabs displayed in the browser';
						}
						// console.log('\ndirUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url1 + '\n');
					});
					
					it('close the opened tab if multiple exist either navigate back in the browser', async () => {
						const handles = await driver.getAllWindowHandles();
						//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
						// navigate back in the browser - we should be on the 2nd tab already - from the step above
						if (handles.length > 1 && handles.length < 3) {
							//close the recently opened tab and switch back to tab[0] - 1st one:
							await driver.close();
							await driver.switchTo().window(handles[0]);
						} else if (handles.length === 1) {
							//navigate back in the browser / actual tab
							await driver.navigate().back();
						} else {
							throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
							handles.length + ' tabs displayed in the browser';
						}
					});
				}
			});
		});
	};
	
	UofC.editTextHeroCTABlock = (ctaHeroValues) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		// headingValue, descriptionValue, textPosition, textAlignment, bgColour, overlaidTextColour, backgroundImagePath
		const headingValue = ctaHeroValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
		const descriptionValue = ctaHeroValues.descriptionValue + ' ' + Math.floor((Math.random() * 100) + 1);
		
		describe('edit the text hero cta block', () => {
			//NOTE: figure out what are the required fields here and add 'ifs' for those which are not
			it('click the edit this block button', async () => {
				//hero cta:         .hero-cta .block-editing>a
				//text hero cta:    .text-hero-cta .block-editing>a
				//both above:       div[class*="hero-cta"] .block-editing>a     OR  .block-editing>a
				const editBlockElements = await UofC.findElementsByCSS('.hero a[title*="Edit Text Hero Call to Action block"]');  //was .text-hero-cta .block-editing>a
				if (editBlockElements.length > 0) {
					//bring the button into the view
					await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', editBlockElements[0]);
					// await UofC.clickElementByCSS('.hero-cta .block-editing>a');
					editBlockElements[0].click();
					await UofC.waitForPageLoad();
					await UofC.waitForObjectLoad('.ui-dialog', waitLong * 3, 1000, true);
				} else {
					throw '"edit this block" button for the text hero cta block could not be found';
				}
				
				it('check dialog\'s width', async () => {
					//get dialog's width and print it out - there are differences between different block's dialogs:
					const dialogElement = await driver.findElement(By.css('.ui-dialog'));
					const dialogWidth = await dialogElement.getCssValue('width');
					console.log('dialogWidth: ' + dialogWidth);
				});
			});
			
			it('type the heading as ' + headingValue, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=ucws-text-hero-cta-heading]', headingValue);
			});
			
			it('switching to the description iframe', async () => {
				await driver.switchTo().frame(driver.findElement(By.css('div[id*=ucws-text-hero-cta-desc] iframe')));
			});
			
			it('type the description as ' + descriptionValue, async () => {
				await UofC.setTextFieldValueByCSS('.cke_editable', descriptionValue);
			});
			
			//here might need to switch off the iframe above
			it('switching out of the description iframe', async () => {
				const handles = await driver.getAllWindowHandles();
				await driver.switchTo().window(handles[0]);
			});
			
			if (ctaHeroValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (ctaHeroValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (ctaHeroValues.ctaButtons.Url1) {
					it('type the url of button 1 as ' + ctaHeroValues.ctaButtons.Url1, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-0-uri]', ctaHeroValues.ctaButtons.Url1);
					});
					
					it('type the label of button 1 as ' + ctaHeroValues.ctaButtons.btnLabel1, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-0-title]', ctaHeroValues.ctaButtons.btnLabel1);
					});
				}
				
				if (ctaHeroValues.ctaButtons.Url2) {
					it('type the url of button 2 as ' + ctaHeroValues.ctaButtons.Url2, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-1-uri]', ctaHeroValues.ctaButtons.Url2);
					});
					
					it('type the label of button 2 as ' + ctaHeroValues.ctaButtons.btnLabel2, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-1-title]', ctaHeroValues.ctaButtons.btnLabel2);
					});
				}
				
				// if (!ctaHeroValues.ctaButtons.Url1 || !ctaHeroValues.ctaButtons.Url2) {
				// 	throw 'it seems there were no ctaHeroValues.ctaButtons.* parameters declared while we need at least' +
				// 	' one CTA URL' + ' & BtnLabel added\n either ctaHeroValues.ctaButtons should be removed from the data file';
				// }
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			it('click save button', async () => {
				const saveBtnElements = await driver.findElements(By.css('[id*=edit-submit]'));
				if (saveBtnElements.length > 0) {
					//scroll to the bottom of the page so the button is visible
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', saveBtnElements[0]);
					await driver.sleep(500);
					await saveBtnElements[0].click();
					await UofC.waitForPageLoad();
				} else {
					throw 'save button not found';
				}
			});
		});
		
		describe('validate banner block\'s edits were applied', () => {
			// validate that the confirmation message message is displayed (status)
			// UofC.validateDisplayedText('.messages.status:not(h2):not(button)', confirmationMessage);
			
			let validationMessage = 'Text Hero CTA has been updated.';
			it('validate the confirmation status message contains the "' + validationMessage + '" text', async () => {
				const element = await driver.findElement(By.css('.messages.status:not(h2):not(button)'));
				let text = await element.getText();
				text = text.replace(text.substring(0, text.lastIndexOf('\n') + 1), '').replace(/[0-9]/g, '').replace(/ /g, '');
				expect(text.toLowerCase()).to.equal(validationMessage.replace(/ /g, '').toLowerCase());
			});
			
			it('close the status message popup', async () => {
				await UofC.clickElementByCSS('.messages.status>button');
			});
			
			//validate inserted values are displayed on the screen
			//1. check Block Heading   -   headingValue
			UofC.validateDisplayedText('div[class*=hero-cta] h1', headingValue);
			
			//2. check Block Description   -   descriptionValue
			UofC.validateDisplayedText('div[class*=hero-cta] p', descriptionValue);
			
			//3. check CTA btn's label, click on it and validate the correct URL loads in a new tab
			// close the tab and do same for 2nd CTA btn if it got added above
			if (ctaHeroValues.ctaButtons.btnLabel1) {
				UofC.validateDisplayedText('div[class*=hero-cta] .btn-wrapper>a:nth-child(1)', ctaHeroValues.ctaButtons.btnLabel1);
				
				it('click the ' + ctaHeroValues.ctaButtons.btnLabel1 + ' button', async () => {
					await UofC.clickElementByCSS('div[class*=hero-cta] .btn-wrapper>a:nth-child(1)');
				});
				
				//TODO: maybe embed this into a secondary function -> checkNewUrlIsLoaded
				it('if another tab loaded switch to it either just verify that the loaded url includes "' +
				  ctaHeroValues.ctaButtons.Url1 + '"', async () => {
					//get all tabs and switch to the newly created one
					const handles = await driver.getAllWindowHandles();
					let actualUrl;
					//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
					// navigate back in the browser
					if (handles.length > 1 && handles.length < 3) {
						//switch to the other tab
						await driver.switchTo().window(handles[1]); //there are 2 tabs -> [0] & [1]
						await UofC.waitForPageLoad();
						actualUrl = await driver.getCurrentUrl();
						expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url1.toLowerCase());
					} else if (handles.length === 1) {
						actualUrl = await driver.getCurrentUrl();
						expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url1.toLowerCase());
					} else {
						throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
						handles.length + ' tabs displayed in the browser';
					}
					// console.log('\ndirUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url1 + '\n');
				});
				
				it('close the opened tab if multiple exist either navigate back in the browser', async () => {
					const handles = await driver.getAllWindowHandles();
					//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
					// navigate back in the browser - we should be on the 2nd tab already - from the step above
					if (handles.length > 1 && handles.length < 3) {
						//close the recently opened tab and switch back to tab[0] - 1st one:
						await driver.close();
						await driver.switchTo().window(handles[0]);
					} else if (handles.length === 1) {
						//navigate back in the browser / actual tab
						await driver.navigate().back();
					} else {
						throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
						handles.length + ' tabs displayed in the browser';
					}
				});
			}
			
			if (ctaHeroValues.ctaButtons.btnLabel2) {
				UofC.validateDisplayedText('div[class*=hero-cta] .btn-wrapper>a:nth-child(2)', ctaHeroValues.ctaButtons.btnLabel2);
				
				it('click the ' + ctaHeroValues.ctaButtons.btnLabel2 + ' button', async () => {
					await UofC.clickElementByCSS('div[class*=hero-cta] .btn-wrapper>a:nth-child(2)');
				});
				
				//TODO: maybe embed this into a secondary function -> checkNewUrlIsLoaded
				it('if another tab loaded switch to it either just verify that the loaded url includes "' +
				  ctaHeroValues.ctaButtons.Url1 + '"', async () => {
					//get all tabs and switch to the newly created one
					const handles = await driver.getAllWindowHandles();
					let actualUrl;
					//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
					// navigate back in the browser
					if (handles.length > 1 && handles.length < 3) {
						//switch to the other tab
						await driver.switchTo().window(handles[1]); //there are 2 tabs -> [0] & [1]
						await UofC.waitForPageLoad();
						actualUrl = await driver.getCurrentUrl();
						expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url2.toLowerCase());
					} else if (handles.length === 1) {
						actualUrl = await driver.getCurrentUrl();
						expect(actualUrl.toLowerCase()).to.include(ctaHeroValues.ctaButtons.Url2.toLowerCase());
					} else {
						throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
						handles.length + ' tabs displayed in the browser';
					}
					// console.log('\ndirUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url1 + '\n');
				});
				
				it('close the opened tab if multiple exist either navigate back in the browser', async () => {
					const handles = await driver.getAllWindowHandles();
					//if nr of tabs > 1 then switch to 2nd tab, validate & close it, else validate here &
					// navigate back in the browser - we should be on the 2nd tab already - from the step above
					if (handles.length > 1 && handles.length < 3) {
						//close the recently opened tab and switch back to tab[0] - 1st one:
						await driver.close();
						await driver.switchTo().window(handles[0]);
					} else if (handles.length === 1) {
						//navigate back in the browser / actual tab
						await driver.navigate().back();
					} else {
						throw 'we cannot have no tabs neither more than 2 tabs but we have: ' +
						handles.length + ' tabs displayed in the browser';
					}
				});
			}
		});
	};
	
	UofC.editBannerBlock = (bannerBlockValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		// headingValue, descriptionValue, textPosition, textAlignment, bgColour, overlaidTextColour, backgroundImagePath
		const headingValue = bannerBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
		let descriptionValue;
		if (bannerBlockValues.descriptionValue) {
			descriptionValue = bannerBlockValues.descriptionValue + ' ' + Math.floor((Math.random() * 100) + 1);
		}
		
		describe('edit the banner block nr ' + bannerBlockValues.nrBannerBlockToEdit, () => {
			it('click the edit this block button', async () => {
				const editBlockBtnNr = bannerBlockValues.nrBannerBlockToEdit - 1;
				const editBlockElements = await UofC.findElementsByCSS('div.block a[title="Edit Banner block"]');
				if (editBlockElements.length > 0 && !(editBlockElements.length < bannerBlockValues.nrBannerBlockToEdit)) {
					//bring the button into the view
					await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', editBlockElements[editBlockBtnNr]);
					editBlockElements[editBlockBtnNr].click();
					await UofC.waitForPageLoad();
					await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
				} else {
					throw '\'edit this block\' button could not be found, the locator is: div.block a[title="Edit Banner block"] ' +
					'and the element # is: ' + editBlockBtnNr;
				}
			});
			
			it('type the heading as ' + headingValue, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*=ucws-banner-heading]', headingValue);
			});
			
			if (bannerBlockValues.descriptionValue) {
				it('switching to the description iframe', async () => {
					await driver.switchTo().frame(driver.findElement(By.css('div[id*=ucws-banner-desc] iframe')));
				});
				
				it('type the description as ' + descriptionValue, async () => {
					await UofC.setTextFieldValueByCSS('.cke_editable', descriptionValue);
				});
				
				//here might need to switch off the iframe above
				it('switching out of the description iframe', async () => {
					const handles = await driver.getAllWindowHandles();
					await driver.switchTo().window(handles[0]);
				});
			}
			
			it('select the display style as ' + bannerBlockValues.displayStyle, async () => {
				await UofC.setSelectDropDownValueByCSS('select[id*=banner-display-style]', bannerBlockValues.displayStyle);
			});
			
			if (bannerBlockValues.textAlignment) {
				it('select the text alignment as ' + bannerBlockValues.textAlignment, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=ucws-banner-talignment]', bannerBlockValues.textAlignment);
				});
			}
			
			if (bannerBlockValues.displayStyle === 'Background Image') {
				if (bannerBlockValues.textPosition) {
					it('select the text position as ' + bannerBlockValues.textPosition, async () => {
						await UofC.setSelectDropDownValueByCSS('select[id*=ucws-banner-tposition]', bannerBlockValues.textPosition);
					});
				}
				
				if (bannerBlockValues.bgImageStyle) {
					it('select the background image style as ' + bannerBlockValues.bgImageStyle, async () => {
						await UofC.setSelectDropDownValueByCSS('select[id*=ucws-banner-bgimg-style]', bannerBlockValues.bgImageStyle);
					});
				}
				
				if (attachmentPath) {
					//remove the '.jpg' from the image name
					const imagePreviewAndLinkLocator = bannerBlockValues.backgroundImage.substring(0, bannerBlockValues.backgroundImage.lastIndexOf('.'));
					it('upload the ' + bannerBlockValues.backgroundImage + ' background image', async () => {
						//TODO: comment the lines below when the issue with finding the image in GitLab is solved
						const internalImagePathTest = require('path').join(attachmentPath, bannerBlockValues.backgroundImage);
						console.log('\nimage path here: ------------------------------------------------------------------');
						console.log('internalImagePathTest: ' + internalImagePathTest);
						console.log('attachmentPath       : ' + attachmentPath);
						console.log('image path here: ------------------------------------------------------------------\n');
						
						await UofC.setFileUploadByCSS('input[id*=upload][type=file]', attachmentPath);
					});
					
					it('validate that image\'s preview and the ' + bannerBlockValues.backgroundImage + ' link are displayed', async () => {
						//validate the image preview is displayed
						await UofC.waitForObjectLoad('img[data-drupal-selector*=preview]', waitLong * 3, 500, true);
						
						//validate image link is displayed
						await UofC.waitForObjectLoad('a[href*="' + imagePreviewAndLinkLocator + '"]', waitLong, 500, true);
					});
					
					//validate that the image link contains the correct title
					UofC.validateDisplayedText('a[href*="' + imagePreviewAndLinkLocator + '"]', bannerBlockValues.backgroundImage);
					
					if (bannerBlockValues.imageAltText) {
						const imageAltText = bannerBlockValues.imageAltText + ' ' + Math.floor((Math.random() * 100) + 1);
						it('type the alternative text as ' + imageAltText, async () => {
							await UofC.setTextFieldValueByCSS('input[id*=alt]', imageAltText);
						});
					}
				}
				
				if (bannerBlockValues.overlaidTextColour) {
					it('select the overlaid text colour as ' + bannerBlockValues.overlaidTextColour, async () => {
						await UofC.setSelectDropDownValueByCSS('select[id*=hero-cta-tcolour]', bannerBlockValues.overlaidTextColour);
					});
				}
				
				if (bannerBlockValues.doNotApplyGradient) {
					it('set the "do not apply gradient" checkbox to ' + bannerBlockValues.doNotApplyGradient, async () => {
						await UofC.setButtonCheckboxByCSS('input[id*=gradient-value]', bannerBlockValues.doNotApplyGradient);
					});
				}
			} else if (bannerBlockValues.displayStyle === 'Background Colour') {
				//the value of bgColor should be numeric (from 1 to 7) to match available colors & css locators
				if (bannerBlockValues.bgColourItemNr) {
					//validate that the parameter matches the available values
					if (bannerBlockValues.bgColourItemNr > 7 || bannerBlockValues.bgColourItemNr < 1) {
						throw 'bannerBlockValues.bgColourItemNr is ' + bannerBlockValues.bgColourItemNr + ' but it should' +
						' be between 1 and 7, please correct the data';
					}
					
					let color1, color2, color3, color4, color5, color6, color7;
					color1 = '#CF0722';
					color2 = '#FF671F';
					color3 = '#FFA300';
					color4 = '#CE0058';
					color5 = '#A6192E';
					color6 = '#6B3529';
					color7 = '#8D827A';
					
					const bgColor = bannerBlockValues.bgColourItemNr;
					let selectedColor = (bgColor === 1) ? color1 : (bgColor === 2) ? color2 : (bgColor === 3) ? color3 :
					  (bgColor === 4) ? color4 : (bgColor === 5) ? color5 : (bgColor === 6) ? color6 : (bgColor === 7) ?
						color7 : 'this color is not available: ' + bgColor;
					// console.log('selectedColor: ' + selectedColor);
					
					it('set the background color to ' + selectedColor, async () => {
						//css e.g. which works: button[class*=color][color*="#FF671F"] OR button[color*="#FF671F"]
						await UofC.clickElementByCSS('button[class*=color][color*="' + selectedColor + '"]');
					});
				}
				
				if (bannerBlockValues.roundedCorners) {
					it('select the rounded corners as ' + bannerBlockValues.roundedCorners, async () => {
						await UofC.setSelectDropDownValueByCSS('select[id*=ucws-banner-round-corners]', bannerBlockValues.roundedCorners);
					});
				}
			}
			
			if (bannerBlockValues.ctaButtons) {
				//this piece below is not implemented - clicking show rows weights -> Keanu said it is not needed
				/*
				if (ctaHeroValues.hideShowRowsWeights) {
					it('click the hide / show row weights link ' + hideShowRowsWeights, async () => {
					
					});
				}
				*/
				
				if (bannerBlockValues.ctaButtons.Url1) {
					it('type the url of button 1 as ' + bannerBlockValues.ctaButtons.Url1, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-0-uri]', bannerBlockValues.ctaButtons.Url1);
					});
					
					it('type the label of button 1 as ' + bannerBlockValues.ctaButtons.btnLabel1, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-0-title]', bannerBlockValues.ctaButtons.btnLabel1);
					});
				}
				
				if (bannerBlockValues.ctaButtons.Url2) {
					it('type the url of button 2 as ' + bannerBlockValues.ctaButtons.Url2, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-1-uri]', bannerBlockValues.ctaButtons.Url2);
					});
					
					it('type the label of button 2 as ' + bannerBlockValues.ctaButtons.btnLabel2, async () => {
						await UofC.setTextFieldValueByCSS('input[id*=cta-1-title]', bannerBlockValues.ctaButtons.btnLabel2);
					});
				}
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			it('click save button', async () => {
				const saveBtnElements = await driver.findElements(By.css('[id*=edit-submit]'));
				if (saveBtnElements.length > 0) {
					//scroll to the bottom of the page so the button is visible
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', saveBtnElements[0]);
					await driver.sleep(500);
					await saveBtnElements[0].click();
					await UofC.waitForPageLoad();
				} else {
					throw 'save button not found';
				}
			});
		});
		
		describe('validate banner block\'s edits were applied', () => {
			// validate that the confirmation message message is displayed (status)
			// UofC.validateDisplayedText('.messages.status:not(h2):not(button)', confirmationMessage);
			
			let validationMessage = 'Banner has been updated.';
			it('validate the confirmation status message contains the "' + validationMessage + '" text', async () => {
				const element = await driver.findElement(By.css('.messages.status:not(h2):not(button)'));
				let text = await element.getText();
				text = text.replace(text.substring(0, text.lastIndexOf('\n') + 1), '').replace(/[0-9]/g, '').replace(/ /g, '');
				expect(text.toLowerCase()).to.equal(validationMessage.replace(/ /g, '').toLowerCase());
			});
			
			it('close the status message popup', async () => {
				await UofC.clickElementByCSS('.messages.status>button');
			});
			/*
			//this is disabled because the test case does not require it - to enable and test later when needed
				//validate inserted values are displayed on the screen
				//1. check Block Heading   -   headingValue
				UofC.validateDisplayedText('div:nth-child(' + bannerBlockValues.nrBannerBlockToEdit + ') .layout-blocks-ucws-banner h2', headingValue);
				
				//2. check Block Description   -   descriptionValue
				if (bannerBlockValues.descriptionValue) {
					UofC.validateDisplayedText('div:nth-child(' + nrBannerBlockToEdit + ') .layout-blocks-ucws-banner p', descriptionValue);
				}
				
				if (bannerBlockValues.displayStyle === 'Background Image' && attachmentPath) {
					//3. check image's size 1500x600px
					it('find block\'s background image and validate it\'s size is at least 1500px*600px', async () => {
						//.hero .bg-image [style*=background-image]
						const blockDivBgImage = await driver.findElement(By.css('.hero .bg-image [style*=background-image]'));
						const imgWidth = await blockDivBgImage.getCssValue('width');
						const imgHeight = await blockDivBgImage.getCssValue('height');
						
						console.log('\nPASS: imgWidth: ' + imgWidth + '\nimgHeight: ' + imgHeight);
						if (parseInt(imgWidth.replace('px', '')) > 1300 || parseInt(imgHeight.replace('px', '')) > 600) {
							throw '".hero .bg-image [style*=background-image]" object\'s width or hight are higher than 1500x600px' +
							'\nactual object\'s width is: ' + imgWidth + ' and the height is: ' + imgHeight;
						}
					});
				} else if (bannerBlockValues.displayStyle === 'Background Colour') {
				
				}
				
				//4. check CTA btn's label, click on it and validate the correct URL loads in a new tab
				// close the tab and do same for 2nd CTA btn if it got added above
				if (bannerBlockValues.ctaButtons && bannerBlockValues.ctaButtons.btnLabel1) {
					UofC.validateDisplayedText('div[class*=hero-cta] .btn-wrapper>a:nth-child(1)', bannerBlockValues.ctaButtons.btnLabel1);
					
					it('click the ' + bannerBlockValues.ctaButtons.btnLabel1 + ' button', async () => {
						await UofC.clickElementByCSS('div[class*=hero-cta] .btn-wrapper>a:nth-child(1)');//.cta-content div>a:nth-child(1)
					});
					
					it('switch to the new tab and verify that the loaded page\'s url includes "' +
					  bannerBlockValues.ctaButtons.Url1 + '"', async () => {
						//get all tabs and switch to the newly created one
						const handles = await driver.getAllWindowHandles();
						await driver.switchTo().window(handles[1]);
						await UofC.waitForPageLoad();
						
						const actualUrl = await driver.getCurrentUrl();
						// console.log('\ndirUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url1 + '\n');
						expect(actualUrl.toLowerCase()).to.include(bannerBlockValues.ctaButtons.Url1.toLowerCase());
					});
					
					it('close the opened tab and switch back to the 1st one', async () => {
						const handles = await driver.getAllWindowHandles();
						//close the active tab and switch to tab[0] - 1st one:
						await driver.close();
						await driver.switchTo().window(handles[0]);
					});
				}
				
				if (bannerBlockValues.ctaButtons && bannerBlockValues.ctaButtons.btnLabel2) {
					UofC.validateDisplayedText('div[class*=hero-cta] .btn-wrapper>a:nth-child(2)', bannerBlockValues.ctaButtons.btnLabel2);
					
					it('click the ' + bannerBlockValues.ctaButtons.btnLabel2 + ' button', async () => {
						await UofC.clickElementByCSS('div[class*=hero-cta] .btn-wrapper>a:nth-child(2)');//.cta-content div>a:nth-child(2)
					});
					
					it('switch to the new tab and verify that the loaded page\'s url includes "' +
					  bannerBlockValues.ctaButtons.Url2 + '"', async () => {
						//get all tabs and switch to the newly created one
						const handles = await driver.getAllWindowHandles();
						await driver.switchTo().window(handles[1]);
						await UofC.waitForPageLoad();
						
						const actualUrl = await driver.getCurrentUrl();
						// console.log('\nUrl is: ' + actualUrl + '\nincluded in url: ' + ctaHeroValues.ctaButtons.Url2);
						expect(actualUrl.toLowerCase()).to.include(bannerBlockValues.ctaButtons.Url2.toLowerCase());
					});
					
					it('close the opened tab and switch back to the 1st one', async () => {
						const handles = await driver.getAllWindowHandles();
						//close the active tab and switch to tab[0] - 1st one:
						await driver.close();
						await driver.switchTo().window(handles[0]);
						console.log('wait - tab closed');
					});
				}
			*/
		});
	};
	
	UofC.editMoreInfoBlock = (moreInfoBlockValues, attachmentPath) => {
		before(async () => {
		
		});
		
		after(async () => {
		
		});
		
		// headingValue, descriptionValue, textPosition, textAlignment, bgColour, overlaidTextColour, backgroundImagePath
		const headingValue = moreInfoBlockValues.headingValue + ' ' + Math.floor((Math.random() * 100) + 1);
		let descriptionValue;
		if (moreInfoBlockValues.descriptionValue) {
			descriptionValue = moreInfoBlockValues.descriptionValue + ' ' + Math.floor((Math.random() * 100) + 1);
		}
		
		describe('edit the more info block nr ' + moreInfoBlockValues.nrMoreInfoBlockToEdit, () => {
			//NOTE: figure out what are the required fields here and add 'ifs' for those which are not
			it('click the edit this block button', async () => {
				const editBlockBtnNr = moreInfoBlockValues.nrMoreInfoBlockToEdit - 1;
				const editBlockElements = await UofC.findElementsByCSS('div.block a[title="Edit More Information block"]');
				if (editBlockElements.length > 0 && !(editBlockElements.length < moreInfoBlockValues.nrMoreInfoBlockToEdit)) {
					//bring the button into the view
					await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});',
					  editBlockElements[editBlockBtnNr]);
					editBlockElements[editBlockBtnNr].click();
					await UofC.waitForPageLoad();
					await UofC.waitForObjectLoad('.ui-dialog', waitLong * 5, 1000, true);
				} else {
					throw '\'edit this block\' button could not be found, the locator is: ' +
					'div.block a[title="Edit More Information block"] and the element # is: ' + editBlockBtnNr;
				}
			});
			
			it('type the heading as ' + headingValue, async () => {
				await UofC.setTextFieldValueByCSS('.ui-dialog input[id*="ucws-more-info-heading"]', headingValue);
			});
			
			if (moreInfoBlockValues.descriptionValue) {
				it('switching to the description\'s iframe', async () => {
					await driver.switchTo().frame(driver.findElement(By.css('div[id*=ucws-more-info-desc] iframe')));
				});
				
				it('type the description as ' + descriptionValue, async () => {
					await UofC.setTextFieldValueByCSS('.cke_editable', descriptionValue);
				});
				
				//here might need to switch off the iframe above
				it('switching out of the description iframe', async () => {
					const handles = await driver.getAllWindowHandles();
					await driver.switchTo().window(handles[0]);
				});
			}
			
			if (moreInfoBlockValues.bgColourItemNr) {
				//validate that the parameter matches the available values
				if (moreInfoBlockValues.bgColourItemNr > 8 || moreInfoBlockValues.bgColourItemNr < 1) {
					throw 'moreInfoBlockValues.bgColourItemNr is ' + moreInfoBlockValues.bgColourItemNr + ' but it should' +
					' be between 1 and 8, please correct the data';
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
				
				const bgColor = moreInfoBlockValues.bgColourItemNr;
				let selectedColor = (bgColor === 1) ? color1 : (bgColor === 2) ? color2 : (bgColor === 3) ? color3 :
				  (bgColor === 4) ? color4 : (bgColor === 5) ? color5 : (bgColor === 6) ? color6 : (bgColor === 7) ?
					color7 : (bgColor === 8) ? color8 : 'this color is not available: ' + bgColor;
				// console.log('bg selectedColor: ' + selectedColor);
				
				it('set the background color to ' + selectedColor, async () => {
					//css e.g. which works: button[class*=color][color*="#FF671F"] OR button[color*="#FF671F"]
					await UofC.clickElementByCSS('div[class*=bgcolor]>button[class*=color][color*="' + selectedColor + '"]');
				});
			}
			
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
				
				it('set the background color to ' + selectedColor, async () => {
					await UofC.clickElementByCSS('div[class*="accent_color"]>button[class*=color][color*="' + selectedColor + '"]');
					// *[class*="accent_color"]>button[class*=color][color*="#CF0722"]
				});
			}
			
			if (moreInfoBlockValues.addMoreInfoBlocks) {
				//loop through the list of Add More Info block sections and add as many as needed
				for (let i = 0; i < moreInfoBlockValues.addMoreInfoBlocks.length; i++) {
					it('click add more information block\'s button time ' + (i + 1), async () => {
						await UofC.clickElementByCSS('.field-add-more-submit');
						await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .icons-selector', waitShort, 500, true);
					});
					
					//select an icon
					if (moreInfoBlockValues.addMoreInfoBlocks[i].icon) {
						it('click the down arrow icon to expand the icon list of information block ' + i, async () => {
							await UofC.clickElementByCSS('tr:nth-child(' + (i + 1) + ') .fip-grey i.fip-icon-down-dir');
							await UofC.waitForObjectLoad('tr:nth-child(' + (i + 1) + ') .fip-icons-container', waitShort, 500, true);
						});
						
						it('select the ' + moreInfoBlockValues.addMoreInfoBlocks[i].icon + ' icon', async () => {
							//tr:nth-child(1) .fip-icons-container .ucws-more-info-picture  OR  tr:nth-child(1) .ucws-more-info-picture
							// await UofC.clickElementByCSS('tr:nth-child(' + (i + 1) + ') .' + moreInfoBlockValues.addMoreInfoBlocks[i].icon);
							//next locator(s) can be used as well - no child is needed there, will choose only the image which
							// is displayed there is only one list of icons displayed in the app at a time (the child is
							// done above for opening the correct icons popup)
							//.selector-popup:not([style*="display: none"]) .ucws-more-info-picture
							//.selector-popup:not([style*="display: none"]) ' + moreInfoBlockValues.addMoreInfoBlocks[i].icon
							await UofC.clickElementByCSS('.selector-popup:not([style*="display: none"]) .'
							  + moreInfoBlockValues.addMoreInfoBlocks[i].icon);
						});
					}
					
					//add section heading
					if (moreInfoBlockValues.addMoreInfoBlocks[i].heading) {
						it('type the section ' + (i + 1) + '\'s heading as ' + moreInfoBlockValues.addMoreInfoBlocks[i].heading, async () => {
							await UofC.setTextFieldValueByCSS('.ui-dialog .draggable:nth-child(' + (i + 1) +
							  ') input[id*="ucws-more-info-block-shead"]', moreInfoBlockValues.addMoreInfoBlocks[i].heading);
						});
					}
					
					//add section description
					if (moreInfoBlockValues.addMoreInfoBlocks[i].description) {
						it('switching to the section description\'s iframe', async () => {
							await driver.switchTo().frame(driver.findElement(By.css('.ui-dialog .draggable:nth-child(' +
							  (i + 1) + ') iframe')));
						});
						
						it('type the description as ' + descriptionValue, async () => {
							await UofC.setTextFieldValueByCSS('.cke_editable', descriptionValue);
						});
						
						//here might need to switch off the iframe above
						it('switching out of the description iframe', async () => {
							const handles = await driver.getAllWindowHandles();
							await driver.switchTo().window(handles[0]);
						});
					}
					
					//add URL & Text Link Label
					if (moreInfoBlockValues.addMoreInfoBlocks[i].url) {
						//moreInfoBlockValues.addMoreInfoBlocks[i].url
						
						//moreInfoBlockValues.addMoreInfoBlocks[i].textLinkLabel
					}
					
					
				}
			}
			
			if (moreInfoBlockValues.roundedCorners) {
				it('select the rounded corners as ' + moreInfoBlockValues.roundedCorners, async () => {
					await UofC.setSelectDropDownValueByCSS('select[id*=ucws-banner-round-corners]', moreInfoBlockValues.roundedCorners);
				});
			}
			
			//here, another piece is not implemented - Revision functionality -> Keanu said it is not needed
			// - nobody uses it, maybe on pages only, sometimes...
			
			it('click save button', async () => {
				const saveBtnElements = await driver.findElements(By.css('[id*=edit-submit]'));
				if (saveBtnElements.length > 0) {
					//scroll to the bottom of the page so the button is visible
					await driver.executeScript('arguments[0].scrollIntoView({block: "start", inline: "nearest"});', saveBtnElements[0]);
					await driver.sleep(500);
					await saveBtnElements[0].click();
					await UofC.waitForPageLoad();
				} else {
					throw 'save button not found';
				}
			});
		});
		
		describe('validate banner block\'s edits were applied', () => {
			// validate that the confirmation message message is displayed (status)
			let validationMessage = 'Banner has been updated.';
			it('validate the confirmation status message contains the "' + validationMessage + '" text', async () => {
				const element = await driver.findElement(By.css('.messages.status:not(h2):not(button)'));
				let text = await element.getText();
				text = text.replace(text.substring(0, text.lastIndexOf('\n') + 1), '').replace(/[0-9]/g, '').replace(/ /g, '');
				expect(text.toLowerCase()).to.equal(validationMessage.replace(/ /g, '').toLowerCase());
			});
			
			it('close the status message popup', async () => {
				await UofC.clickElementByCSS('.messages.status>button');
			});
		});
	};
	
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
			
			// const confirmationMessage = 'Streaming Media ' + '729' + ' has been updated';
			// // validate that the confirmation message message is displayed (status)
			// UofC.validateDisplayedText('.messages.status:not(h2):not(button)', confirmationMessage);
			
			it('close the status message popup', async () => {
				await UofC.clickElementByCSS('.messages.status>button');
				await driver.sleep(500);
			});
			
			//validate inserted values are displayed on the screen
			UofC.validateDisplayedText('.header h2', blockHeadingValue);
			UofC.validateDisplayedText('.header p', blockDescriptionValue);
			UofC.validateDisplayedText('p.caption', captionForMediaValue);
			UofC.validateDisplayedText('p.credit', creatorCreditValue);
			
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
	};
	
	
	
	
	
	
	
	
	
	
	UofC.clickLayoutActionButtons = (btnName, expectedMessageStatusText) => {
		let fullBtnName = (btnName.toLowerCase() === 'save') ? 'save page layout' :
		  (btnName.toLowerCase() === 'cancel') ? 'cancel layout' : (btnName.toLowerCase() === 'revert') ?
			'revert to defaults' : 'this option is not available: ' + btnName;
		/* -----------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    this function clicks the one of the layout action buttons (Save / Cancel / Revert)
						then will check a message text to be expected and validate against it
						will also close the message popup after the text is validated
	
		ACCEPTED PARAMETER(S) AND VALUES:
		btnName     only next 3 values are accepted - save, cancel, revert (nothing else will work)
	
		USAGE:      UofC.clickLayoutActionButtons('save');
					UofC.clickLayoutActionButtons('cancel');
					UofC.clickLayoutActionButtons('save');
		----------------------------------------------------------------------------------------------------------------- */
		it('click ' + fullBtnName + ' button', async () => {
			//find the button
			let btnElement = await driver.findElement(By.css('a[href*=' + btnName.toLowerCase() + ']')); //.secondary.pagination>:nth-child(1)>a
			
			//scroll to the top of the page so the button is visible
			await driver.executeScript('arguments[0].scrollIntoView({block: "end", inline: "nearest"});', btnElement);
			await btnElement.click();
			await UofC.waitForPageLoad();
		});
		
		UofC.validateDisplayedText('.messages.status', expectedMessageStatusText);
		
		it('close the status message popup', async () => {
			await UofC.clickElementByCSS('.messages.status>button');
		});
	};
	
	
	return UofC;
})();

module.exports = UofC;
