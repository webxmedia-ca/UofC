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

describe(harness.getCommandLineArgs().appType + ':' + harness.getCommandLineArgs().appSubType +
    ' - (' + harness.getCommandLineArgs().username + ' - ' + harness.getCommandLineArgs().env + ')', function () {
    let harnessObj, driver, expect, By, until;

    before(async () => {
        harnessObj = await harness.init();

        driver = harnessObj.driver;
        expect = harnessObj.expect;
        By = harnessObj.By;
        until = harnessObj.until;
        
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

        it('perform a search', async () => {
            await driver.sleep(waitShort);
            await UofC.clickElementByCSS('a[data-event="show:workspace:search"]');
            await UofC.waitForPageLoad(function(){});

            await UofC.setSelectFieldValueByCSS('*[name="applicationIndustryStatusName"]', 'Approved');
            await UofC.clickElementByCSS('.application-search');

            await UofC.waitForPageLoad();

            await driver.findElements(By.css('.results-grid .string-cell'));
        });

        it('open a new application', async () => {
            await driver.get(harnessObj.baseUrl + '/#application');

            await UofC.waitForPageLoad();

            await driver.wait(until.elementLocated(By.css('#contactInformationPanelHeading')), waitLong);
            await driver.findElement(By.css('#contactInformationPanelHeading'));
        });

        it('open map search', async () => {
            await driver.get(harnessObj.baseUrl + '/#pipeline/geocortex');

            await UofC.waitForPageLoad();

            await driver.wait(until.elementLocated(By.css('.geocortex')), waitLong);
            await driver.findElement(By.css('.geocortex'));
        });
    });
});