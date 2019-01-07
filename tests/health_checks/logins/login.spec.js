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

test.describe('Login', function() {
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

    test.it('should display login failure message with incorrect credentials', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('xxx');
        driver.findElement(By.name('password'))
            .sendKeys('xxx');

        driver.findElement(By.css('button.btn.btn-default.btn-login'))
            .click();

        driver.wait(until.elementLocated(By.css('div.login-error-message')), 5000);
        driver.findElement(By.css('div.login-error-message')).then(function(element) {
            expect(element).to.exist;
            done();
            return true;
        });
    });

    test.it('should display agreement disclaimer with correct credentials', function(done) {
        driver.get('https://UofCuat.aer.ca/UofC/');

        driver.findElement(By.name('username'))
            .sendKeys('a50wadmin');
        driver.findElement(By.name('password'))
            .sendKeys('Nala2017');

        driver.findElement(By.css('button.btn.btn-default.btn-login'))
            .click();

        driver.wait(until.elementLocated(By.css('div.modal')), 5000);

        driver.findElement(By.css('h4.modal-title')).then(function(element) {
            expect(element).to.exist;
            done();
        });
    });
});
