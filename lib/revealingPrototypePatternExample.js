const Grid = (() => {
    function Grid() {
        let _privateField = "private";

        const _privateFunction = () => {
            return _privateField;
        };

        this._privateFunction = _privateFunction;
    }

    Grid.prototype = () => {
        let publicField = "public";

        const publicFunction = () => {
            return publicField + " " + this._privateFunction();
        };

        return {
            publicField: publicField,
            publicFunction: publicFunction
        };
    };

    return Grid;
})();

module.exports = Grid;