/**
 * Created by cb5rp on 4/17/2018.
 */

/* jshint -W024 */
/* jshint expr:true */
/* jshint laxcomma:true */
var deferred = require('deferred');
var moment = require('moment');

var Grid = (function () {
	var waitShort = 7;
	var waitLong = 2000;

	function Grid(cssSelector, harness) {
		var _self = this
			, _dfd = null         //Used to store a deferred promise in recursive function calls
			, _dfdReturned = null //Used in recursive promise calls to ensure promise only happen once
			, _dfd_loadGridPages = null
			, _dfd_loadGridPagesReturned = null //Used in recursive promise calls to ensure promise only happen once
			, _dfd_loadGridPageCells = null
			, _dfd_loadGridPageCellsReturned = null //Used in recursive promise calls to ensure promise only happen once
			, _dfd_doSort = null
			, _dfd_doSortReturned = null //Used in recursive promise calls to ensure promise only happen once
			, _dfd_pgNavigate = null
			, _dfd_pgNavigateReturned = null
			, _harness = null
			, _driver = harness.driver
			, _until = harness.until
			, _By = harness.By
			, _log = false // turn logging on or off (bool)
			, _cssSelector = cssSelector
			, _pgBaseCss = _cssSelector + ' .paginator .pagination'
			, _btnFirstCss = _pgBaseCss + ' a[title="First"]'
			, _btnLastCss = _pgBaseCss + ' a[title="Last"]'
			, _btnNextCss = _pgBaseCss + ' a[title="Next"]'
			, _btnPrevCss = _pgBaseCss + ' a[title="Previous"]'
			, _btnPageCss = _pgBaseCss + ' a[title="Page %%"]'
			, _pgActiveCss = _pgBaseCss + ' .active'
			, _rowCount = null
			, _activeRow = null
			, _colCount = null
			, _activeCol = null
			, _colHdrs = []
			, _gridData = []
			, _onLastPage = false
			, _onFirstPage = false;

		// _dfd - get/set
		_self._getDFD = function () {
			return _dfd;
		};
		_self._setDFD = function (dfd) {
			_dfd = dfd;
		};

		// _pgNavigating - get/set
		_self._getPGNavigating = function () {
			return _pgNavigating;
		};
		_self._setPGNavigating = function (pg) {
			_pgNavigating = parseInt(pg);
		};

		// _waitShort - get/set
		_self._getWaitShort = function () {
			return _waitShort;
		};
		_self._setWaitShort = function (millis) {
			_waitShort = millis;
		};

		// _cssSelector - get/set
		_self._getCssSelector = function () {
			return _cssSelector;
		};
		_self._setCssSelector = function (cssSelector) {
			_cssSelector = cssSelector;
		};

		// _harness - get/set
		_self._getHarness = function () {
			return _harness;
		};
		_self._setHarness = function (harness) {
			_harness = harness;
		};

		// _driver - get/set
		_self._getDriver = function () {
			return _driver;
		};
		_self._setDriver = function (driver) {
			_driver = driver;
		};

		// _until - get/set
		_self._getUntil = function () {
			return _until;
		};
		_self._setUntil = function (until) {
			_until = until;
		};

		// _By - get/set
		_self._getBy = function () {
			return _By;
		};
		_self._setBy = function (By) {
			_By = By;
		};

		// _PgBaseCss - get
		_self._getPgBaseCss = function () {
			return _pgBaseCss;
		};

		// _btnFirstCss - get
		_self._getBtnFirstCss = function () {
			return _btnFirstCss;
		};

		// _btnLastCss - get
		_self._getBtnLastCss = function () {
			return _btnLastCss;
		};

		// _btnNextCss - get
		_self._getBtnNextCss = function () {
			return _btnNextCss;
		};

		// _btnPreviousCss - get
		_self._getBtnPreviousCss = function () {
			return _btnPrevCss;
		};

		// _btnPageCss - get
		_self._getBtnPageCss = function () {
			return _btnPageCss;
		};

		// _pgActiveCss - get
		_self._getPgActiveCss = function () {
			return _pgActiveCss;
		};

		// _driver - get
		_self._getDriver = function () {
			return _driver;
		};

		// _until - get
		_self._getUntil = function () {
			return _until;
		};

		// _By - get
		_self._getBy = function () {
			return _By;
		};

		// _isOnLastPage - get/set
		_self._getIsOnLastPage = function () {
			return _onLastPage;
		};
		_self._setIsOnLastPage = function(bool){
			_onLastPage = bool;
		};

		// _isOnFirstPage - get/set
		_self._getIsOnFirstPage = function () {
			return _onFirstPage;
		};
		_self._setIsOnFirstPage = function(bool){
			_onFirstPage = bool;
		};

		// _colHdrs - get/set
		_self._getColHdrs = function () {
			return _colHdrs;
		};
		_self._setColHdrs = function (colHdrs) {
			_colHdrs = colHdrs;
		};

		// _rowCount - get/set
		_self._getRowCount = function () {
			return _rowCount;
		};
		_self._setRowCount = function (rowCount) {
			_rowCount = parseInt(rowCount);
		};

		// _colCount - get/set
		_self._getColCount = function () {
			return _colCount;
		};
		_self._setColCount = function (colCount) {
			_colCount = parseInt(colCount);
		};

		// _activeRow - get/set
		_self._getActiveRow = function () {
			return _activeRow;
		};
		_self._setActiveRow = function (activeRow) {
			_activeRow = parseInt(activeRow);
		};

		// _activeCol - get/set
		_self._getActiveCol = function () {
			return _activeCol;
		};
		_self._setActiveCol = function (activeCol) {
			_activeCol = parseInt(activeCol);
		};

		// _GridData - get/set
		_self._getGridData = function () {
			return _gridData;
		};
		_self._setGridData = function (data) {
			_gridData = data;
		};

		_self._toggleLogging = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function inverts the console logging option for debugging grid interactions.

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._toggleLogging();
			----------------------------------------------------------------------------------------------------------*/
			_log = !_log;
		};


		_self._waitForElement = function (elementsCss, waitUntilVisibleBool, waitUntilEnabledBool) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS A PROMISE of the GRID tbody load completion and ready for interaction

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._waitForElement(_self._getPgBaseCss() + ' li');
			----------------------------------------------------------------------------------------------------------*/
			var dfd_waitForElement = new deferred();
			var waitVis = false, waitEnabled = false;
			if (waitUntilVisibleBool !== undefined) waitVis = waitUntilVisibleBool;
			if (waitUntilEnabledBool !== undefined) waitEnabled = waitUntilEnabledBool;

			if (_log) console.log('_waitForElement:  (enter).. [waitVis:' + waitVis + ' waitEnabled:' + waitEnabled + '] (' + elementsCss + ')');
			_self._getDriver().wait(_self._getUntil().elementLocated(_self._getBy().css(elementsCss)), waitLong);
			_self._getDriver().findElement(_self._getBy().css(elementsCss)).then(function (element) {
				if (waitVis) _self._getDriver().wait(_self._getUntil().elementIsVisible(element), waitLong);
				if (waitEnabled) _self._getDriver().wait(_self._getUntil().elementIsEnabled(element), waitLong);
				if (_log) console.log('_waitForElement  ..(exit)');
				dfd_waitForElement.resolve(element);
			});

			return dfd_waitForElement.promise();
		};

		_self._clickElement = function (elementCss) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function will click the passed elementCss

			ACCEPTED PARAMETER(S) AND VALUES:
			elementCss:   *[type="checkbox"]   - the css identifier for the checkbox objects - not necessarily unique

			USAGE:  _self._clickElement
			----------------------------------------------------------------------------------------------------------*/
			var dfd_clickElement = new deferred();

			if (_log) console.log('_clickElement:  (enter).. :' + elementCss);
			_self._waitForElement(elementCss, true, true).then(function (element) {
				element.click().then(function () {
					if (_log) console.log('_clickElement  ..(exit)');
					dfd_clickElement.resolve();
				});
			});

			return dfd_clickElement.promise();
		};

		_self._getElementsByCss = function (elementCss) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function will look for multiple objects having the same css locator by given CSS
							Locator then it will return these objects or time out if the elements are not found

			ACCEPTED PARAMETER(S) AND VALUES:
			elementCss:   *[type="checkbox"]   - the css identifier for the checkbox objects - not necessarily unique

			USAGE:  _self._getElementsByCss('*[type="checkbox"]');
			----------------------------------------------------------------------------------------------------------*/
			_self._getDriver().wait(_self._getUntil().elementLocated(_self._getBy().css(elementCss)), waitLong);

			return _self._getDriver().findElements(_self._getBy().css(elementCss));
		};

		// =====================
		// Pagination functions
		// =====================

		_self._clickPgrBtn = function (btnCss, iter) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function clicks a pagination btn via passed css then resets required properties for
							the grid page once resolved

			ACCEPTED PARAMETER(S) AND VALUES:
			btnCss:     String
			optTimes:   Number = iterations of clicks

			USAGE:  _self._clickPgrBtn(_btnFirstCss); OR _self._clickPgrBtn(_btnFirstCss, 2);
			----------------------------------------------------------------------------------------------------------*/
			var dfd_clickPgrBtn = new deferred();
			if (_log) console.log('_clickPgrBtn  (enter).. :' + btnCss + '(x' + iter + ')');

			_self._getActivePage().then(function () {
				_self._waitForElement(_self._getPgBaseCss()).then(function () {
					for (var i = 0; i < iter; i++) {
                        i = clickPageButtonEach(i, btnCss, iter);
					}
					
					_self._getActivePage().then(function (pg) {
						if (_log) console.log('_clickPgrBtn  ..(exit)');
						dfd_clickPgrBtn.resolve(pg);
					});
				});
			});

			return dfd_clickPgrBtn.promise();
		};

 		function clickPageButtonEach(i, btnCss, iter){
            if (_self._getIsOnFirstPage() && (btnCss === _btnPrevCss || btnCss === _btnFirstCss)) {
                if (_log) console.log('_clickPgrBtn  ..(exit)  Already on FIRST Page');
                i = iter;
            }
            else if (_self._getIsOnLastPage() && (btnCss === _btnNextCss || btnCss === _btnLastCss)) {
                if (_log) console.log('_clickPgrBtn  ..(exit)  Already on LAST Page');
                i = iter;
            }
            else {
                _self._clickElement(btnCss).then(function () {
                    _self._waitForElement(_self._getCssSelector() + ' tbody td:last-child', true, true);
                    _self._getActivePage();
                });
            }
            
            return i;
		}

		_self._pgFirst_Click = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of call to _clickPgrBtn with the defined button css.
			NO PARAMETERS
			USAGE:  _self._pgFirst_Click();
			----------------------------------------------------------------------------------------------------------*/
			return _self._clickPgrBtn(_btnFirstCss, 1);
		};


		_self._pgNext_Click = function (optIterations) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of call to _clickPgrBtn with the defined button css.
			PARAMETERS:     number of iterations
			USAGE:  _self._pgNext_Click(1);
			----------------------------------------------------------------------------------------------------------*/
			if (_log) console.log('clickNext(' + optIterations + ')');
			if (typeof optIterations === 'undefined') {
				if (_log) console.log('optIterations is undefined: Setting to 1');
				optIterations = 1;
			}
			else if (optIterations === null || isNaN(optIterations)) {
				if (_log) console.log('ERR: optIterations is ' + optIterations);
				throw('ERR: optIterations is ' + optIterations);
			}

			return _self._clickPgrBtn(_btnNextCss, optIterations);
		};


		_self._pgPrev_Click = function (optIterations) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of call to _clickPgrBtn with the defined button css.
			PARAMETERS:     number of iterations
			USAGE:  _self._pgPrev_Click(1);
			----------------------------------------------------------------------------------------------------------*/
			if (_log) console.log('clickPrev(' + optIterations + ')');
			if (typeof optIterations === 'undefined') {
				if (_log) console.log('optIterations is undefined: setting to 1');
				optIterations = 1;
			}
			else if (optIterations === null || isNaN(optIterations)) {
				if (_log) console.log('ERR: optIterations is ' + optIterations);
				throw('ERR: optIterations is ' + optIterations);
			}

			return _self._clickPgrBtn(_btnPrevCss, optIterations);
		};


		_self._pgLast_Click = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of call to _clickPgrBtn with the defined button css.
			NO PARAMETERS
			USAGE:  _self._pgLast_Click();
			----------------------------------------------------------------------------------------------------------*/
			return _self._clickPgrBtn(_btnLastCss, 1);
		};


		_self._pgNavigate = function (pgNum) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    RECURSIVE _self function RETURNS a PROMISE of completion (called from _self._pgPage_Click()).
							WARNING: NOT TO BE CALLED DIRECTLY. If you must you need to manage Promise similarily to _self._pgPage_Click.
			PARAMETERS: pgNum
			USAGE:  _self._pgNavigate(14);
			----------------------------------------------------------------------------------------------------------*/
			if (_log) console.log('_pgNavigate (recursive)  ( (re)enter ) ..: Targeting Page: ' + pgNum);

			_self._getActivePage().then(function (ActivePage) {
				if (ActivePage === parseInt(pgNum)) {
					if (_log) console.log('_pgNavigate   ..(exit).  Navigated to page ' + ActivePage);
					_dfd_pgNavigateReturned = false;
					_dfd_pgNavigate.resolve(ActivePage);
				}
				else {
					_self._getListedPages().then(function (pages) {
						var pageCss, minPG = pages[0], maxPG = pages[pages.length-1];

						if (_self._getIsOnLastPage() && maxPG < pgNum) {
							if (_log) console.log('_self._getIsOnLastPage() && maxPG < pgNum');
							var msg = '_pgNavigate: ## ERROR: Page (' + pageNum + ') is invalid as it is > LastPage !!';
							console.log(msg);
							_dfd_pgNavigateReturned = false;
							_dfd_pgNavigate.resolve(msg);
						}
						else if (!pages.includes(pgNum) && maxPG < pgNum) {
							if (_log) console.log('!pages.includes(pgNum) && maxPG < pgNum');
							pageCss = _self._getBtnPageCss().replace('%%', maxPG);
							if (_log) console.log('_pgNavigate  ...to lastpage(+1) in listing & re-try... ');
							_self._clickPgrBtn(pageCss, 1).then(function () {
								_self._pgNavigate(pgNum);
							});
						}
						else if (!pages.includes(pgNum) && minPG > pgNum) {
							if (_log) console.log('!pages.includes(pgNum) && minPG > pgNum');
							pageCss = _self._getBtnPageCss().replace('%%', minPG);
							if (_log) console.log('_pgNavigate  ...to firstpage(-1) in listing & re-try... ');
							_self._clickPgrBtn(pageCss, 1).then(function () {
								_self._pgPrev_Click().then(function () {
									_self._pgNavigate(pgNum);
								});
							});
						}
						else if (pages.includes(pgNum)){
							if (_log) console.log('pages.includes(pgNum)');
							pageCss = _self._getBtnPageCss().replace('%%', pgNum);
							if (_log) console.log('_pgNavigate  ...located... Clicking ' + pageCss);
							_self._clickPgrBtn(pageCss, 1).then(function () {
								_self._pgNavigate(pgNum);
							});
						}
					});
				}
			});

			if (! _dfd_pgNavigateReturned) {
				_dfd_pgNavigateReturned = true;
				return _dfd_pgNavigate.promise();
			}
		};


		_self._pgPage_Click = function (pageNum) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of either clicking on OR navigating to the page NUMBER requested

			ACCEPTED PARAMETER(S) AND VALUES:
			Page Number:   Number

			USAGE:  _self._pgPage_Click(14);
			----------------------------------------------------------------------------------------------------------*/
			var dfd_pgPage_Click = new deferred();
			var pgNo = parseInt(pageNum);

			if (_log) console.log('[#] pgPage_Click: ' + pgNo + '  (enter)..');
			_self._getActivePage().then(function () {
				_self._getListedPages().then(function (listedPages) {
					if (pgNo === 1) {
						if (_log) console.log('pageNum === 1');
						_self._clickPgrBtn(_btnFirstCss, 1).then(function (value) {
							if (_log) console.log('[#] pgPage_Click  ..(exit): _btnFirstCss clicked');
							dfd_pgPage_Click.resolve(value);
						});
					}
					else if (listedPages.includes(pgNo)) {
						if (_log) console.log('Page ' + pgNo + ' is in listed pages. Clicking...');
						var pageCss = _self._getBtnPageCss().replace('%%', pgNo);
						_self._clickPgrBtn(pageCss, 1).then(function (value) {
							if (_log) console.log('[#] pgPage_Click  ..(exit): ' + pageCss + ' clicked.');
							dfd_pgPage_Click.resolve(value);
						});
					}
					else if (!listedPages.includes(pgNo)) {
						if (_log) console.log('[#] pgPage_Click: Page ' + pgNo + ' NOT in listed pages. Navigating..');
						//Defining deferred promise within calling recursive function _pgNavigate.
						_dfd_pgNavigate = new deferred();
						_self._pgNavigate(pgNo).then(function (resolve){
							_dfd_pgNavigate = null;
							dfd_pgPage_Click.resolve(resolve);
						});
					}
				});
			});

			return dfd_pgPage_Click.promise();
		};

		_self._getActivePage = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:     _self function returns pagination controls Active page (integer).
							 Returns a PROMISE.

			ACCEPTED PARAMETER(S) AND VALUES:
			elementCss:   none

			USAGE:  _self._loadActivePage();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_getActivePage = new deferred();

			if (_log) console.log('_getActivePage  (enter)..');
			_self._waitForElement(_self._getPgActiveCss(), true, true).then(function (element) {
				//Set _isOnFirstPage && _isOnLastPage properties
				_self._getElementsByCss(_self._getPgBaseCss() + ' li').then(function (elements) {
					elements[0].getAttribute('class').then(function(first) {
						var IsOnFirstPage = first.toLowerCase().indexOf("disabled") !== -1;
						if (_log) console.log('IsOnFirstPage = ' + IsOnFirstPage);
						_self._setIsOnFirstPage(IsOnFirstPage);

						elements[elements.length-1].getAttribute('class').then(function(last) {
							var IsOnLastPage = last.toLowerCase().indexOf("disabled") !== -1;
							if (_log) console.log('IsOnLastPage = ' + IsOnLastPage);
							_self._setIsOnLastPage(IsOnLastPage);
						});
					});
				});
				element.getText().then(function (value) {
					if (_log) console.log('_getActivePage (' + value + ')  ..(exit)');
					dfd_getActivePage.resolve(parseInt(value));
				});
			});

			return dfd_getActivePage.promise();
		};

		_self._loadRowCount = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function populates _rowCount with the row count of the current grid page
							Returns a PROMISE.

			ACCEPTED PARAMETER(S) AND VALUES:
			elementCss:   none

			USAGE:  self._loadRowCount();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_getRowCount = new deferred();

			if (_log) console.log('_loadRowCount  (enter)..');
			_self._getElementsByCss(_self._getCssSelector() + ' tbody tr').then(function (elements) {
				setTimeout(function () {
					if (_log) console.log('_loadRowCount (' + elements.length + ')  ..(exit)');
					_self._setRowCount(elements.length);
					dfd_getRowCount.resolve(_self._getRowCount());
				}, 50);
			});

			return dfd_getRowCount.promise();
		};

		_self._loadColCount = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function Returns a PROMISE. Returns the COLUMN count of the first row of the current
							grid page.
							.
			ACCEPTED PARAMETER(S) AND VALUES:
			elementCss:   none

			USAGE:  _self._getColCount();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_getColCount = new deferred();

			if (_log) console.log('_loadColCount  (enter)..');
			if (_self._getColCount() !== null) {
				if (_log) console.log('_colCount (' + _self._getColCount() + ')  ..(exit)');
				dfd_getColCount.resolve(_self._getColCount());
			}
			else {
				_self._waitForElement(_self._getCssSelector() + ' tbody').then(function () {
					_self._getElementsByCss(_self._getCssSelector() + ' tbody tr:first-child td').then(function (elements) {
						_self._setColCount(elements.length);
						if (_log) console.log('_colCount (' + _self._getColCount() + ')  ..(exit)');
						dfd_getColCount.resolve(_self._getColCount());
					});
				});
			}

			return dfd_getColCount.promise();
		};

		_self._getListedPages = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function returns an array of listed page numbers in the pagination elements
							Returns a PROMISE.

			ACCEPTED PARAMETER(S) AND VALUES:
			elementCss:   none

			USAGE:  _self._loadListedPages();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_getListedPages = new deferred();
			var list = [];

			if (_log) console.log('_getListedPages  (enter)..');
			_self._getElementsByCss(_self._getPgBaseCss() + ' li').then(function (elements) {
				for (var i = 2; i < elements.length - 2; i++) {
                    getListedPagesEach(elements[i]);
				}
				setTimeout(function () {
					if (_log) console.log(list.toString());
					if (_log) console.log('_getListedPages  ..(exit)');
					dfd_getListedPages.resolve(list);
				}, 200);
			});

			return dfd_getListedPages.promise();
		};

		function getListedPagesEach(element){
            element.getText().then(function (value) {
                list.push(parseInt(value));
            });
		}

		_self._loadColHdrs = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE an array of the Column Header elements after population of
							_colHdrs.

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._loadColHdrs();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_loadColHdrs = new deferred();

			if (_log) console.log('_loadColHdrs  (enter)..');
			_self._getElementsByCss(_self._getCssSelector() + ' th').then(function (elements) {
				_self._setColHdrs([]);
				elements.forEach(function (element, index) {
					element.getAttribute("textContent").then(function (txt) {
						element.getAttribute("class").then(function (cls) {

							txt = txt.replace(/\n/g, "").replace(/\t/g, "").trim();
							json = {
								col: index + 1,
								name: txt,
								class: cls,
								isVisible: cls.indexOf('renderable') > -1,
								isSortable: cls.indexOf('sortable') > -1
							};
							_self._getColHdrs().push(json);
						});
					});
				});
				setTimeout(function () {
					if (_log) console.log('_loadColHdrs (' + _self._getColHdrs().length + ')  ..(exit)');
					dfd_loadColHdrs.resolve(_self._getColHdrs());
				}, 300);
			});

			return dfd_loadColHdrs.promise();
		};

		_self._getGridElement = function (row, col) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE an array of td elements to the calling function _loadGridRows
							for a requested rowIndex.

			ACCEPTED PARAMETER(S) AND VALUES:
			RowIndex:   Number

			USAGE:  _self._loadGridRow();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_getGridElement = new deferred();

			_self._getElementsByCss(_self._getCssSelector() + ' tr:nth-child(' + row + ') td:nth-child(' + col + ')').then(function (elements) {
				dfd_getGridElement.resolve(elements[0]);
			});

			return dfd_getGridElement.promise();
		};

		_self._loadGridPageCells = function (elements, hdrs, activePage) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self RECURSIVE function, RETURNS a PROMISE, RESULTS in an array of JSON data
							for the entire collection of grid cells on the current page.
							** Called ONLY by _self._loadGridPage

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._loadGridPageCells(elements, hdrs, activePage);
			----------------------------------------------------------------------------------------------------------*/
			var ActiveCol = _self._getActiveCol();
			var ActiveRow = _self._getActiveRow();
			var cellIdx = ((ActiveRow - 1) * hdrs.length) + (ActiveCol - 1);
			// if (_log) console.log('activeCell:' + cellIdx);

			elements[cellIdx].getAttribute("textContent").then(function (txt) {
				elements[cellIdx].getAttribute("class").then(function (cls) {
					txt = txt.replace(/\n/g, "").replace(/\t/g, "").trim();
					var json = {
						page: activePage,
						row: ActiveRow,
						col: ActiveCol,
						header: hdrs[ActiveCol - 1].name,
						value: txt,
						class: cls
					};
					_gridData.push(json);
					//console.log(json);

					if (_self._getActiveCol() < _self._getColCount()) {
						_self._setActiveCol(_self._getActiveCol() + 1);
						_self._loadGridPageCells(elements, hdrs, activePage);
					}
					else if (_self._getActiveRow() < _self._getRowCount()) {
						_self._setActiveRow(_self._getActiveRow() + 1);
						_self._setActiveCol(1);
						_self._loadGridPageCells(elements, hdrs, activePage);
					}
					else {
						_self._setActiveRow(1);
						_self._setActiveCol(1);
						if (_log) console.log('Resolving _dfd_loadGridPageCells');
						_dfd_loadGridPageCells.resolve();
						//destroying the global deferred promise post use.
						_dfd_loadGridPageCellsReturned = false;
					}
				});
			});

			if (!_dfd_loadGridPageCellsReturned) {
				// console.log('Returning _dfd Promise');
				_dfd_loadGridPageCellsReturned = true;
				return _dfd_loadGridPageCells.promise();
			}
		};

		_self._loadGridPages = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self RECURSIVE function, RETURNS a PROMISE, RESULTS in an array of JSON data
							for the entire collection of grid cells that should be consumable and queryable by consumer.
						==>	NEXT: Create a function within THIS js to search for a value within the JSON and return a
							collection of cells having respective keys...

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._loadGridPages();
			----------------------------------------------------------------------------------------------------------*/
			_self._getActivePage().then(function (activePage) {
				_self._loadRowCount().then(function () {
					_self._loadColHdrs().then(function (hdrs) {
						if (_log) console.log('time:' + moment().format('ss.SSS') + ') ss.ms');
						_self._getElementsByCss(_self._getCssSelector() + ' tbody td').then(function (elements) {
							//creating a deferred promise to pass back to this calling function
							//from _self._loadGridPages() function when executed.
							_dfd_loadGridPageCells = new deferred();
							_self._loadGridPageCells(elements, hdrs, activePage).then(function () {
								_dfd_loadGridPageCells = null;
								if (_log) console.log('Page:' + activePage + ' DONE');
								if (_log) console.log('time:' + moment().format('ss.SSS') + ' ss.ms');
								if (_self._getIsOnLastPage()) {
									_self._setActiveRow(0);
									_self._setActiveCol(0);
									if (_log) console.log('Resolving dfd_loadGridPages');
									_dfd_loadGridPagesReturned = false;
									_dfd_loadGridPages.resolve();
								}
								else {
									_self._pgNext_Click(1).then(function () {
										_self._loadRowCount().then(function () {
											_self._loadGridPages();
										});
									});
								}
							});
						});
					});
				});
			});

			if (!_dfd_loadGridPagesReturned) {
				// console.log('Returning Promise');
				_dfd_loadGridPagesReturned = true;
				return _dfd_loadGridPages.promise();
			}
		};

		_self._loadGridData = function () {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of completion of _dataArray population of all the data grid
							page data via iteration through all the data grid pages calling _loadPageData

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._loadGridData();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_loadGridData = new deferred();

			if (_log) console.log('_loadGridData');
			_self._loadColHdrs().then(function () {
				_self._loadColCount().then(function () {
					_self._loadRowCount().then(function () {
						_self._setActiveRow(1);
						_self._setActiveCol(1);
						//creating a deferred promise to pass back to this calling function
						//from _self._loadGridPages() function when executed.
						_dfd_loadGridPages = new deferred();
						var timeStamp = moment();
						_self._loadGridPages().then(function () {
							if (_log) console.log('ALL PAGES took:' + moment().diff(timeStamp, 'milliseconds', true) + ' milliseconds\n\n');

							//destroying the global deferred promise post use.
							_dfd_loadGridPages = null;

							if (_log) console.log('Resolving dfd_loadGridData');
							dfd_loadGridData.resolve(_self._getGridData());
						});
					});
				});
			});

			return dfd_loadGridData.promise();
		};

		_self._searchGrid = function (colHdrName, searchValue) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of completion of _dataArray search.
							Navigates to and Returns the webElement of the FIRST instance located.

			ACCEPTED PARAMETER(S) AND VALUES: NONE

			USAGE:  _self._loadGridData();
			----------------------------------------------------------------------------------------------------------*/
			var dfd_searchGridData = new deferred();


			// SEARCH IMPLEMENTATION HERE
			IMPLEMENTATION.then(function () {
				dfd_searchGridData.resolve(_self._getGridData());
			});

			return dfd_searchGridData.promise();
		};


		_self._doSort = function (hdr, AscDescDefault, dfd) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function (recursive) RETURNS a PROMISE of completion of data grid sort request.
							Only to be called by _self._sortGrid

			ACCEPTED PARAMETER(S) AND VALUES: hdr (element) AscDescDefault
				as in: asc, desc, def

			USAGE:  _self._doSort(hdr, 'asc');
			----------------------------------------------------------------------------------------------------------*/
			if (_log) console.log('_doSort  (enter)..: ' + hdr.name + ' :: ' + AscDescDefault);
			var sortOpt = false;

			_self._loadColHdrs().then(function (hdrs) {

				switch (AscDescDefault.trim().toLowerCase()) {
					case 'asc':
						sortOpt = 'ascending';
						break;
					case 'desc':
						sortOpt = 'descending';
						break;
					case 'default':
						sortOpt = false;
						break;
					default:
						throwError('## ERROR: Invalid sort option: ' + AscDescDefault);
				}

				if (
					((!sortOpt && hdrs[hdr.col-1].class.trim().toLowerCase().indexOf('ascending') !== -1) ||
						(!sortOpt && hdrs[hdr.col-1].class.trim().toLowerCase().indexOf('descending') !== -1)) ||
							(sortOpt && hdrs[hdr.col-1].class.trim().toLowerCase().indexOf(sortOpt) === -1)) {

						_self._getElementsByCss(_self._getCssSelector() + ' thead th:nth-child(' + (hdr.col) + ')').then(function (elements) {
							if (!hdr.isVisible) { //Force display of column header
								_self._getDriver().executeScript("arguments[0].setAttribute('style', 'display:block')", elements[0]);
							}
							elements[0].click().then(function () {
								_self._doSort(hdr, AscDescDefault, dfd);
								if (!hdr.isVisible) {   //Reset original display style of column header
									_self._getDriver().executeScript("arguments[0].setAttribute('style', 'display:none')", elements[0]);
								}
							});
						});
				}
				else {
					if (_log) console.log('_doSort  ..(exit): ' + hdr.name + ' :: ' + AscDescDefault);
					_dfd_doSortReturned = false;
					dfd.resolve(true);
				}
			});

			if (! _dfd_doSortReturned) {
				// console.log('Returning _dfd Promise');
				_dfd_doSortReturned = true;
				return dfd.promise();
			}
		};

		_self._sortGrid = function (colHdrName, AscDescDefault, optClassFilter) {
			/* ---------------------------------------------------------------------------------------------------------
			DESCRIPTION:    _self function RETURNS a PROMISE of completion of data grid sort request

			ACCEPTED PARAMETER(S) AND VALUES: (case insensitive)
			colHdrName: The displayed name of the column
			AscDescDefault: The sorting option (as in: asc, desc, default)
			optClassFilter: If for some reason there are 2 identically named columns use a distinctive class attribute to differentiate

			USAGE:  _self._sortGrid('Authorization Number', 'asc');
			USAGE:  _self._sortGrid('well identifier', 'DESC', displayuwi);
			----------------------------------------------------------------------------------------------------------*/
			var dfd_sortGrid = new deferred();
			var hdr = null, filteredHdrs = [];
			if (_log) console.log('_sortGrid  (enter).. [ ' + colHdrName + ' :: ' + AscDescDefault + ' :: ' + optClassFilter + ' ]');

			_self._loadColHdrs().then(function (hdrs) {

				filteredHdrs = hdrs.filter(function (hdr) {
					if (optClassFilter) {
						return hdr.class.trim().toLowerCase().indexOf(optClassFilter.trim().toLowerCase()) !== -1;
					} else {
						return hdr.name.trim().toLowerCase() === colHdrName.trim().toLowerCase();
					}
				});
				if (filteredHdrs.length > 1) {
					throwError('## ERROR: Column +' + hdr.name + ' is NOT UNIQUE. Apply an optClassFilter !');
				}
				else {
					hdr = filteredHdrs[0];
					if (!hdr.isSortable) {
						throwError('## ERROR: Column +' + hdr.name + ' is NOT sortable !');
					}
					else {
						//console.log('target:'+colHdrName.trim().toLowerCase()+' :: current:'+hdr.name.trim().toLowerCase());
						dfd = new deferred();
						_self._doSort(hdr, AscDescDefault, dfd).then(function () {
							dfd_sortGrid.resolve();
						});
					}
				}
			});

			return dfd_sortGrid.promise();
		};

		// error handlers for missing constructor parameters
		if (cssSelector === undefined) throw 'No cssSelector defined';
		if (harness === undefined) throw 'No harness defined';

	}

	Grid.prototype = function () {

		function toggleDebug() {
			/*----------------------------------------------------------------------------------------------------------
			description:    turns debugging messages on/off

			paramaters:     none
			returns:        none
			--------------------------------------------------------------------------------------------------------- */
			return this._toggleLogging();
		}

		function getActivePage() {
			/*----------------------------------------------------------------------------------------------------------
			description:    returns the grid object current page number

			paramaters:     none
			returns:        [string]
			--------------------------------------------------------------------------------------------------------- */
			return this._getActivePage();
		}

		// function getPageCount() {
		// 	/*----------------------------------------------------------------------------------------------------------
		// 	description:    returns the grid object page count
		//
		// 	paramaters:     none
		// 	returns:        [string]
		// 	--------------------------------------------------------------------------------------------------------- */
		// 	return this._loadMaxPage();
		// }

		function isOnFirstPage() {
			/*----------------------------------------------------------------------------------------------------------
			description:    returns the grid object page count

			paramaters:     none
			returns:        [string]
			--------------------------------------------------------------------------------------------------------- */
			return this._getIsOnLastPage();
		}

		function isOnLastPage() {
			/*----------------------------------------------------------------------------------------------------------
			description:    returns the grid object page count

			paramaters:     none
			returns:        [string]
			--------------------------------------------------------------------------------------------------------- */
			return this._getIsOnLastPage();
		}

		function getRowCount() {
			/*----------------------------------------------------------------------------------------------------------
			description:    returns the grid object row count

			paramaters:     none
			returns:        [string]
			--------------------------------------------------------------------------------------------------------- */
			return this._loadRowCount();
		}

		function getColCount() {
			/*----------------------------------------------------------------------------------------------------------
			description:    returns the grid object col count based on the Column Headers count.
							THIS MIGHT NEED REFACTORING ???

			paramaters:     none
			returns:        [string]
			--------------------------------------------------------------------------------------------------------- */
			return this._loadColCount();
		}

		function clickFirst() {
			/*----------------------------------------------------------------------------------------------------------
			description:    clicks the first button of a grid object and returns a promise when completed

			paramaters:     none
			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			return this._pgFirst_Click();
		}

		function clickNext(optIterations) {
			/*----------------------------------------------------------------------------------------------------------
			description:    clicks the next button of a grid object and returns a promise when completed
							if you give it a parameter, it will click x times on the Next button of your grid
							before using this function you need to

			paramaters:     none or number
			returns:        [promise]
			usage:          gridObject.clickNext(); OR gridObject.clickNext(5);
			--------------------------------------------------------------------------------------------------------- */
			return this._pgNext_Click(optIterations);
		}

		function clickPrev(optIterations) {
			/*----------------------------------------------------------------------------------------------------------
			description:    clicks the prev button of a grid object and returns a promise when completed

			paramaters:     none
			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			return this._pgPrev_Click(optIterations);
		}

		function clickLast() {
			/*----------------------------------------------------------------------------------------------------------
			description:    clicks the last button of a grid object and returns a promise when completed

			paramaters:     none
			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			return this._pgLast_Click();
		}

		function clickPage(pageNum) {
			/*----------------------------------------------------------------------------------------------------------
			description:    clicks the pager button of a grid object and returns a promise when completed

			paramaters:     [string] the page number
			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			if (isNaN(pageNum) || pageNum < 1 || pageNum > 100) {
				throw new Error('\n\nclickPage: ## ERROR: Page (' + pageNum + ') is invalid. Only NUMBERS > 0 < 101 accepted.');
			}
			else {
				var result = this._pgPage_Click(pageNum);
				if (result.isError) {
					console.log(result);
				}
				return (result);
			}
		}

		function getGridData() {
			/*----------------------------------------------------------------------------------------------------------
			description:    Loads and returns the Grid data for ALL pages

			paramaters:     none
			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			return this._loadGridData();
		}

		function getGridElement(row, col) {
			/*----------------------------------------------------------------------------------------------------------
			description:    Loads and returns the Grid element by specified row and col

			paramaters:     row - integer
							col - integer

			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			return this._getGridElement(row, col);
		}

		function getColHdrs() {
			/*----------------------------------------------------------------------------------------------------------
			description:    Loads and returns the Column Headers

			paramaters:     none
			returns:        [promise]
			--------------------------------------------------------------------------------------------------------- */
			return this._loadColHdrs();
		}

		function searchGrid(colName, value) {
			/*----------------------------------------------------------------------------------------------------------
			description:    Searched _gridData JSON for the cell containing the value and navigates to the
							grid Page/Row/Col and returns the element for interaction.

			paramaters:     colName, value
			returns:        [promise] of located element return
			--------------------------------------------------------------------------------------------------------- */
			return (this._searchGrid(colName, value));
		}

		function sortGrid(columnName, AscDescDefault, optClassFilter) {// TO BE IMPLEMENTED
			/*----------------------------------------------------------------------------------------------------------
			description:    Sorts the grid by requested ColumnHeader name, a  unique class item distinguishing filter,
							and passed order (Asc Desc Default)

			paramaters:     ColumnHeader name, Asc or Desc or Default
			returns:        [promise] of sort completion
			--------------------------------------------------------------------------------------------------------- */
			if (!columnName || !AscDescDefault) {
				throw new Error('\n\n## ERROR: columnName (' + columnName + ') & AscDescDefault (' + AscDescDefault + ' are required parameters');
			}
			else {
				return this._sortGrid(columnName, AscDescDefault, optClassFilter);
			}
		}

		return {
			toggleDebug: toggleDebug,
			getActivePage: getActivePage,
			getRowCount: getRowCount,
			getColCount: getColCount,
			clickFirst: clickFirst,
			clickNext: clickNext,
			clickPrev: clickPrev,
			clickLast: clickLast,
			clickPage: clickPage,
			getGridData: getGridData,
			getGridElement: getGridElement,
			getColHdrs: getColHdrs,
			sortGrid: sortGrid,
			isOnFirstPage:isOnFirstPage,
			isOnLastPage:isOnLastPage
		};
	}();

	return Grid;
})();

module.exports = Grid;