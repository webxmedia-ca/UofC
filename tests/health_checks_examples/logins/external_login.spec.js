/**
 * Created by valeriu.jecov on 5/26/2017.
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

    // wait for the disclaimer to appear
    driver.wait(until.elementLocated(By.css('button.btn.btn-success.agree')), 5000);
    driver.findElement(By.css('button.btn.btn-success.agree')).then(function(element) {
        driver.wait(until.elementIsVisible(element), 1000);
        element.click();

        // wait for the navbar to redraw
        driver.wait(until.elementLocated(By.css('.navbar-right label')), 5000);

        // verify proper username is displayed
        driver.findElement(By.css('.navbar-right label')).then(function(element) {
            driver.wait(until.elementIsVisible(element), 1000);
            element.getText().then(function(text){
                expect(text.indexOf(username) >= 0).to.be.true;
                done();
            });
        });
    });
}

test.describe('External Login', function() {
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

    test.it('proper login for Operator (CMSA) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0FJ5Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0FJ5Admin', done);
    });

    test.it('proper login for PL Submit (Operator) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0FJ5PLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0FJ5PLSubmit', done);
    });

    test.it('proper login for PL Save (Operator) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0FJ5PLSave');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0FJ5PLSave', done);
    });

    test.it('proper login for PL Search (Operator) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0FJ5PLSearch');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0FJ5PLSearch', done);
    });

    test.it('proper login for Consultant (CMSA) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A50WAdmin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A50wAdmin', done);
    });

    test.it('proper login for PL Submit (Consultant) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A50wPLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A50wPLSubmit', done);
    });

    test.it('proper login for PL Save (Consultant) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A50wPLSave');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A50wPLSave', done);
    });

    test.it('proper login for PL Search (Consultant) user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A50wPLSearch');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A50wPLSearch', done);
    });

    test.it('proper login for 0WH6 Admin for Polaris user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0WH6Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0WH6Admin', done);
    });

    test.it('proper login for A0BL Admin for Onstream user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A0BLAdmin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A0BLAdmin', done);
    });

    test.it('proper login for A25R Admin for Acero user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A25RAdmin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A25RAdmin', done);
    });

    test.it('proper login for 0G93 Admin for Sigma 3 user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0G93Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0G93Admin', done);
    });

    test.it('proper login for Operator (CMSA) - Shell user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0T03Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0T03Admin', done);
    });

    test.it('proper login for PL Submit (Operator) - Shell user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0T03PLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0T03PLSubmit', done);
    });

    test.it('proper login for Operator (CMSA) - Suncor user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0054Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2016');

        verifyUserName(driver, '0054Admin', done);
    });

    test.it('proper login for PL Submit (Operator) - Suncor user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0054PLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0054PLSubmit', done);
    });

    test.it('proper login for Operator (CMSA) - CNRL user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0HE9Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2016');

        verifyUserName(driver, '0HE9Admin', done);
    });

    test.it('proper login for PL Submit (Operator) - CNRL user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0HE9PLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0HE9PLSubmit', done);
    });

    test.it('proper login for Operator (CMSA) - Cenovus user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A5D4Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2016');

        verifyUserName(driver, 'A5D4Admin', done);
    });

    test.it('proper login for PL Submit (Operator) - Cenovus user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A5D4PLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A5D4PLSubmit', done);
    });

    test.it('proper login for Operator (CMSA) - Enbridge user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0WH2Admin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2016');

        verifyUserName(driver, '0WH2Admin', done);
    });

    test.it('proper login for PL Submit (Operator) - Enbridge user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('0WH2PLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, '0WH2PLSubmit', done);
    });

    test.it('proper login for Operator (CMSA) - Plains MidStream user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A31GAdmin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2016');

        verifyUserName(driver, 'A31GAdmin', done);
    });

    test.it('proper login for PL Submit (Operator) - Plains MidStream user', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('A31GPLSubmit');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        verifyUserName(driver, 'A31GPLSubmit', done);
    });
});
