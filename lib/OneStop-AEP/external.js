/**
 * Created by cb5rp on 6/1/2017.
 */

/* jshint -W024 */
/* jshint -W014 */
/* jshint laxcomma:true */
/* jshint expr:true */

const expect = require('chai').expect;
const shapeFileWait = 60000;

const UofC = (() => {

    const UofC = require('../UofCApp-base');

    let driver
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
        , env
        , appType
        , appSubType;

    UofC.init = (harnessObjIn, waitShortIn, waitLongIn) => {
        UofC.initBase(harnessObjIn, waitShortIn, waitLongIn);

        const attrs = UofC.getAttrs();

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
        appType = attrs.appType;
        appSubType = attrs.appSubType;
    };


    UofC.pageGeneralContactInformation = (name,
                                             email,
                                             primaryContactValue) => {
        describe('general > contact information', () => {
            before(async () => {
                await driver.get(UofC.getBaseUrl() + '/#' + appType.split('-')[0]);
                await UofC.waitForPageLoad();
            });

            after(async () => {
                const value = await UofC.getElementValueByCSS('#subheader-level-two');
                harnessObj.addApplicationToJSON(value);
            });

            it('enter name', async () => {
                await UofC.setTextFieldValueByCSS('*[name="applicant[contactName]"]', name);
            });

            it('enter email', async () => {
                await UofC.setTextFieldValueByCSS('*[name="applicant[email]"]', email);
            });

            if (primaryContactValue && primaryContactValue != null) {
                it('enter primary contact value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="applicant[primaryContact]"]', primaryContactValue);
                });
            }

            UofC.clickSave();
        });
    };

    UofC.pageGeneralApplicationInformation = (openApplication,
                                                 integrationChoiceValue,
                                                 projectName,
                                                 existingApprovalsValue) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('general > application information', () => {
            UofC.clickLeftSideMenuItems('generalTab:applicationInfo', '#applicationInformationPanelHeading');

            it('set existing project', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="integrationChoice"]', integrationChoiceValue);
            });

            it('enter project name', async () => {
                await UofC.setTextFieldValueByCSS('#new-application-integration-name', projectName);
            });

            it('set existing authorizations', async () => {
                await UofC.setButtonRadioFieldValueByCSS('input[name="existingApprovals"]', existingApprovalsValue);
            });

            UofC.clickSave();
        });
    };

    UofC.pageGeneralProposedActivity = (openApplication,
                                           publicLandBoolean,
                                           privateLandBoolean,
                                           proposedPipelinesActivity,
                                           developmentTypeValue,
                                           integratedAmendmentTypeValue) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('general > proposed activity', () => {
            UofC.clickLeftSideMenuItems('generalTab:proposedActivity', "#proposedActivityPanelHeading");

            if (publicLandBoolean) {
                it('set activity to public land', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="publicLand"]');
                });
            }

            if (privateLandBoolean) {
                it('set activity to private land', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="privateLand"]');
                });
            }

            if (proposedPipelinesActivity) {
                it('check pipelines', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="proposedPipelinesActivity"]');
                });
            }

            it('set association', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="developmentType"]', developmentTypeValue);
            });

            if (integratedAmendmentTypeValue !== null) {
                it('check type of amendment', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="integratedAmendmentType"]', integratedAmendmentTypeValue);
                });
            }

            UofC.clickSave();
        });
    };

    UofC.pageGeneralAdditionalInformation = (openApplication,
                                                stakeholderConcernsValue,
                                                epeaApprovalValue,
                                                epeaCodeOfPracticeNotificationValue,
                                                waterActNotificationSubmittedValue,
                                                waterActApprovalRequiredValue,
                                                waterActLicenceValue) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('general > additional information', () => {
            UofC.clickLeftSideMenuItems('generalTab:additionalInfo', "#additionalInformationPanelHeading");

            it('set stakeholder concerns', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="stakeholderConcerns"]', stakeholderConcernsValue);
            });

            it('set epeaApproval', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="epeaApproval"]', epeaApprovalValue);
            });

            it('set epeaCodeOfPracticeNotification', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="epeaCodeOfPracticeNotification"]', epeaCodeOfPracticeNotificationValue);
            });

            it('set waterActNotificationSubmitted', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="waterActNotificationSubmitted"]', waterActNotificationSubmittedValue);
            });

            it('set waterActApprovalRequired', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="waterActApprovalRequired"]', waterActApprovalRequiredValue);
            });

            it('set waterActLicence', async () => {
                await UofC.setButtonRadioFieldValueByCSS('*[name="waterActLicence"]', waterActLicenceValue);
            });

            UofC.clickSave();
        });
    };

    UofC.pageConfirmationValidationsRules = (openApplication, pause) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('confirmation > validations / rules', () => {
            it('open confirmation section', async () => {
                await UofC.clickElementByCSS('a[data-id="confirmationTab"]');
                const elements = await driver.findElements(By.css('.cssload-container'));
                if (elements.length !== 0) {
                    const element = await driver.findElement(By.css('.cssload-container'));
                    await driver.wait(until.elementIsNotVisible(element), waitLong * 60);
                }
                await UofC.waitForPageLoad();
            });

            it('no validation / rule failures exist', async () => {
                let element = await driver.wait(until.elementLocated(By.css('.validationFailed-grid')), waitLong * 12);
                element = await driver.wait(until.elementIsVisible(element), waitLong * 2);
                const elements = await element.findElements(By.css('button[data-event="view:validationError"]'));
                expect(elements.length).to.equal(0);
            });

            if (pause) {
                it('pause for display', async () => {
                    await driver.sleep(pause);
                });
            }
        });
    };

    UofC.pageConfirmationOverview = (openApplication, applicationType) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('confirmation > overview', () => {
            UofC.clickLeftSideMenuItems('confirmationTab:overview', "#overviewPanelHeading");

            UofC.acceptDisclaimer('#disclaimerButton', '.agree');

            it('click save and submit application', async () => {
                await UofC.clickElementByCSS('.btn-submit-application');
                await UofC.waitForPageLoad();
            });

            UofC.confirmSubmission('Confirm ' + applicationType + ' Submission', 'yes');
            UofC.confirmModalHeader(applicationType + ' Submitted');

            it('click ok in the dialog', async () => {
                await UofC.waitForObjectLoad('h4.modal-title', waitLong);
                await UofC.clickElementByCSS('.btn-close');
                await UofC.waitForPageLoad();
            });
        });
    };

    UofC.pageGeneralActivityDetails = (openApplication,
                                          applicationTypeOptionText,
                                          applicationPurposeOptionText) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('general > activity details', () => {
            UofC.clickLeftSideMenuItems('generalTab:activityDetails', "#ProposedWaterPanelBody");

            it('add a water authorizations row', async () => {
                await UofC.clickElementByCSS('.btn-add-proposed-water');
            });

            it('set application type: ' + applicationTypeOptionText, async () => {
                await UofC.setBackGridSelectText('.proposed-water-grid td.select-cell.editable', 0, applicationTypeOptionText);
                await UofC.waitForPageLoad();
            });

            it('set application purpose: ' + applicationPurposeOptionText, async () => {
                await UofC.setBackGridSelectText('.proposed-water-grid td.select-cell.editable', 1, applicationPurposeOptionText);
            });

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationGeneralApplication = (openApplication,
                                                   attachmentPath,
                                                   publicLandBoolean,
                                                   privateLandBoolean,
                                                   landsAffectedValue,
                                                   publicLandsDispositionNumberValue,
                                                   firstNationsConsultationNumberValue,
                                                   aocAdequacyStatusValue,
                                                   adequacyDecisionDocPath,
                                                   linkedWaterActsValue,
                                                   proposedWorkCompletedValue,
                                                   maintenanceFlagValue,
                                                   startDateValue,
                                                   endDateValue,
                                                   projectDescriptionValue,
                                                   relevantFilePath) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > general application', () => {
            UofC.clickLeftSideMenuItems('authorizationTab', '#activityDetailsPanelHeading');

            it('attach shape file', async () => {
                await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', attachmentPath);
                await UofC.waitForPageLoad()
            });

            it('submit shape file', async () => {
                await UofC.clickElementByCSS('#submitShapeFile');
                await driver.sleep(100);
            });

            it('shows a success popup message', async () => {
                await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
            });

            it('wait for shape file to be processed', async () => {
                await driver.wait(until.elementLocated(By.css('.shape-file-container #mapIt')), shapeFileWait);
                await UofC.waitForPageLoad();
            });

            if (publicLandBoolean) {
                it('set publicLandBoolean boolean', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="publicLand"]');
                });

                if (publicLandsDispositionNumberValue !== null) {
                    it('set publicLandsDispositionNumber value', async () => {
                        await UofC.setTextFieldValueByCSS('*[name="publicLandsDispositionNumber"]', publicLandsDispositionNumberValue);
                    });
                }

                if (firstNationsConsultationNumberValue !== null) {
                    it('set firstNationsConsultationNumber value', async () => {
                        await UofC.setTextFieldValueByCSS('*[name="firstNationsConsultationNumber"]', firstNationsConsultationNumberValue);
                    });
                }

                if (aocAdequacyStatusValue !== null) {
                    it('set aocAdequacyStatus value', async () => {
                        await UofC.setSelectFieldValueByCSS('*[name="aocAdequacyStatus"]', aocAdequacyStatusValue);
                    });
                }

            }

            if (privateLandBoolean) {
                it('set privateLandBoolean boolean', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="privateLand"]');
                });
            }


            if (landsAffectedValue !== null) {
                it('set landsAffected value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="landsAffected"]', landsAffectedValue);
                });
            }

            if (adequacyDecisionDocPath !== null) {
                it('attach adequacy decision document file', async () => {
                    await UofC.setFileUploadByCSS('#adequacyDecisionUpload input[type="file"]', adequacyDecisionDocPath);
                });
            }

            if (linkedWaterActsValue !== null) {
                it('set linkedWaterActs value', async () => {
                    await UofC.waitForPageLoad();
                    await UofC.setButtonRadioFieldValueByCSS('*[name="linkedWaterActs"]', linkedWaterActsValue);
                });
            }

            if (proposedWorkCompletedValue !== null) {
                it('set proposedWorkCompleted value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="proposedWorkCompleted"]', proposedWorkCompletedValue);
                });
            }

            if (maintenanceFlagValue !== null) {
                it('set maintenanceFlag value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="maintenanceFlag"]', maintenanceFlagValue);
                });
            }

            if (startDateValue !== null) {
                it('set startDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="startDate"]', startDateValue);
                });
            }

            if (endDateValue !== null) {
                it('set endDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="endDate"]', endDateValue);
                });
            }

            if (projectDescriptionValue !== null) {
                it('set projectDescription value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="activityDescription"]', projectDescriptionValue);
                });
            }

            if (relevantFilePath !== null) {
                it('attach relevant file', async () => {
                    await UofC.setFileUploadByCSS('#relevantFilesUpload input[type="file"]', relevantFilePath);
                });
            }

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationWaterBody = (openApplication,
                                          waterSourceValue,
                                          impactedWaterBodyArray,
                                          impactWetlandsValue) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > water body', () => {
            const addWaterbody = function (impactedWaterBody) {
                it('add a impacted water body row', async () => {
                    await UofC.clickElementByCSS('.btn-add-impacted-water-body');
                });

                it('enter search term: ' + impactedWaterBody.name, async () => {
                    await UofC.setTextFieldValueByCSS('*[name="impactedWaterBody"]', impactedWaterBody.name);
                });

                it('click search', async () => {
                    await UofC.clickElementByCSS('.btn-search');
                    await UofC.waitForPageLoad();
                });

                it('select results', async () => {
                    await UofC.clickElementByCSS('.modal-body .select-all-header-cell input');
                });

                it('click add', async () => {
                    await UofC.clickElementByCSS('.modal-footer .btn-save');
                    await UofC.waitForPageLoad();
                    await driver.sleep(100);
                });
            };

            UofC.clickLeftSideMenuItems('authorizationTab:authorizationWaterSource', "#waterSourcePanelHeading");

            if (waterSourceValue !== null) {
                it('set waterSource value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="waterSource"]', waterSourceValue);
                });
            }

            if (impactedWaterBodyArray !== null && impactedWaterBodyArray.length > 0) {
                for (let i = 0; i < impactedWaterBodyArray.length; i++) {
                    addWaterbody(impactedWaterBodyArray[i]);
                }
            }

            if (impactWetlandsValue !== null) {
                it('set impactWetlands value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="impactWetlands"]', impactWetlandsValue);
                });
            }
        });
    };

    UofC.pageAuthorizationAdditionalInformationDam = (openApplication,
                                                         pondShapeFilePath,
                                                         pondLifeValue,
                                                         omsDateValue,
                                                         omsFilePath,
                                                         eppDateValue,
                                                         eppFilePath,
                                                         erpDateValue,
                                                         erpFilePath,
                                                         consequenceClassificationValue,
                                                         fullSupplyLevelElevationValue,
                                                         freeboardValue,
                                                         liveStorageCapacityValue,
                                                         totalStorageCapacityValue,
                                                         fluidTypeValue,
                                                         damShapeFilePath,
                                                         damInformationArray) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > additional information (dam)', () => {
            UofC.clickLeftSideMenuItems('authorizationTab:authorizationAdditionalInformation', "#pondInformationPanelHeader");

            if (pondShapeFilePath) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', pondShapeFilePath);
                });

                it('submit pond shape file', async () => {
                    await UofC.clickElementByCSS('#submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
                });

                it('wait for shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.pond-shape-file-container #mapIt')), shapeFileWait);
                    await UofC.waitForPageLoad();
                });
            }

            // Dam Fields

            if (fullSupplyLevelElevationValue !== null) {
                it('set fullSupplyLevelElevation value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="fullSupplyLevelElevation"]', fullSupplyLevelElevationValue);
                });
            }

            if (freeboardValue !== null) {
                it('set freeboard value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="freeboard"]', freeboardValue);
                });
            }

            if (liveStorageCapacityValue !== null) {
                it('set liveStorageCapacity value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="liveStorageCapacity"]', liveStorageCapacityValue);
                });
            }

            if (totalStorageCapacityValue !== null) {
                it('set totalStorageCapacity value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="totalStorageCapacity"]', totalStorageCapacityValue);
                });
            }

            if (fluidTypeValue !== null) {
                it('set fluidType value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="fluidType"]', fluidTypeValue);
                });
            }

            if (pondLifeValue !== null) {
                it('set pondLife value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="pondLife"]', pondLifeValue);
                });
            }

            if (omsDateValue !== null) {
                it('set omsDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="omsDate"]', omsDateValue);
                });
            }

            if (omsFilePath !== null) {
                it('set omsFilePath value', async () => {
                    await UofC.setFileUploadByCSS('#operationManualUpload input[type="file"]', omsFilePath);
                });
            }

            if (eppDateValue !== null) {
                it('set eppDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="eppDate"]', eppDateValue);
                });
            }

            if (eppFilePath !== null) {
                it('set eppFilePath value', async () => {
                    await UofC.setFileUploadByCSS('#emergencyPreparednessUpload input[type="file"]', eppFilePath);
                });
            }

            if (erpDateValue !== null) {
                it('set erpDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="erpDate"]', erpDateValue);
                });
            }

            if (erpFilePath !== null) {
                it('set erpFilePath value', async () => {
                    await UofC.setFileUploadByCSS('#emergencyResponseUpload input[type="file"]', erpFilePath);
                });
            }

            if (consequenceClassificationValue !== null) {
                it('set consequenceClassification value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="consequenceClassification"]', consequenceClassificationValue);
                });
            }

            if (damShapeFilePath !== null) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('.dam-shape-file-container #shapeFileUpload input[type="file"]', damShapeFilePath);
                });

                it('submit dam shape file', async () => {
                    await UofC.clickElementByCSS('.dam-shape-file-container #submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
                });

                it('wait for dam shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.dam-shape-file-container #mapIt')), 300000);
                    await UofC.waitForPageLoad();
                });
            }

            if (damInformationArray !== null) {
                it('wait until dam information table populates', async () => {
                    await driver.wait(until.elementLocated(By.css('*[data-event="open-dam"]')), 30000);
                    await UofC.waitForPageLoad();
                });

                it('enter dam table data', async () => {
                    const completeDamInformation = async (damInfo, i) => {
                        const elements = await UofC.getElementsByCSS('*[data-event="open-dam"]');

                        await UofC.waitForPageLoad();
                        await elements[i].click();
                        await driver.sleep(500);
                        // await UofC.setTextFieldValueByCSS('*[name="designReportDate"]', damInfo.designReportDate);
                        // await UofC.setFileUploadByCSS('#designReportUpload input[type="file"]', damInfo.designReportFilePath);
                        // await UofC.setTextFieldValueByCSS('*[name="dsrDate"]', damInfo.dsrDate);
                        // await UofC.setFileUploadByCSS('#dsrUpload input[type="file"]', damInfo.dsrFilePath);
                        // await UofC.setTextFieldValueByCSS('*[name="acprDate"]', damInfo.acprDate);
                        // await UofC.setFileUploadByCSS('#acprUpload input[type="file"]', damInfo.acprFilePath);
                        await UofC.setTextFieldValueByCSS('*[name="maxHeight"]', damInfo.maxHeight);
                        await UofC.setTextFieldValueByCSS('*[name="damMaxCrestElevation"]', damInfo.damMaxCrestElevation);
                        await UofC.setTextFieldValueByCSS('*[name="currentCrestElevation"]', damInfo.currentCrestElevation);
                        await UofC.setTextFieldValueByCSS('*[name="constructionStartDate"]', damInfo.constructionStartDate);
                        await UofC.setTextFieldValueByCSS('*[name="constructionEndDate"]', damInfo.constructionEndDate);
                        await UofC.setTextFieldValueByCSS('*[name="firstFilingDate"]', damInfo.firstFilingDate);
                        await UofC.clickElementByCSS('.modal-footer .btn-save');
                        await driver.sleep(waitShort);
                    };

                    for (let i = 0; i < damInformationArray.length; i++) {
                        await completeDamInformation(damInformationArray[i], i);
                    }
                });
            }

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationAdditionalInformationDrainage = (openApplication,
                                                              drainageShapeFilePath,
                                                              dewateringBoolean,
                                                              agriculturalDrainageBoolean,
                                                              stormwaterManagementBoolean,
                                                              otherBoolean,
                                                              otherDescriptionValue,
                                                              masterDrainagePlanBoundryValue,
                                                              copProjectNoticeValue,
                                                              waterBodyClassValue,
                                                              restrictedActivityPeriodValue,
                                                              restrictedActivityStartDateValue,
                                                              restrictedActivityEndDateValue,
                                                              impactAquaticEnvironmentValue,
                                                              aquaticImpactUploadPath,
                                                              aquaticSpecialistNameValue,
                                                              aquaticSpecialistDesignationValue,
                                                              locationPlanUploadPath,
                                                              terminalWaterbodyValue,
                                                              proposedDevelopmentValue,
                                                              otherDevelopmentDescriptionValue,
                                                              corporateLimitsValue,
                                                              requiredEpeaValue,
                                                              eapaNumberArray,
                                                              stormwaterManagementGuidelinesUploadPath,
                                                              professionalNameValue,
                                                              professonalDesignationApegaValue,
                                                              impactLandownersValue,
                                                              potentialErosionValue,
                                                              mitigationMeasuresValue,
                                                              mitigationReportValue,
                                                              mitigationMeasuresDescriptionUploadPath
    ) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > additional information (drainage)', () => {

            UofC.clickLeftSideMenuItems('authorizationTab:authorizationAdditionalInformation', '#drainagePanelHeader');

            if (drainageShapeFilePath) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', drainageShapeFilePath);
                });

                it('submit pond shape file', async () => {
                    await UofC.clickElementByCSS('#submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
                });

                it('wait for shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.shape-file-container #mapIt')), shapeFileWait);
                    await UofC.waitForPageLoad();
                });
            }

            // Drainage Fields
            if (dewateringBoolean) {
                it('set dewatering', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="dewatering"]');
                });
            }

            if (agriculturalDrainageBoolean) {
                it('set agriculturalDrainage', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="agriculturalDrainage"]');
                });
            }

            if (stormwaterManagementBoolean) {
                it('set stormwaterManagement', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="stormwaterManagement"]');
                });
            }

            if (otherBoolean) {
                it('set other', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="other"]');
                });
            }

            if (otherDescriptionValue !== null) {
                it('set otherDescription value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="otherDescription"]', otherDescriptionValue);
                });
            }

            if (masterDrainagePlanBoundryValue !== null) {
                it('set masterDrainagePlanBoundry value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="masterDrainagePlanBoundry"]', masterDrainagePlanBoundryValue);
                });
            }

            if (copProjectNoticeValue !== null) {
                it('set copProjectNotice value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="copProjectNotice"]', copProjectNoticeValue);
                });
            }

            if (waterBodyClassValue !== null) {
                it('set waterBodyClass value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="waterBodyClass"]', waterBodyClassValue);
                });
            }

            if (restrictedActivityPeriodValue !== null) {
                it('set restrictedActivityPeriod value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="restrictedActivityPeriod"]', restrictedActivityPeriodValue);
                });

                if (restrictedActivityPeriodValue === 'Y') {
                    if (restrictedActivityStartDateValue !== null) {
                        it('set restrictedActivityStartDate value', async () => {
                            await UofC.setTextFieldValueByCSS('*[name="restrictedActivityStartDate"]', restrictedActivityStartDateValue);
                        });
                    }

                    if (restrictedActivityEndDateValue !== null) {
                        it('set restrictedActivityEndDate value', async () => {
                            await UofC.setTextFieldValueByCSS('*[name="restrictedActivityEndDate"]', restrictedActivityEndDateValue);
                        });
                    }
                }
            }

            if (impactAquaticEnvironmentValue !== null) {
                it('set impactAquaticEnvironment value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="impactAquaticEnvironment"]', impactAquaticEnvironmentValue);
                });
            }

            if (aquaticImpactUploadPath !== null) {
                it('set aquaticImpactUpload value', async () => {
                    await UofC.setFileUploadByCSS('#aquaticImpactUpload input[type="file"]', aquaticImpactUploadPath);
                });
            }

            if (aquaticSpecialistNameValue !== null) {
                it('set aquaticSpecialistName value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="aquaticSpecialistName"]', aquaticSpecialistNameValue);
                });
            }

            if (aquaticSpecialistDesignationValue !== null) {
                it('set aquaticSpecialistDesignation value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="aquaticSpecialistDesignation"]', aquaticSpecialistDesignationValue);
                });
            }

            if (locationPlanUploadPath !== null) {
                it('set locationPlanUpload value', async () => {
                    await UofC.setFileUploadByCSS('#locationPlanUpload input[type="file"]', locationPlanUploadPath);
                });
            }

            if (terminalWaterbodyValue !== null) {
                it('set terminalWaterbody value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="terminalWaterbody"]', terminalWaterbodyValue);
                });
            }

            if (proposedDevelopmentValue !== null) {
                it('set proposedDevelopment value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="proposedDevelopment"]', proposedDevelopmentValue);
                });

                if (proposedDevelopmentValue === 'Other') {
                    if (otherDevelopmentDescriptionValue !== null) {
                        it('set otherDevelopmentDescription value', async () => {
                            await UofC.setTextFieldValueByCSS('*[name="otherDevelopmentDescription"]', otherDevelopmentDescriptionValue);
                        });
                    }
                }
            }

            if (corporateLimitsValue !== null) {
                it('set corporateLimits value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="corporateLimits"]', corporateLimitsValue);
                });
            }

            if (requiredEpeaValue !== null) {
                it('set requiredEpea value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="requiredEpea"]', requiredEpeaValue);
                });

                if (requiredEpeaValue === 'Y') {
                    const addDrainageEAPAEntry = (eapaEntry, index) => {
                        it('add new epea number row', async () => {
                            await UofC.clickElementByCSS('#addRelatedEpea', index);
                            await driver.sleep(100);
                        });

                        it('set eapa number', async () => {
                            await UofC.setBackGridText('#relatedEpeaGrid td.authorizationId',
                                index, eapaEntry.eapaNumber);
                        });

                        it('set date', async () => {
                            await UofC.setBackGridText('#relatedEpeaGrid td.moment-cell', index, eapaEntry.date);
                        });
                    };

                    if (eapaNumberArray !== null && eapaNumberArray.length > 0) {
                        for (let i = 0; i < eapaNumberArray.length; i++) {
                            addDrainageEAPAEntry(eapaNumberArray[i], i);
                        }
                    }
                }
            }

            if (stormwaterManagementBoolean) {
                if (stormwaterManagementGuidelinesUploadPath !== null) {
                    it('set stormwaterManagementGuidelinesUpload value', async () => {
                        await UofC.setFileUploadByCSS('#stormwaterManagementGuidelinesUpload input[type="file"]',
                            stormwaterManagementGuidelinesUploadPath);
                    });
                }

                if (professionalNameValue !== null) {
                    it('set professionalName value', async () => {
                        await UofC.setTextFieldValueByCSS('*[name="professionalName"]', professionalNameValue);
                    });
                }

                if (professonalDesignationApegaValue !== null) {
                    it('set professonalDesignationApega value', async () => {
                        await UofC.setSelectFieldValueByCSS('*[name="professonalDesignationApega"]',
                            professonalDesignationApegaValue);
                    });
                }
            }

            if (impactLandownersValue !== null) {
                it('set impactLandowners value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="impactLandowners"]', impactLandownersValue);
                });
            }

            if (potentialErosionValue !== null) {
                it('set potentialErosion value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="potentialErosion"]', potentialErosionValue);
                });

                if (potentialErosionValue === 'Y') {
                    if (mitigationMeasuresValue !== null) {
                        it('set mitigationMeasures value', async () => {
                            await UofC.setButtonRadioFieldValueByCSS('*[name="mitigationMeasures"]', mitigationMeasuresValue);
                        });
                    }

                    if (mitigationReportValue !== null) {
                        it('set mitigationReport value', async () => {
                            await UofC.setButtonRadioFieldValueByCSS('*[name="mitigationReport"]', mitigationReportValue);
                        });

                        if (mitigationReportValue === 'N') {
                            if (mitigationMeasuresDescriptionUploadPath !== null) {
                                it('set mitigationMeasuresDescriptionUpload value', async () => {
                                    await UofC.setFileUploadByCSS('#mitigationMeasuresDescriptionUpload input[type="file"]', mitigationMeasuresDescriptionUploadPath);
                                });
                            }
                        }
                    }
                }
            }

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationAdditionalInformationExcavation = (openApplication,
                                                                excavationShapeFilePath,
                                                                excavMeasureArray,
                                                                burrowPitBoolean,
                                                                dugoutBoolean,
                                                                endPitLakeBoolean,
                                                                sandAndGravelSiteBoolean,
                                                                otherBoolean,
                                                                otherDescriptionValue,
                                                                groundwaterBoolean,
                                                                surfaceWaterBoolean,
                                                                epeaApplicationRequiredValue,
                                                                eapaNumberArray
    ) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > additional information (excavation)', () => {
            UofC.clickLeftSideMenuItems('authorizationTab:authorizationAdditionalInformation', "#excavationPanelHeader");

            if (excavationShapeFilePath) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', excavationShapeFilePath);
                });

                it('submit pond shape file', async () => {
                    await UofC.clickElementByCSS('#submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 3);
                });

                it('wait for shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.shape-file-container #mapIt')), shapeFileWait);
                    await UofC.waitForPageLoad();
                });
            }

            // Excavation Fields

            if (excavMeasureArray){
                let entry;
                for (let i=0; i<excavMeasureArray.length; i++){
                    entry = excavMeasureArray[i];

                    it('set excavation measurement volume (' + i + ')', async () => {
                        await UofC.setBackGridText('#excavationInformationGrid td.volume', i, entry.volume);
                    });

                    it('set excavation measurement length (' + i + ')', async () => {
                        await UofC.setBackGridText('#excavationInformationGrid td.length', i, entry.length);
                    });

                    it('set excavation measurement width (' + i + ')', async () => {
                        await UofC.setBackGridText('#excavationInformationGrid td.width', i, entry.width);
                    });

                    it('set excavation measurement depth (' + i + ')', async () => {
                        await UofC.setBackGridText('#excavationInformationGrid td.depth', i, entry.depth);
                    });

                    it('set excavation measurement area (' + i + ')', async () => {
                        await UofC.setBackGridText('#excavationInformationGrid td.area', i, entry.area);
                    });

                    it('set excavation measurement slope (' + i + ')', async () => {
                        await UofC.setBackGridText('#excavationInformationGrid td.slope', i, entry.slope);
                    });
                }
            }

            if (burrowPitBoolean) {
                it('set burrowPit', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="burrowPit"]');
                });
            }

            if (dugoutBoolean) {
                it('set dugout', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="dugout"]');
                });
            }

            if (endPitLakeBoolean) {
                it('set endPitLake', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="endPitLake"]');
                });
            }

            if (sandAndGravelSiteBoolean) {
                it('set sandAndGravelSite', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="sandAndGravelSite"]');
                });
            }

            if (otherBoolean) {
                it('set other', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="other"]');
                });
            }

            if (otherDescriptionValue !== null) {
                it('set otherDescription value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="otherDescription"]', otherDescriptionValue);
                });
            }

            if (groundwaterBoolean) {
                it('set groundwater', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="groundwater"]');
                });
            }

            if (surfaceWaterBoolean) {
                it('set surfaceWater', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="surfaceWater"]');
                });
            }

            if (epeaApplicationRequiredValue !== null) {
                it('set epeaApplicationRequired value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="epeaApplicationRequired"]', epeaApplicationRequiredValue);
                });

                const addExcavationEAPAEntry = (eapaEntry, index) => {
                    it('add new epea number row', async () => {
                        await UofC.clickElementByCSS('#addRelatedEpea', index);
                        await driver.sleep(100);
                    });

                    it('set eapa number', async () => {
                        await UofC.setBackGridText('#relatedEpeaGrid td.applicationNumber', index, eapaEntry.eapaNumber);
                    });

                    it('set date', async () => {
                        await UofC.setBackGridText('#relatedEpeaGrid td.moment-cell', index, eapaEntry.date);
                    });
                };

                if (epeaApplicationRequiredValue === 'Y') {
                    if (eapaNumberArray !== null && eapaNumberArray.length > 0) {
                        for (let i = 0; i < eapaNumberArray.length; i++) {
                            addExcavationEAPAEntry(eapaNumberArray[i], i);
                        }
                    }
                }
            }

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationAdditionalInformationFloodControl = (openApplication,
                                                                  floodControlShapeFilePath,
                                                                  waterBodyMappedValue,
                                                                  waterBodyClassValue,
                                                                  restrictedAreaPeriodValue,
                                                                  restrictedActivityStartDateValue,
                                                                  restrictedActivityEndDateValue,
                                                                  impactLakeValue,
                                                                  fishBearingValue,
                                                                  impactAquaticEnvironmentValue,
                                                                  aquaticImpactUploadPath,
                                                                  aquaticSpecialistNameValue,
                                                                  aquaticSpecialistDesignationValue,
                                                                  impactMeasurementsArray,
                                                                  proposedActivityImpactValue,
                                                                  adjacentLandownersImpactValue,
                                                                  erosionPotentialValue,
                                                                  permanentMitigationMeasuresValue,
                                                                  measuresIdentifiedValue,
                                                                  mitigationDescriptionUploadPath
    ) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > additional information (flood control)', () => {
            UofC.clickLeftSideMenuItems('authorizationTab:authorizationAdditionalInformation', "#floodControlPanelHeader");

            if (floodControlShapeFilePath) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', floodControlShapeFilePath);
                });

                it('submit pond shape file', async () => {
                    await UofC.clickElementByCSS('#submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
                });

                it('wait for shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.shape-file-container #mapIt')), shapeFileWait);
                    await UofC.waitForPageLoad();
                });
            }

            // Flood Control Fields

            if (waterBodyMappedValue !== null) {
                it('set waterBodyMapped value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="waterBodyMapped"]', waterBodyMappedValue);
                });
            }

            if (waterBodyClassValue !== null) {
                it('set waterBodyClass value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="waterBodyClass"]', waterBodyClassValue);
                });
            }

            if (restrictedAreaPeriodValue !== null) {
                it('set restrictedAreaPeriod value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="restrictedAreaPeriod"]', restrictedAreaPeriodValue);
                });

                if (restrictedAreaPeriodValue === 'Y') {
                    if (restrictedActivityStartDateValue !== null) {
                        it('set restrictedActivityStartDate value', async () => {
                            await UofC.setTextFieldValueByCSS('*[name="restrictedActivityStartDate"]', restrictedActivityStartDateValue);
                        });
                    }

                    if (restrictedActivityEndDateValue !== null) {
                        it('set restrictedActivityEndDate value', async () => {
                            await UofC.setTextFieldValueByCSS('*[name="restrictedActivityEndDate"]', restrictedActivityEndDateValue);
                        });
                    }
                }
            }

            if (impactLakeValue !== null) {
                it('set impactLake value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="impactLake"]', impactLakeValue);
                });
            }

            if (fishBearingValue !== null) {
                it('set fishBearing value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="fishBearing"]', fishBearingValue);
                });
            }

            if (impactAquaticEnvironmentValue !== null) {
                it('set impactAquaticEnvironment value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="impactAquaticEnvironment"]', impactAquaticEnvironmentValue);
                });
            }

            if (aquaticImpactUploadPath !== null) {
                it('set aquaticImpactUpload value', async () => {
                    await UofC.setFileUploadByCSS('#aquaticImpactUpload input[type="file"]', aquaticImpactUploadPath);
                });
            }

            if (aquaticSpecialistNameValue !== null) {
                it('set aquaticSpecialistName value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="aquaticSpecialistName"]', aquaticSpecialistNameValue);
                });
            }

            if (aquaticSpecialistDesignationValue !== null) {
                it('set aquaticSpecialistDesignation value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="aquaticSpecialistDesignation"]', aquaticSpecialistDesignationValue);
                });
            }



            if (proposedActivityImpactValue !== null) {
                it('set proposedActivityImpact value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="proposedActivityImpact"]', proposedActivityImpactValue);
                });
            }

            if (adjacentLandownersImpactValue !== null) {
                it('set adjacentLandownersImpact value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="adjacentLandownersImpact"]', adjacentLandownersImpactValue);
                });
            }

            if (erosionPotentialValue !== null) {
                it('set erosionPotential value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="erosionPotential"]', erosionPotentialValue);
                });

                if (erosionPotentialValue === 'Y') {
                    if (permanentMitigationMeasuresValue !== null) {
                        it('set permanentMitigationMeasures value', async () => {
                            await UofC.setButtonRadioFieldValueByCSS('*[name="permanentMitigationMeasures"]', permanentMitigationMeasuresValue);
                        });
                    }

                    if (measuresIdentifiedValue !== null) {
                        it('set measuresIdentified value', async () => {
                            await UofC.setButtonRadioFieldValueByCSS('*[name="measuresIdentified"]', measuresIdentifiedValue);
                        });

                        if (measuresIdentifiedValue === 'N') {
                            if (mitigationDescriptionUploadPath !== null) {
                                it('set mitigationDescriptionUpload value', async () => {
                                    await UofC.setFileUploadByCSS('#mitigationDescriptionUpload input[type="file"]', mitigationDescriptionUploadPath);
                                });
                            }
                        }
                    }
                }
            }

            if (impactMeasurementsArray){
                let entry;
                for (let i=0; i<impactMeasurementsArray.length; i++){
                    entry = impactMeasurementsArray[i];

                    it('set impact measurement length (' + i + '): ' + entry.length, async () => {
                        await UofC.setBackGridText('#floodControlGrid td.volume', i, entry.length);
                    });

                    it('set impact measurement type (' + i + '): ' + entry.type, async () => {
                        await UofC.setBackGridSelectCheckboxes('#floodControlGrid td.multiselect-cell', i, entry.type);
                    });

                    it('set impact measurement activity (' + i + '): ' + entry.activity, async () => {
                        await UofC.setBackGridSelectText('#floodControlGrid td.select-cell', i, entry.activity);
                    });
                }
            }

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationAdditionalInformationWetlandsWaif = (openApplication,
                                                                  associatedActivityValue,
                                                                  shapeFilePath,
                                                                  publicLandsActOwnershipReviewValue,
                                                                  ownershipDecisionFilePath,
                                                                  abwretdValueValue,
                                                                  abwretaResultsFilePath,
                                                                  desktopAssessmentDateValue,
                                                                  desktopAssessmentUploadFilePath,
                                                                  authenticatingProfessionalsArray,
                                                                  waifTemplateCsvFilePath,
                                                                  waif_wetland_replBoolean,
                                                                  waif_wetland_reclaimBoolean,
                                                                  waif_resp_replBoolean,
                                                                  waifMinimizeAndReclaimValue,
                                                                  waifWetlandReclamationFilePath,
                                                                  waifWetlandReplacementFilePath,
                                                                  waifPermitteeResponsibleFilePath,
                                                                  wetlandReplacementGridArray,
                                                                  constructionEndDateValue,
                                                                  reclamationStartDateValue,
                                                                  monthsAffectedArray
    ) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > additional information (wetlands waif)', () => {
            UofC.clickLeftSideMenuItems('authorizationTab:authorizationAdditionalInformation', "#wetlandsPanelHeader");

            if (associatedActivityValue !== null) {
                it('set associated activity value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="associatedActivity"]', associatedActivityValue);
                });
            }

            if (shapeFilePath) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', shapeFilePath);
                });

                it('submit shape file', async () => {
                    await UofC.clickElementByCSS('#submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
                });

                it('wait for shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.shape-file-container #mapIt')), shapeFileWait);
                    await UofC.waitForPageLoad();
                });
            }

            if (publicLandsActOwnershipReviewValue !== null) {
                it('set publicLandsActOwnershipReview value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="publicLandsActOwnershipReview"]', publicLandsActOwnershipReviewValue);
                });

                if (publicLandsActOwnershipReviewValue === 'Y') {
                    if (ownershipDecisionFilePath !== null) {
                        it('attach ownershipDecision file', async () => {
                            await UofC.setFileUploadByCSS('#ownershipDecision input[type="file"]', ownershipDecisionFilePath);
                        });
                    }
                }
            }

            if (abwretdValueValue !== null) {
                it('set abwretdValue value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="abwretdValue"]', abwretdValueValue);
                });

                if (abwretdValueValue === 'Y') {
                    if (abwretaResultsFilePath !== null) {
                        it('attach abwretaResults file', async () => {
                            await UofC.setFileUploadByCSS('#abwretaResults input[type="file"]', abwretaResultsFilePath);
                        });
                    }
                }
            }

            if (desktopAssessmentDateValue !== null) {
                it('set desktopAssessmentDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="desktopAssessmentDate"]', desktopAssessmentDateValue);
                });
            }

            if (desktopAssessmentUploadFilePath !== null) {
                it('attach desktopAssessmentUpload file', async () => {
                    await UofC.setFileUploadByCSS('#desktopAssessmentUpload input[type="file"]', desktopAssessmentUploadFilePath);
                });
            }

            if (authenticatingProfessionalsArray !== null && authenticatingProfessionalsArray.length > 0) {
                const addAuthenticatingWAIFProfessional = (professional, index) => {
                    it('add new authenticating professional row', async () => {
                        await UofC.clickElementByCSS('.btn-add-waif-professional');
                        await driver.sleep(100);
                    });

                    it('set professional name', async () => {
                        await UofC.setBackGridText('#waifProfessionalGrid td.professionalName', index, professional.name);
                    });

                    it('set professional employer', async () => {
                        await UofC.setBackGridText('#waifProfessionalGrid td.professionalEmployer', index, professional.employer);
                    });

                    it('set professional designation', async () => {
                        await UofC.setBackGridSelectText('#waifProfessionalGrid td.select-cell', index, professional.designation);
                    });
                };

                for (let i = 0; i < authenticatingProfessionalsArray.length; i++) {
                    addAuthenticatingWAIFProfessional(authenticatingProfessionalsArray[i], i);
                }
            }

            if (waifTemplateCsvFilePath !== null) {
                it('attach waif template csv file', async () => {
                    await UofC.setFileUploadByCSS('#fileInputsWAIF', waifTemplateCsvFilePath);
                });
            }

            if (waif_wetland_replBoolean) {
                it('set waif_wetland_repl value', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="waif_wetland_repl"]');
                });

                if (waifWetlandReplacementFilePath !== null) {
                    it('attach waifWetlandReplacement file', async () => {
                        await UofC.setFileUploadByCSS('#waifWetlandReplacement input[type="file"]', waifWetlandReplacementFilePath);
                    });
                }
            }

            if (waif_wetland_reclaimBoolean) {
                it('set waif_wetland_reclaim value', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="waif_wetland_reclaim"]');
                });

                if (waifWetlandReclamationFilePath !== null) {
                    it('attach waifWetlandReclamation file', async () => {
                        await UofC.setFileUploadByCSS('#waifWetlandReclamation input[type="file"]', waifWetlandReclamationFilePath);
                    });
                }
            }

            if (waif_resp_replBoolean) {
                it('set waif_resp_repl value', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="waif_resp_repl"]');
                });

                if (waifPermitteeResponsibleFilePath !== null) {
                    it('attach waifPermitteeResponsible file', async () => {
                        await UofC.setFileUploadByCSS('#waifPermitteeResponsible input[type="file"]', waifPermitteeResponsibleFilePath);
                    });
                }
            }

            if (waifMinimizeAndReclaimValue !== null) {
                it('set waifMinimizeAndReclaim value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="waifMinimizeAndReclaim"]', waifMinimizeAndReclaimValue);
                });
            }

            if (wetlandReplacementGridArray !== null && wetlandReplacementGridArray.length > 0) {
                const addWetlandWAIFReplacementEntry = (entry, index) => {
                    it('set RWVAU value (' + index + '): ' + entry.RWVAU, async () => {
                        await UofC.setBackGridSelectText('#waifWetlandReplacementGrid td.select-cell.editable',
                            index, entry.RWVAU);
                    });

                    it('set replacementArea value (' + index + '): ' + entry.replacementArea, async () => {
                        await UofC.setBackGridText('#waifWetlandReplacementGrid td.replacementArea',
                            index, entry.replacementArea);
                    });

                    it('set replacementRate value (' + index + '): ' + entry.replacementRate, async () => {
                        await UofC.setBackGridText('#waifWetlandReplacementGrid td.replacementRate',
                            index, entry.replacementRate);
                    });

                    it('set replacementCost value (' + index + '): ' + entry.replacementCost, async () => {
                        await UofC.setBackGridText('#waifWetlandReplacementGrid td.replacementCost',
                            index, entry.replacementCost);
                    });
                };

                for (let j = 0; j < wetlandReplacementGridArray.length; j++) {
                    addWetlandWAIFReplacementEntry(wetlandReplacementGridArray[j], j);
                }
            }

            if (constructionEndDateValue !== null) {
                it('set constructionEndDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="constructionEndDate"]', constructionEndDateValue);
                });
            }

            if (reclamationStartDateValue !== null) {
                it('set reclamationStartDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="reclamationStartDate"]', reclamationStartDateValue);
                });
            }

            if (monthsAffectedArray !== null) {
                it('set months affected', async () => {
                    for (let i = 0; i < monthsAffectedArray.length; i++) {
                        await UofC.setButtonCheckboxByCSS('*[name="' + monthsAffectedArray[i].toLowerCase() + '"]');
                    }
                });
            }

            UofC.clickSave();
        });
    };

    UofC.pageAuthorizationAdditionalInformationWetlandsWair = (openApplication,
                                                                  associatedActivityValue,
                                                                  shapeFilePath,
                                                                  publicLandsActOwnershipReviewValue,
                                                                  ownershipDecisionFilePath,
                                                                  goaSubmissionValue,
                                                                  abwretaResultsFilePath,
                                                                  fieldAssessmentDateValue,
                                                                  fieldAssessmentUploadFilePath,
                                                                  authenticatingProfessionalsArray,
                                                                  wairTemplateCsvFilePath,
                                                                  wair_inlieu_fee_payBoolean,
                                                                  wair_resp_replBoolean,
                                                                  wair_wetland_reclaimBoolean,
                                                                  waifMinimizeAndReclaimValue,
                                                                  wairInLieuFeeFilePath,
                                                                  wairPermitteeResponsibleFilePath,
                                                                  wairWetlandReclamationFilePath,
                                                                  wetlandReplacementGridArray,
                                                                  constructionEndDateValue,
                                                                  reclamationStartDateValue,
                                                                  monthsAffectedArray
    ) => {
        if (openApplication) {
            UofC.openApplicationByLink();
        }

        describe('authorization > additional information (wetlands wair)', () => {
            UofC.clickLeftSideMenuItems('authorizationTab:authorizationAdditionalInformation', "#wetlandsPanelHeader");

            if (associatedActivityValue !== null) {
                it('set associated activity value', async () => {
                    await UofC.setSelectFieldValueByCSS('*[name="associatedActivity"]', associatedActivityValue);
                });
            }

            if (shapeFilePath) {
                it('attach shape file', async () => {
                    await UofC.setFileUploadByCSS('#shapeFileUpload input[type="file"]', shapeFilePath);
                });

                it('submit shape file', async () => {
                    await UofC.clickElementByCSS('#submitShapeFile');
                });

                it('shows a success popup message', async () => {
                    await UofC.popUpConfirmation('Shapefile submitted for processing', waitLong * 2);
                });

                it('wait for shape file to be processed', async () => {
                    await driver.wait(until.elementLocated(By.css('.shape-file-container #mapIt')), shapeFileWait);
                    await UofC.waitForPageLoad();
                });
            }

            if (publicLandsActOwnershipReviewValue !== null) {
                it('set publicLandsActOwnershipReview value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="publicLandsActOwnershipReview"]', publicLandsActOwnershipReviewValue);
                });

                if (publicLandsActOwnershipReviewValue === 'Y') {
                    if (ownershipDecisionFilePath !== null) {
                        it('attach ownershipDecision file', async () => {
                            await UofC.setFileUploadByCSS('#ownershipDecision input[type="file"]', ownershipDecisionFilePath);
                        });
                    }
                }
            }

            if (goaSubmissionValue !== null) {
                it('set goaSubmission value', async () => {
                    await UofC.setButtonRadioFieldValueByCSS('*[name="goaSubmission"]', goaSubmissionValue);
                });

                if (goaSubmissionValue === 'Y') {
                    if (abwretaResultsFilePath !== null) {
                        it('attach abwretaResults file', async () => {
                            await UofC.setFileUploadByCSS('#abwretaResults input[type="file"]', abwretaResultsFilePath);
                        });
                    }
                }
            }

            if (fieldAssessmentDateValue !== null) {
                it('set fieldAssessmentDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="fieldAssessmentDate"]', fieldAssessmentDateValue);
                });
            }

            if (fieldAssessmentUploadFilePath !== null) {
                it('attach fieldAssessmentUpload file', async () => {
                    await UofC.setFileUploadByCSS('#fieldAssessmentUpload input[type="file"]',
                        fieldAssessmentUploadFilePath);
                });
            }

            if (authenticatingProfessionalsArray !== null && authenticatingProfessionalsArray.length > 0) {
                const addAuthenticatingWAIRProfessional = (professional, index) => {
                    it('add new authenticating professional row', async () => {
                        await UofC.clickElementByCSS('.btn-add-wair-professional');
                        await driver.sleep(100);
                    });

                    it('set professional name', async () => {
                        await UofC.setBackGridText('#wairProfessionalGrid td.professionalName',
                            index, professional.name);
                    });

                    it('set professional employer', async () => {
                        await UofC.setBackGridText('#wairProfessionalGrid td.professionalEmployer',
                            index, professional.employer);
                    });

                    it('set professional designation', async () => {
                        await UofC.setBackGridSelectText('#wairProfessionalGrid td.select-cell',
                            index, professional.designation);
                    });
                };

                for (let i = 0; i < authenticatingProfessionalsArray.length; i++) {
                    addAuthenticatingWAIRProfessional(authenticatingProfessionalsArray[i], i);
                }
            }

            if (wairTemplateCsvFilePath !== null) {
                it('attach wair template csv file', async () => {
                    await UofC.setFileUploadByCSS('#fileInputsWAIR', wairTemplateCsvFilePath);
                });
            }

            if (wair_inlieu_fee_payBoolean) {
                it('set wair_inlieu_fee_pay value', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="wair_inlieu_fee_pay"]');
                });
            }

            if (wair_resp_replBoolean) {
                it('set wair_resp_repl value', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="wair_resp_repl"]');
                });
            }

            if (wair_wetland_reclaimBoolean) {
                it('set wair_wetland_reclaim value', async () => {
                    await UofC.setButtonCheckboxByCSS('*[name="wair_wetland_reclaim"]');
                });
            }

            if (waifMinimizeAndReclaimValue !== null) {
                it('set waifMinimizeAndReclaim value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="wairMinimizeAndReclaim"]',
                        waifMinimizeAndReclaimValue);
                });
            }

            if (wairInLieuFeeFilePath !== null) {
                it('attach wairInLieuFee file', async () => {
                    await UofC.setFileUploadByCSS('#wairInLieuFee input[type="file"]',
                        wairInLieuFeeFilePath);
                });
            }

            if (wairPermitteeResponsibleFilePath !== null) {
                it('attach wairPermitteeResponsible file', async () => {
                    await UofC.setFileUploadByCSS('#wairPermitteeResponsible input[type="file"]',
                        wairPermitteeResponsibleFilePath);
                });
            }

            if (wairWetlandReclamationFilePath !== null) {
                it('attach wairWetlandReclamation file', async () => {
                    await UofC.setFileUploadByCSS('#wairWetlandReclamation input[type="file"]',
                        wairWetlandReclamationFilePath);
                });
            }

            if (wetlandReplacementGridArray !== null && wetlandReplacementGridArray.length > 0) {
                const addWetlandWAIRReplacementEntry = (entry, index) => {
                    it('set RWVAU value (' + index + '): ' + entry.RWVAU, async () => {
                        await UofC.setBackGridSelectText('#wetlandReplacementGrid td.select-cell.editable',
                            index, entry.RWVAU);
                    });

                    it('set replacementArea value (' + index + '): ' + entry.replacementArea, async () => {
                        await UofC.setBackGridText('#wetlandReplacementGrid td.replacementArea',
                            index, entry.replacementArea);
                    });

                    it('set replacementRate value (' + index + '): ' + entry.replacementRate, async () => {
                        await UofC.setBackGridText('#wetlandReplacementGrid td.replacementRate',
                            index, entry.replacementRate);
                    });

                    it('set replacementCost value (' + index + '): ' + entry.replacementCost, async () => {
                        await UofC.setBackGridText('#wetlandReplacementGrid td.replacementCost',
                            index, entry.replacementCost);
                    });
                };

                for (let  j = 0; j < wetlandReplacementGridArray.length; j++) {
                    addWetlandWAIRReplacementEntry(wetlandReplacementGridArray[j], j);
                }
            }

            if (constructionEndDateValue !== null) {
                it('set constructionEndDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="constructionEndDate"]', constructionEndDateValue);
                });
            }

            if (reclamationStartDateValue !== null) {
                it('set reclamationStartDate value', async () => {
                    await UofC.setTextFieldValueByCSS('*[name="reclamationStartDate"]', reclamationStartDateValue);
                });
            }

            if (monthsAffectedArray !== null) {
                it('set months affected', async () => {
                    for (let  i = 0; i < monthsAffectedArray.length; i++) {
                        await UofC.setButtonCheckboxByCSS('*[name="' + monthsAffectedArray[i].toLowerCase() + '"]');
                    }
                });
            }

            UofC.clickSave();
        });
    };

    return UofC;
})();

module.exports = UofC;