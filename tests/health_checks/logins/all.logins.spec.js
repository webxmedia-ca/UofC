/**
 * Created by cb5rp on 5/26/2017.
 */

// The following 2 lines prevent jshint from complaining about some assertion calls
/* jshint -W024 */
/* jshint expr:true */

var waitShort = 3000;
var waitLong = 5000;

var env = require('../../../lib/harness');
var envObj = env.init(waitShort, waitLong);

var UofC = envObj.UofC;
var test = envObj.test;
var configJson = envObj.configJson;
var driver = envObj.driver;
var expect = envObj.expect;
var By = envObj.By;
var until = envObj.until;

function testLogin(username, password, url) {
    test.it('user: ' + username + ' - env: ' + url, function (done) {
        driver.get(url + '/');

        driver.findElement(By.name('username')).sendKeys(username);
        driver.findElement(By.name('password')).sendKeys(password);

        // login user
        driver.findElement(By.css('.btn-login')).click();
        driver.sleep(waitShort);

        // wait for the disclaimer to appear
        driver.wait(until.elementLocated(By.css('.agree')), waitLong);
        driver.findElement(By.css('.agree')).then(function (element) {
            driver.wait(until.elementIsVisible(element), waitShort);
            element.click();

            // wait for the navbar to redraw
            driver.wait(until.elementLocated(By.css('.header-user-info label')), waitLong);
            // store display name
            driver.findElement(By.css('.header-user-info label')).then(function (element) {
                driver.wait(until.elementIsVisible(element), waitShort);
                element.getText().then(function (text) {
                    var displayName = text.slice(9, text.indexOf('!'));
                    // expect(displayName).to.equal(username);
                    done();
                });
            });
        });
    });
}

test.describe('UofC', function () {
    test.after(function () {
        env.quit();
    });

    test.afterEach(function(){
        driver.manage().deleteAllCookies();
        driver.sleep(waitShort);
    });

    test.describe('all logins - all environments', function () {
        var arrEnvUrls = [
            'https://dcmtst.aer.ca/UofC',        // tst
            'https://UofCuat.aer.ca/UofC',    // uat
            // 'https://UofC.aer.ca/UofC'        // prd
        ];
        var arrSectors = [
            'mi',   // mining
            'is',   // in-situ
            'og',   // oil & gas
            'pl',   // pipelines
            'em'    // emissions
        ];
        var arrRoles = [
            'lr',   // lead reviewer
            'co',   // coordinator
            // 'ro',   // read only
            'su',   // super user
            'dm',   // decision maker
            're',   // reviewer
            'ba',   // business administrator
            'au'    // auditor
        ];

        for (var x = 0; x < arrEnvUrls.length; x++) {
            for (var y = 0; y < arrSectors.length; y++) {
                for (var z = 0; z < arrRoles.length; z++) {
                    var username = 'cb' + arrSectors[y] + arrRoles[z];
                    var password = 'Nala@2017';
                    var url = arrEnvUrls[x];

                    testLogin(username, password, url);
                }
            }
        }
    });
});