/**
 * Created by valeriu.jecov on 10/18/2018.
 */

/* jshint -W024 */
/* jshint -W014 */
/* jshint laxcomma:true */
/* jshint expr:true */

const expect = require('chai').expect;

const UofC = (() => {
	
	const UofC = require('./UofCApp-base');
	
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
		, env;
	
	UofC.initExternal = (harnessObjIn, waitShortIn, waitLongIn) => {
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
	};
	
	UofC.someFunction = (someParameter) => {
		describe('suite description', () => {
			before(async () => {
				//before actions
			});
			
			after(async () => {
				//after actions
			});
			
			it('test case / unit test 1', async () => {
				//some actions
			});
			
			it('test case / unit test 2', async () => {
				//some actions
			});
			
			if (someParameter && someParameter !== null) {
				it('test case / unit test 1', async () => {
					//some actions
				});
			}
		});
	};
	
	return UofC;
})();

module.exports = UofC;
