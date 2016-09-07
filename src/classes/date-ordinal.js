"use strict";
var days_of_the_week_1 = require('../enums/days-of-the-week');
var date_cruncher_1 = require('./date-cruncher');
var DateOrdinal = (function () {
    function DateOrdinal(date, expression) {
        expression = expression.replace(/\s+/g, '');
        this.month = date_cruncher_1.DateCruncher.resolveDate(date);
        if (!this.month) {
            return null;
        }
        expression = expression.replace(date_cruncher_1.DateCruncher.DateExpressionStart, '');
        this.ordinal = null;
        this.day = null;
        var ordinal_match = expression.match(date_cruncher_1.DateCruncher.OrdinalExpression);
        if (!ordinal_match) {
            return null;
        }
        var ordinal_match_string = String(ordinal_match);
        switch (ordinal_match_string) {
            case 'first':
                this.ordinal = 1;
                break;
            case 'second':
                this.ordinal = 2;
                break;
            case 'third':
                this.ordinal = 3;
                break;
            case 'fourth':
                this.ordinal = 4;
                break;
            case 'fifth':
                this.ordinal = 5;
                break;
            case 'last':
                this.ordinal = ordinal_match_string;
                break;
            default:
                this.ordinal = parseInt(ordinal_match.toString(), 10);
                break;
        }
        expression = expression.replace(ordinal_match.toString(), '');
        var day_match = expression.match(date_cruncher_1.DateCruncher.DayOfWeekExpression);
        if (!day_match) {
            return null;
        }
        switch (day_match.toString().substr(0, 3).toLowerCase()) {
            case 'sun':
                this.day = days_of_the_week_1.DaysOfTheWeek.Sunday;
                break;
            case 'mon':
                this.day = days_of_the_week_1.DaysOfTheWeek.Monday;
                break;
            case 'tue':
                this.day = days_of_the_week_1.DaysOfTheWeek.Tuesday;
                break;
            case 'wed':
                this.day = days_of_the_week_1.DaysOfTheWeek.Wednesday;
                break;
            case 'thu':
                this.day = days_of_the_week_1.DaysOfTheWeek.Thursday;
                break;
            case 'fri':
                this.day = days_of_the_week_1.DaysOfTheWeek.Friday;
                break;
            case 'sat':
                this.day = days_of_the_week_1.DaysOfTheWeek.Saturday;
                break;
            default:
                this.day = null;
                break;
        }
    }
    return DateOrdinal;
}());
exports.DateOrdinal = DateOrdinal;
//# sourceMappingURL=date-ordinal.js.map