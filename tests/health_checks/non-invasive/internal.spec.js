/**
 * Created by cb5rp on 5/26/2017.
 */

// The following 2 lines prevent jshint from complaining about some assertion calls
/* jshint -W024 */
/* jshint expr:true */

const waitShort = 2000;
const waitLong = 10000;
const harness = require('../../../lib/harness');
const UofC = require('../../../lib/UofCApp-internal');
const roles = [
    'auditor',
    'business-administrator',
    'coordinator',
    'decision-maker',
    'lead-reviewer',
    'reviewer',
    'assessment-business-administrator',
    'assessment-coordinator',
    'assessment-lead-reviewer'
];

describe(harness.getCommandLineArgs().appType + ':' + harness.getCommandLineArgs().appSubType +
    ' - (' + harness.getCommandLineArgs().username + ' - ' + harness.getCommandLineArgs().env + ')', function () {
    let harnessObj, driver, expect, By, until, configJson;

    before(async () => {
        harnessObj = await harness.init();

        driver = harnessObj.driver;
        expect = harnessObj.expect;
        By = harnessObj.By;
        until = harnessObj.until;
        configJson = harnessObj.configJson;

        await UofC.init(harnessObj, waitShort, waitLong);
        await UofC.login();
    });

    after(async () => {
        await harnessObj.quit();
    });

    afterEach(async () => {
        await UofC.afterEachTest(this.ctx.currentTest);
    });

    describe('non-invasive checks', () => {
        it('logs in successfully', () => {
        });

        it('map search link works', async () => {
            await UofC.clickElementByCSS('a[data-event="show:geocortex:map"]');

            await driver.sleep(waitShort);

            const handles = await driver.getAllWindowHandles();
            await driver.switchTo().window(handles[1]);
            const currentUrl = await driver.getCurrentUrl();
            const expectedUrl = configJson.gisBaseInternalUrl + '/UofC/Pipelines/internal/index.html';
            expect(currentUrl).to.equal(expectedUrl);
            await driver.close();
            await driver.switchTo().window(handles[0]);
        });

        describe('role based tests', () => {
            for (let role of roles){
                describe(role + ' role', () => {
                    before(async () => {
                        await driver.get(harnessObj.baseUrl + '/#workspace/' + role);
                        await UofC.waitForPageLoad();
                    });

                    it('loads dashboard', async () => {
                        await UofC.waitForPageLoad();
                        const elements = await driver.findElements(By.css('#recentActivityHeading'));
                        expect(elements.length).to.equal(1);
                    });

                    it('performs a search', async () => {
                        await driver.get(harnessObj.baseUrl + '/#workspace/search');
                        await UofC.waitForPageLoad();

                        await UofC.setSelectFieldValueByCSS('*[name="applicationStatus"]', 'Approved');
                        await UofC.clickElementByCSS('.btn-search');

                        await UofC.waitForPageLoad();

                        const elements = await driver.findElements(By.css('.search-grid .string-cell'));
                        expect(elements.length >= 0).to.be.true;
                    });
                });
            }
        });
    });
});