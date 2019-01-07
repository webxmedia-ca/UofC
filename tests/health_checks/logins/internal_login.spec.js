/**
 * Created by cb5rp on 5/26/2017.
 */

// The following 2 lines prevent jshint from complaining about some assertion calls
/* jshint -W024 */
/* jshint expr:true */

var expect = require('chai').expect,
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver');

//Load the chromedriver
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

var By = webdriver.By;
var until = webdriver.until;

function verifyUserName(driver, username, done){
    // login user
    driver.findElement(By.css('button.btn.btn-default.btn-login'))
        .click();

    driver.wait(until.elementLocated(By.css('button.btn.btn-success.agree')), 5000);

    driver.findElement(By.css('button.btn.btn-success.agree')).then(function(element) {
        driver.wait(until.elementIsVisible(element), 1000);
        element.click();

        driver.wait(until.elementLocated(By.css('.navbar-right label')), 5000);

        // verify proper username is displayed
        driver.findElement(By.css('.navbar-right label')).then(function(element) {
            driver.wait(until.elementIsVisible(element), 1000);
            element.getText().then(function(text){
                expect(text.indexOf(username) >= 0).to.be.true;

                // small pause for screen redraw
                driver.sleep(1000);
                done();
            });
        });
    });
}

test.describe('Internal Login', function() {
    var driver;

    test.beforeEach(function(){
        driver = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();
        driver.manage().deleteAllCookies();
    });

    test.afterEach(function(){
        driver.quit();
    });

    test.it('proper login for Readonly user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLRO');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline ReadOnly', done);
    });

    test.it('proper login for All Roles user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLSU');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline SuperUser', done);
    });

    test.it('proper login for Pipeline-Auditor user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLAU');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline Auditor', done);
    });

    test.it('proper login for Pipeline-Business Administrator user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLBA');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline BusinessAdministrator', done);
    });

    test.it('proper login for Pipeline-Coordinator user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLCO');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline Coordinator', done);
    });

    test.it('proper login for Pipeline-Decision Maker user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLDM');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline DecisionMaker', done);
    });

    test.it('proper login for Pipeline-Lead Reviewer user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLLR');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline LeadReviewer', done);
    });

    test.it('proper login for Pipeline-Reviewer user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLPR');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline Reviewer', done);
    });

    test.it('proper login for Pipeline-Readonly user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('CBPLRO');
        driver.findElement(By.name('password'))
            .sendKeys('Nala@2017');

        verifyUserName(driver, 'Pipeline ReadOnly', done);
    });
});
