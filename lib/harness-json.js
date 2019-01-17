/**
 * Created by valeriu.jecov on 10/04/2018.
 */

/* jshint -W024 */
/* jshint expr:true */
/* jshint laxcomma:true */

const jsonFile = require('jsonfile')
    , fs = require('fs-extra');

class HarnessJson {
    constructor(jsonDataFilePath) {
        this._getJsonDataFilePath = () => {
            return this._jsonDataFilePath;
        };

        this._setJsonDataFilePath = (jsonDataFilePath) => {
            this._jsonDataFilePath = jsonDataFilePath;
        };

        this._getJsonData = () => {
            return this._jsonData;
        };
        this._setJsonData = (jsonData) => {
            this._jsonData = jsonData;
        };

        this._loadJsonData = () => {
            try {
                this._setJsonData(jsonFile.readFileSync(this._getJsonDataFilePath()));
            } catch (err) {
                console.log("load json error: " + err.message);
            }
        };

        this._saveJsonData = () => {
            jsonFile.writeFileSync(this._getJsonDataFilePath(), this._getJsonData());   //saveDataJSON(dataJson);
        };

        this._deleteJsonData = () => {
            fs.removeSync(this._getJsonDataFilePath());
        };

        if (jsonDataFilePath === undefined) throw 'No jsonDataFilePath defined';

        this._setJsonDataFilePath(jsonDataFilePath);
        this._setJsonData({});
    }

    deleteJsonFile () {
        this._deleteJsonData();
        console.log('\'' + this._getJsonDataFilePath() + '\' file deleted');
    }

    getJsonData () {
        this._loadJsonData();
        return this._getJsonData();
    }

    saveJsonData (dataObj) {
        this._setJsonData(dataObj);
        this._saveJsonData();
    }
}

module.exports = HarnessJson;
