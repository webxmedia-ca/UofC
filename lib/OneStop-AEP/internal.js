/**
 * Created by cb5rp on 6/1/2017.
 */

/* jshint -W024 */
/* jshint -W014 */
/* jshint laxcomma:true */
/* jshint expr:true */

var UofC = (function () {
	
	var UofC = require('../UofCApp-base');
	var UofCGrid = require('../UofC/Grid');
	
	var webDriver
		, driver
		, By
		, until
		, waitShort
		, waitLong
		, initialized
		, harnessObj
		, describe
		, before
		, after
		, beforeEach
		, afterEach
		, it
		, expect
		, username
		, password
		, baseUrl
		, displayName
		, env
		, appType
		, appSubType;
	
	UofC.init = function (harnessObjIn, waitShortIn, waitLongIn) {
		UofC.initBase(harnessObjIn, waitShortIn, waitLongIn);
		
		var attrs = UofC.getAttrs();
		
		webDriver = attrs.webDriver;
		driver = attrs.driver;
		By = attrs.By;
		until = attrs.until;
		waitShort = attrs.waitShort;
		waitLong = attrs.waitLong;
		initialized = attrs.initialized;
		harnessObj = attrs.harnessObj;
		describe = attrs.describe;
		before = attrs.before;
		after = attrs.after;
		beforeEach = attrs.beforeEach;
		afterEach = attrs.afterEach;
		it = attrs.it;
		expect = attrs.expect;
		username = attrs.username;
		password = attrs.password;
		baseUrl = attrs.baseUrl;
		displayName = attrs.displayName;
		env = attrs.env;
		appType = attrs.appType;
		appSubType = attrs.appSubType;
	};
	
	UofC.openInternalApplicationBySearch = function(appId) {
		driver.get(UofC.getBaseUrl() + '/#workspace/search');
		
		// let page load
		UofC.waitForPageLoad(function () {
		});
		
		// enter the appid
		UofC.setTextFieldValueByCSS('*[name="applicationId"]', appId);
		
		//click the application search button
		UofC.clickElementByCSS('.btn-search');
		
		// let page load
		UofC.waitForPageLoad(function() {
		});
		
		// click the open button
		UofC.clickElementByCSS('button[data-event="show:application:submitted"]');
		
		// let page load
		UofC.waitForPageLoad(function() {
		});
	};
	
	UofC.actionAssignLeadReviewer = function() {
		describe('assign lead reviewer', function() {
			before(function (done) {
				driver.get(UofC.getBaseUrl() + '/#workspace/business-administrator');
				UofC.waitForPageLoad(function() {
					var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
					UofC.openInternalApplicationBySearch(appId);
					done();
				});
			});
			
			//click on Collaboration and Actions tab
			UofC.clickOnTabByText("Collaboration and Actions", "#AssessmentRulesPanelHeading");
			
			it('select action', function(done) {
				UofC.setSelectFieldValueByCSS('*[name="selectAction"]', 'Assign Lead Reviewer');
				done();
			});
			
			it('enter current user display name', function(done) {
				UofC.setTypeAheadValueByCSS('.action-section.LEAD_REV-action .tt-input', UofC.getDisplayName());
				UofC.clickElementByCSS('#ActionsPanelBody>div>div>div:nth-child(1) label:nth-child(1)');
				done();
			});
			
			it('click the save button', function(done) {
				UofC.clickElementByCSS('#action-save');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				done();
			});
			
			it('shows a success popup message', function(done) {
				UofC.popUpConfirmation('Successfully assigned lead reviewer', waitLong, done);
			});
		});
	};
	
	UofC.actionAssignDecisionMaker = function () {
		describe('assign decision maker', function() {
			before(function (done) {
				driver.get(UofC.getBaseUrl() + '/#workspace/business-administrator');
				UofC.waitForPageLoad(function () {
					var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
					UofC.openInternalApplicationBySearch(appId);
					done();
				});
			});
			
			//click on Collaboration and Actions tab
			UofC.clickOnTabByText('Collaboration and Actions', '#AssessmentRulesPanelHeading');
			
			it('select action', function(done) {
				UofC.setSelectFieldValueByCSS('*[name="selectAction"]', 'Assign Decision maker');
				done();
			});
			
			it('enter current user display name', function(done) {
				UofC.setTypeAheadValueByCSS('.action-section.DEC_MAKER-action .tt-input', UofC.getDisplayName());
				UofC.clickElementByCSS('#ActionsPanelBody>div>div>div:nth-child(5) label:nth-child(1)');
				driver.sleep(100);
				done();
			});
			
			it('click the save button', function(done) {
				UofC.clickElementByCSS('#action-save');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				done();
			});
			
			it('shows a success popup message', function(done) {
				UofC.popUpConfirmation('Successfully assigned decision maker', waitLong, done);
			});
		});
	};
	
	UofC.actionAssignReviewer = function (reviewReason,
	                                         reviewAssignerComments,
	                                         reviewDueDate) {
		describe('assign reviewer', function() {
			before(function (done) {
				driver.get(UofC.getBaseUrl() + '/#workspace/lead-reviewer');
				UofC.waitForPageLoad(function () {
					var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
					UofC.openInternalApplicationBySearch(appId);
					done();
				});
			});
			
			after(function (done) {
				done();
			});
			
			//click on Collaboration and Actions tab
			UofC.clickOnTabByText('Collaboration and Actions', '#AssessmentRulesPanelHeading');
			
			it('enter reviewer name', function(done) {
				UofC.setTextFieldValueByCSS('#userDisplayNameDFilter', UofC.getDisplayName());
				done();
			});
			
			it('reviewer is not already assigned', function(done) {
				UofC.getElementValueByCSS('.reviewer-grid .grid .multi-button-cell')
					.then(function (value) {
						expect(value).to.not.contain('Already Assigned');
						done();
					});
			});
			
			it('click the select button', function(done) {
				UofC.clickElementByCSS('button[data-event="reviewer:select"]');
				driver.sleep(waitShort);
				UofC.clickElementByCSS('button[data-event="reviewer:select"]');
				driver.sleep(waitShort);
				done();
			});
			
			it('select reason', function(done) {
				UofC.setSelectFieldValueByCSS('*[name="reason"]', reviewReason);
				done();
			});
			
			it('enter comments', function(done) {
				UofC.setTextFieldValueByCSS('*[name="comments"]', reviewAssignerComments);
				done();
			});
			
			it('enter due date', function(done) {
				UofC.setTextFieldValueByCSS('*[name="dueDate"]', reviewDueDate);
				UofC.clickElementByCSS('#referral-comments');
				done();
			});
			
			it('click the make referral button', function(done) {
				UofC.clickElementByCSS('#make-referral');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				done();
			});
			
			it('shows a success popup message', function(done) {
				UofC.popUpConfirmation('Successfully created referral', waitShort, done);
			});
		});
	};
	
	UofC.actionCompleteReview = function (recommendation,
	                                         comments) {
		describe('complete review', function() {
			before(function (done) {
				driver.get(UofC.getBaseUrl() + '/#workspace/reviewer');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				done();
			});
			
			after(function (done) {
				done();
			});
			
			it('accept assignment', function(done) {
				UofC.clickElementByCSS('button[data-event="reviewer:accept"]');
				UofC.waitForPageLoad(function () {
				});
				
				UofC.getElementValueByCSS('.the-grid .grid .multi-button-cell')
					.then(function (value) {
						expect(value).to.contain('In Progress');
						done();
					});
			});
			
			it('open application', function(done) {
				var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
				UofC.openInternalApplicationBySearch(appId);
				done();
			});
			
			//click on Collaboration and Actions tab
			UofC.clickOnTabByText('Collaboration and Actions', '#AssessmentRulesPanelHeading');
			
			it('select the recommend action', function(done) {
				UofC.clickElementByCSS('.referrals-grid .dropdown-toggle');
				UofC.clickElementByCSS('a[data-action="recommend"]');
				UofC.waitForPageLoad(done);
			});
			
			it('select issue certificate', function(done) {
				UofC.setSelectFieldValueByCSS('#recommendationSelect', recommendation);
				done();
			});
			
			it('enter comments', function(done) {
				UofC.setTextFieldValueByCSS('#additionalComments', comments);
				done();
			});
			
			it('click make recommendation', function(done) {
				UofC.clickElementByCSS('.modal-footer .btn-save');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				done();
			});
			
			it('shows a success popup message', function(done) {
				UofC.popUpConfirmation('Recommendation submitted', waitLong);
			});
		});
	};
	
	UofC.actionMakeFinalRecommendation = function (recommendation,
	                                                  comments) {
		describe('make final recommendation', function() {
			before(function (done) {
				driver.get(UofC.getBaseUrl() + '/#workspace/lead-reviewer');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
				UofC.openInternalApplicationBySearch(appId);
				done();
			});
			
			after(function (done) {
				done();
			});
			
			UofC.clickOnTabByText('Recommendations and Decisions', '#RecAndDecPanelHeading');
			
			it('select recommendation', function(done) {
				UofC.setSelectFieldValueByCSS('#fin-rec-select', recommendation);
				done();
			});
			
			it('enter comments', function(done) {
				UofC.setTextFieldValueByCSS('*[name="addComments"]', comments);
				done();
			});
			
			it('click the make final recommendation button', function(done) {
				UofC.clickElementByCSS('#finalRecSubmit');
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				done();
			});
		});
	};
	
	UofC.actionMakeFinalDecision = function (decision,
	                                            comments) {
		describe('make final decision', function() {
			before(function (done) {
				driver.get(UofC.getBaseUrl() + '/#workspace/decision-maker');
				UofC.waitForPageLoad(function () {
					var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
					UofC.openInternalApplicationBySearch(appId);
					done();
				});
			});
			
			after(function (done) {
				done();
			});
			
			//click on Recommendations and Decisions tab
			UofC.clickOnTabByText('Recommendations and Decisions', '#RecAndDecPanelHeading');
			
			it('select recommendation', function(done) {
				UofC.setSelectFieldValueByCSS('#fin-dec-select', decision);
				done();
			});
			
			it('enter comments', function(done) {
				UofC.setTextFieldValueByCSS('#fin-dec-comments', comments);
				done();
			});
			
			it('click the issue decision button', function(done) {
				UofC.clickElementByCSS('#finalDecSubmit');
				UofC.waitForPageLoad(done);
			});
			
			it('click the yes confirmation button', function(done) {
				driver.wait(until.elementIsNotVisible(driver.findElement(By.css('.loading-container'))), waitLong);
				UofC.clickElementByCSS('.modal-footer .btn-toolbar .btn-yes');
				done();
			});
		});
	};
	
	UofC.actionVerifyLicensePDF = function (waitInterval) {
		describe('verify license pdf generated', function() {
			before(function (done) {
				driver.sleep(waitInterval).then(function () {
					driver.get(UofC.getBaseUrl() + '/#' + appType + '/' + harnessObj.getMostRecentApplication(appType, appSubType, false).appId);
					UofC.waitForPageLoad(done);
				});
			});
			
			after(function (done) {
				done();
			});
			
			//click on Recommendations and Decisions tab
			UofC.clickOnTabByText('Recommendations and Decisions', '#RecAndDecPanelHeading');
			
			it('pdf link exists', function(done) {
				//UofC.clickElementByCSS('a[data-id="recs"]');   //clicks the 'Recommendations and Decisions' tab (already done above)
				UofC.waitForPageLoad(function () {
					driver.wait(until.elementLocated(By.css('.files-collection .file-name')), waitLong * 2);
					driver.findElements(By.css('.files-collection .file-name'))
						.then(function (elements) {
							expect(elements.length >= 1).to.be.true;
							
							//get the license number
							driver.findElements(By.css('.authorization-table td'))
								.then(function (elements) {
									elements[1].getText()
										.then(function (text) {
											//write the license number
											harnessObj.setAppLicenseNumber(appType, appSubType, text);
											done();
										});
								});
						});
				});
			});
		});
	};
	
	UofC.actionAddNewSIR = function (sirSubject, sirQuestion, sirReason, displayContactInfo, attachmentPath) {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:  this function will set the role to Lead Review
					  will navigate to 'Collaboration and Actions' tab
					  will click on the 'New SIR' button
					  will fill in the form using the values of given arguments
					  will submit the Create New SIR form
		
		ACCEPTED PARAMETER(S) AND VALUES:
		sirSubject:             "any text"
		sirQuestion:            "any text"
		sirReason:              "Clarification" -> should be a value which exists within the dropdown
		displayContactInfo:     "Yes" / "No" / null
		attachmentPath:         require('path').join(__dirname, '/attachments/SIRAttachment.pdf')
		
		USAGE:  UofC.actionAddNewSIR("testSubject", "testQuestion", "Clarification", "Yes",
					require('path').join(__dirname, '/attachments/SIRAttachment.pdf'), true);
		------------------------------------------------------------------------------------------------------------- */
		describe('add new sir', function() {
			before(function (done) {
				//Lead Reviewer
				driver.get(UofC.getBaseUrl() + '/#workspace/lead-reviewer');
				//  https://UofCuat.aer.ca/UofC/#workspace/lead-reviewer
				
				UofC.waitForPageLoad(function () {
					var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
					UofC.openInternalApplicationBySearch(appId);
					done();
				});
			});
			
			after(function (done) {
				done();
			});
			
			//click on Collaboration and Actions tab
			UofC.clickOnTabByText("Collaboration and Actions", "div#AssessmentRulesPanelHeading");
			
			//click the 'New SIR' button to open the popup
			it('click on new sir button', function(done) {
				UofC.clickElementByCSS('.panel-body .btn-new-sir');
				UofC.waitForPageLoad(done);
			});
			
			//Start: fill in the form -------------------->
			//1. type the Subject value
			it('type the subject value: ' + sirSubject, function(done) {
				UofC.setTextFieldValueByCSS('*[name="subject"]', sirSubject);
				done();
			});
			
			//2. type todays date +1 day within Response Required By field
			it('set the response required by value', function(done) {
				UofC.setTextFieldValueByCSS('#sirDueDate', new harnessObj.Moment().add(1, 'days').format('MM/DD/YYYY'));
				done();
			});
			
			//3. type the Question value
			it('type the question value: ' + sirQuestion, function(done) {
				//type the values
				UofC.setTextFieldValueByCSS('#requestDescription', sirQuestion);
				done();
			});
			
			//4. select the 'Reason for SIR' value
			it('select the reason for sir value: ' + sirReason, function(done) {
				UofC.setSelectFieldValueByCSS('.reason-for-sir', sirReason);
				done();
			});
			
			//5. set the Display Contact Info (accepted parameters: Yes / No)
			if (displayContactInfo !== null) {
				it('set display contact info to: ' + displayContactInfo, function(done) {
					UofC.setButtonRadioFieldValueByCSS('*[name="isContactInfoDisplay"]', displayContactInfo.charAt(0)); // Y or N
					done();
				});
			}
			
			//6. attach one file
			if (attachmentPath !== null) {
				var filePathExploded = attachmentPath.split('\\');
				it('attach sir document file: ' + filePathExploded.pop(), function(done) {
					UofC.setFileUploadByCSS('#uploadAttachment *[name="fileselect[]"]', attachmentPath);
					UofC.waitForPageLoad(done);
				});
			}
			//<-------------------- End: fill in the form
			
			//7. click Send to Applicant button
			it('click send to applicant button', function(done) {
				UofC.clickElementByCSS('.modal-footer .btn-sir-submit');
				driver.sleep(3000);
				UofC.waitForPageLoad(done);
			});
			//NOTE: here there is no success popup to be tested
		});
	};
	
	UofC.actionValidateConditionsTitlesMatchSectionValues = function(conditionsTabValues) {
		/* -------------------------------------------------------------------------------------------------------------
		DESCRIPTION:    while on the Conditions tab next happens in a loop:
                        - retrieve the values from Section column of Sections grid
                        - click on the View button of each row
                        - check the title of the 2nd grid (Conditions - ...) to match the values retrieved from Sections grid
                        - then retrieves every record from Conditions grid - Condition Statement column (one by one)
                        - clicks the Parameter button and retrieves the Condition value from the text area
                        - compares both values above to match
		
		ACCEPTED PARAMETER(S) AND VALUES:
			conditionsTabValues:    this is a json array with 2 dimensions
			e.g.: ---
			var conditionsTabValues = [
				{
					section: 'APPROVAL CERTIFICATE',
					conditionStatement:
						[
							{
								statementValue: 'Pursuant to the Water Act, R.S.A. 2000, c. W-3, as amended, an approval is issued to the Approval Holder for the following activity:'
							},
							{
								statementValue: '(a) placing, constructing, operating, maintaining, removing, disturbing works, in or on any land, water or water body;'
							}
							{
								statementValue: '(e) draining groundwater for the purpose of remediation subject to the attached terms and conditions.'
							}
						]
				}
			]
		--> 'section' should match Sections grid - section column values
		--> 'statementValue' should match Conditions grid - Condition Statement column values
		
		USAGE:  UofC.actionValidateConditionsTitlesMatchSectionValues(conditionsTabValues);
		------------------------------------------------------------------------------------------------------------- */
		if (conditionsTabValues.length > 0) {
			describe('validate conditions tab values from both grids', function() {
				var gridSectionsObj = null;
				var gridConditionsObj = null;
				var sectionName;
				var conditionsGridStatementText, conditionsStatementArrayValue;
				
				before(function(done) {
					//Lead Reviewer
					driver.get(UofC.getBaseUrl() + '/#workspace/lead-reviewer');
					//  https://UofCuat.aer.ca/UofC/#workspace/lead-reviewer
					
					UofC.waitForPageLoad(function() {
						var appId = harnessObj.getMostRecentApplication(appType, appSubType, false).appId;
						UofC.openInternalApplicationBySearch(appId);
						done();
					});
				});
				
				after(function(done) {
					done();
				});
				
				var retrieveSectionValue = function(rowIndex) {
					var arrayIndex = rowIndex;
					rowIndex = rowIndex % 5;
					it('sections grid - retrieve the value of Section column, row ' + (rowIndex + 1) + ' - and click View button for ' + conditionsTabValues[arrayIndex].section, function(done) {
						UofC.waitForObjectLoad('.sections-grid', waitLong, function() {});
						UofC.getElementsByCSS('.sections-grid td.section')
							.then(function (elements) {
								gridSectionsObj.getRowCount()
									.then(function(rowCount) {
										var subIndex = rowIndex % rowCount;
										elements[subIndex].getText()
											.then(function (sectionValue) {
												//console.log('section\'s record ' + subIndex + ' value is: ' + sectionValue);
												sectionName = sectionValue;
												expect(sectionValue).to.equal(conditionsTabValues[arrayIndex].section);
												driver.sleep(100)
													.then(function() {
														//click View button
														clickSectionsViewBtn(rowIndex, done);
														//re-initiate the Conditions grid, old way -> initConditionsGrid(done);
														gridConditionsObj = new UofCGrid('.conditions-grid', harnessObj);
													});
											});
									});
							});
					});
				};
				
				var clickSectionsViewBtn = function(buttonIndex, done) {
					UofC.getElementsByCSS('.sections-grid tbody td>button')
						.then(function (elements) {
							elements[buttonIndex].click()
								.then(function () {
									driver.sleep(1000)
										.then(function () {
											done();
										});
								});
						});
				};
				
				// var initConditionsGrid = function(done) {
				//initialize Conditions grid
				// var gridConditions = new UofCGrid('.conditions-grid', harnessObj);
				// gridConditions.init().then(function (gridConditionsObjIn) {
				// 	gridConditionsObj = gridConditionsObjIn;
				// 	done();
				// });
				// 	driver.sleep(1000);
				// };
				
				var validateConditionsTitle = function(rowIndex) {
					var arrayIndex = rowIndex;
					rowIndex = rowIndex % 5;
					it('conditions grid - the title of the grid is equal to Conditions - ' + conditionsTabValues[arrayIndex].section, function(done) {
						UofC.waitForObjectLoad('#conditionsPanelHeading', waitLong, function() {}, 500, true);
						driver.wait(until.elementLocated(By.css('#conditionsPanelHeading')), waitLong * 2);
						driver.findElement(By.css('#conditionsPanelHeading span'))
							.then(function (element) {
								element.getText()
									.then(function (title) {
										expect(title).to.equal(sectionName);
										//switch the pages if needed
										gridSectionsObj.getRowCount()
											.then(function(rowCount) {
												if (rowIndex + 1 === rowCount && !gridSectionsObj.isOnLastPage()) {
													//console.log('current Sections grid\'s active page: ' + gridSectionsObj.getCurrPage() + ', switching to next page');
													// switchSectionsGridPages(done);
													gridSectionsObj.clickNext()
														.then(function () {
															done();
														});
												} else {
													done();
												}
											});
									});
							});
					});
				};
				
				// var switchSectionsGridPages = function(done) {
				// 	gridSectionsObj.clickNext().then(function (activepage) {
				// 		sectionsGridCurrentPage = activepage;
				// 		//console.log('active page: ' + sectionsGridCurrentPage);
				// 		driver.sleep(1000);
				// 		done();
				// 	});
				// };
				
				var retrieveConditionsStatementValue = function(conditionStatementValues, rowIndex) {
					var arrayIndex = rowIndex;
					rowIndex = rowIndex % 10;
					it('conditions grid - the value from the condition statement column, row ' + (rowIndex + 1) + ' (index ' + rowIndex + ') matches the value of array\'s parameter', function(done) {
						UofC.waitForObjectLoad('.conditions-grid', waitLong, function() {}, 100, true);
						UofC.getElementsByCSS('.conditions-grid td.statement')
							.then(function (elements) {
								driver.sleep(500);
								gridConditionsObj.getRowCount()
									.then(function(rowCount) {
										var subIndex = rowIndex % rowCount;
										elements[subIndex].getText()
											.then(function (conditionsGridStatementValue) {
												//trim the values - remove all spaces, tabs, new lines, etc..
												conditionsGridStatementText = conditionsGridStatementValue.replace(/\s/g, '');
												conditionsStatementArrayValue = (conditionStatementValues[arrayIndex].statementValue).replace(/\s/g, '');
												//console.log('Conditions row index ' + rowIndex + ' grid\'s value is: \n' + conditionsGridStatementText);
												//console.log('Array\'s value is: \n' + conditionsStatementArrayValue);
												//check grid value against the array's parameter
												expect(conditionsGridStatementText).to.equal(conditionsStatementArrayValue);
												done();
											});
									});
							});
					});
				};
				
				var clickParametersBtn = function(buttonIndex) {
					buttonIndex = buttonIndex % 10;
					it('conditions grid - click parameters button on row ' + (buttonIndex + 1) + ' (index ' + buttonIndex + ')', function(done) {
						UofC.waitForObjectLoad('#conditionsPanelHeading', waitLong, function() {}, 100, true);
						UofC.getElementsByCSS('.conditions-grid button[data-event="edit:parameters"]')
							.then(function(elements) {
								elements[buttonIndex].click()
									.then(function () {
										driver.sleep(500)
											.then(function () {
												done();
											});
									});
							});
					});
				};
				
				var validateConditionsStatementValuesMatch = function(rowIndex) {
					rowIndex = rowIndex % 10;
					it('conditions grid - the condition statement value from the modal popup matches the one from the grid, row ' + (rowIndex + 1), function(done) {
						//retrieve the value from the modal popup
						UofC.waitForObjectLoad('.modal-dialog', waitLong, function() {}, 100, true);
						driver.wait(until.elementLocated(By.css('.modal-dialog')), waitLong);
						driver.findElement(By.css('textarea[name="statement"]'))
							.then(function (element) {
								element.getText()
									.then(function (modalConditionText) {
										//trim the value - remove all spaces, tabs, new lines, etc..
										modalConditionText = modalConditionText.replace(/\s/g, '');
										//compare the value from the modal vs the one from the grid
										expect(modalConditionText).to.equal(conditionsGridStatementText);
										//close the modal popup
										UofC.findElementsByCSS('.btn-params-cancel')
											.then(function(cancelButton) {
												cancelButton[0].click()
													.then(function() {
														driver.sleep(500)
															.then(function() {
																gridConditionsObj.getActivePage()
																	.then(function(activePage) {
																		//console.log('active page: ' + activePage + '\n isFirstPage:' + gridConditionsObj.isOnFirstPage() + '\n isLastPage:' + gridConditionsObj.isOnLastPage());
																		gridConditionsObj.getRowCount()
																			.then(function(rowCount) {
																				if ((rowIndex + 1) === rowCount && !gridConditionsObj.isOnLastPage()) {
																					gridConditionsObj.clickNext()
																						.then (function() {
																							driver.sleep(1000)
																								.then(function() {
																									done();
																								});
																						});
																				} else {
																					done();
																				}
																			});
																	});
															});
													});
											});
									});
							});
					});
				};
				
				// var switchConditionsGridPagesToNext = function (done) {
				// 	gridConditionsObj.clickNext().then(function (activepage) {
				// 		//conditionsGridCurrentPage = activepage;
				// 		//conditionsGridCurrentPage = gridConditionsObj.getCurrPage();
				// 		driver.sleep(1000);
				// 		done();
				// 	});
				// };
				
				//click on Conditions tab
				UofC.clickOnTabByText('Conditions', '.condition-tabs.active');
				
				describe('check the values within Sections and Conditions grids', function() {
					//initiate Sections grid first
					before(function (done) {
						gridSectionsObj = new UofCGrid('.sections-grid', harnessObj);
						done();
					});
					
					//loop through all rows of Sections grid within Section column, get the values, click View link for each row and
					// check that the title of the Conditions grid matches the value of the Section column for which the View was clicked
					for (var i = 0; i < conditionsTabValues.length; i++) {
						retrieveSectionValue(i);
						validateConditionsTitle(i);
						
						//loop through all rows of Conditions grid within Conditions Statement column, get the values, click Parameter link for each row and
						// check that the content of the Condition Statement grid matches the values retrieved from the Condition text area
						for (var j = 0; j < conditionsTabValues[i].conditionStatement.length; j++) {
							retrieveConditionsStatementValue(conditionsTabValues[i].conditionStatement, j);//, conditionsStatementValues);
							clickParametersBtn(j);
							validateConditionsStatementValuesMatch(j);
						}
					}
				});
			});
		} else {
			console.log('There are no values within the Sections & Conditions grids, data array\'s length is: ' + conditionsTabValues.length + '\n- nothing to validate');
		}
	};
	
	return UofC;
})();

module.exports = UofC;