"use strict";
var _1 = require('./');
var DateMathExpression = (function () {
    function DateMathExpression(date, expression) {
        expression = expression.replace(/\s+/g, '');
        this.date = _1.DateCruncher.resolveDate(date);
        if (!this.date) {
            return null;
        }
        this.operator = null;
        this.constant = {
            quantity: null,
            units: null
        };
        var operator_match = expression.match(_1.DateCruncher.DateMathOperatorExpression);
        if (operator_match) {
            this.operator = String(operator_match);
            expression = expression.replace(operator_match.toString(), '');
        }
        else {
            return null;
        }
        var constant_match = expression.match(_1.DateCruncher.DateMathConsantExpression);
        if (constant_match) {
            var s_constant = String(constant_match);
            this.constant.quantity = Number(s_constant.match(/\d+/i));
            this.constant.units = String(s_constant.match(/[a-z]+/)).toLowerCase();
        }
        else {
            return null;
        }
    }
    return DateMathExpression;
}());
exports.DateMathExpression = DateMathExpression;
//# sourceMappingURL=date-math-expression.js.map