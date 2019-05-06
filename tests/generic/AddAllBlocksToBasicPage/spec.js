/**
 * Created by yipk on 15/04/2019.
 * NOTE: THIS TEST IS WORK IN PROGRESS
 * MANUAL TEST: UCWS-815 | https://ucalgary.atlassian.net/browse/UCWS-815
 */

const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const HarnessJson = require('../../../lib/harness-json');
const UofC = require('../../../lib/UofCApps');
// const expect = require('chai').expect;

describe('appName: ' + harness.getCommandLineArgs().appName + ' (user: ' + harness.getCommandLineArgs().role +
	') | env: ' + harness.getCommandLineArgs().env + ' | BrowserStack: ' + harness.getCommandLineArgs().browserStack, function () {
	
	let harnessObj = null;
	let driver = null;
	// let By = null;
	
	before(async () => {
		harnessObj = await harness.init();
		await UofC.init(harnessObj, waitShort, waitLong);
		await UofC.startApp();
		await UofC.login();
		driver = harnessObj.driver;
		// By = harnessObj.By;
	});
	
	after(async () => {
		await harnessObj.quit(this);
	});
	
	afterEach(async () => {
		await UofC.afterEachTest(this.ctx.currentTest);
	});
	
	//reading json data files and preparing the required variables for later usage
	const dataJsonFilePath = require('path').join(__dirname, '/data/data.json');
	const newPageValues = new HarnessJson(dataJsonFilePath).getJsonData().createBasicPage;
	
	//1. Create a basic page
	UofC.createBasicPage(newPageValues);
	
	//2. Click Layout
	describe('click Layout tab', () => {
		UofC.clickOnTabByText('Layout', '#layout-builder');
	});
	
	//3. Click 1st Add Block btn and select 'Add Hero CTA' block
	UofC.addNewBlock('1'
	 , 'UCalgary'
	 , 'details[open=open].UCalgary-blocks li>a[href*=ucws_hero_cta]'
	 , 'details[open=open].UCalgary-blocks:nth-child(21)>ul'
	 , 'Add Hero CTA'
	 , 'details[id*=edit-settings-teams]'
	 , null
	 , null
	 , null
	 , 'a[title*="Edit Hero Call to Action block"]'
	);
	
	// 4. Click 2nd Add Section btn and choose 'One Column' option
	UofC.addNewLayout('1', '1');   //add a new section (not hero) with the 1 col layout
	
	describe('check the 2nd Add Block and 3rd Add Section buttons are displayed', () => {
		it('wait for the 2nd Add Block link to be displayed', async () => {
			await UofC.waitForObjectLoad('.layout-section:nth-child(4) .new-block>a', waitLong * 3, 1000, true);
		});
		
		UofC.validateDisplayedTextEquals('.layout-section:nth-child(4) .new-block>a', 'Add Block');
		
		it('wait for the 2nd Add Layout link to be displayed', async () => {
			await UofC.waitForObjectLoad('.new-section:nth-child(5)>a', waitLong * 3, 1000, true);
		});
		UofC.validateDisplayedTextEquals('.new-section:nth-child(5)>a', 'Add Layout');
	});
	
	//5. click 2nd Add Block btn and select 'Add Accordion' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_accordion]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Accordion'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Accordion block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//6. click 2nd Add Block btn and select 'Add Banner' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_banner]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Banner'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Banner block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//7. click 2nd Add Block btn and select 'Add Campus Map' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_campus_map]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Campus Map'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Campus Map block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//8. click 2nd Add Block btn and select 'Add Checklist' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_checklist]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Checklist'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Checklist block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//9. click 2nd Add Block btn and select 'Add Divider' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_divider]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Divider'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Divider block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//10. click 2nd Add Block btn and select 'Add Image' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_image]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Image'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Image block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//11. click 2nd Add Block btn and select 'Add Image Gallery' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_image_gallery]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Image Gallery'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Image Gallery block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//12. click 2nd Add Block btn and select 'Add Image with Text' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_image_text]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Image with Text'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Image with Text block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//13. click 2nd Add Block btn and select 'Add Info Shim' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_info_shim]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Info Shim'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Info Shim block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//14. click 2nd Add Block btn and select 'Add Marketo' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_marketo]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Marketo'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Marketo block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//15. click 2nd Add Block btn and select 'Add More Information' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_more_info]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add More Information'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit More Information block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//16. click 2nd Add Block btn and select 'Add Related Content' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_related_content]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Related Content'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Related Content block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//17. click 2nd Add Block btn and select 'Add Schedule' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_schedule]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Schedule'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Schedule block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//18. click 2nd Add Block btn and select 'Add Sidekick CTA' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_sidekick_cta]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Sidekick CTA'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Sidekick Call to Action block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//19. click 2nd Add Block btn and select 'Add Streaming Media' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_streaming_media]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Streaming Media'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Streaming Media block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//20. click 2nd Add Block btn and select 'Add Testimonial' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_testimonial]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Testimonial'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Testimonial block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//22. click 2nd Add Block btn and select 'Add Text' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_text]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Text'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Text block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//23. click 2nd Add Block btn and select 'Add Text Grid' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_text_grid]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Text Grid'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Text Grid block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//24. click 2nd Add Block btn and select 'Add Thumbnail' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_thumbnail]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Thumbnail'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Thumbnail block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	//25. click 2nd Add Block btn and select 'Add Trio CTA' block
	UofC.addNewBlock('2'                                                                //addBlockBtnNr
		, 'UCalgary'                                                                      //blockCategory
		, 'details.UCalgary-blocks a[href*=ucws_trio_cta]'                               //blockExpectedCssLocator
		, 'details.UCalgary-blocks:nth-child(21)>ul'                                      //categoryLinkGroupLocator
		, 'Add Trio CTA'                                                                 //categoryLinkNameToClick
		, 'details[id*=edit-settings-teams]'                                              //categoryExpectedCssLocator
		, null                                                                            //reusableCheckbox
		, null                                                                            //reusableBlockName
		, null                                                                            //teamsCheckBoxesToSelect
		, 'a[title*="Edit Trio Call to Action block"]'                                              //expectedCssLocatorAfterBlockAdded
	);
	
	describe('save page layout', () => {
		UofC.clickLayoutActionButtons('save', 'Close Status Message\nStatus message\nThe layout override has been saved.');
	});
});
