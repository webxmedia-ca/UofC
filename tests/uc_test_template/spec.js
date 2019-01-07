/**
 * Created by valeriu.jecov on 10/18/2018.
 */
 
const waitShort = 2000;
const waitLong = 5000;
const harness = require('../../../lib/harness');
const UcLaw = require('../../../lib/UofC-base');
const expect = require('chai').expect;

describe(harness.getCommandLineArgs().appType + ':' + harness.getCommandLineArgs().appSubType +
    ' - (' + harness.getCommandLineArgs().username + ' - ' + harness.getCommandLineArgs().env + ')', function () {
    let harnessObj = null;

    before(async () => {
        harnessObj = await harness.init();
        await UcLaw.init(harnessObj, waitShort, waitLong);
        await UcLaw.login();
    });

    after(async () => {
        await harnessObj.quit();
    });

    afterEach(async () => {
        await UcLaw.afterEachTest(this.ctx.currentTest);
	    await UcLaw.afterEachTest(this.ctx.currentTest.title);
	    await UcLaw.afterEachTest(this.ctx.currentTest.state);
    });

	describe('Basic Mocha String Test', function () {
		it('assert Hello.length = 5', function () {
			expect("Hello".length).to.equal(5);
		});
		it('assert char 0 = H', function () {
			expect("Hello".charAt(0)).to.equal('H');
		});
	});
});