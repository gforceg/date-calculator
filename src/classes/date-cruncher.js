"use strict";
var days_of_the_week_1 = require('../enums/days-of-the-week');
var months_of_the_year_1 = require('../enums/months-of-the-year');
var date_ordinal_1 = require('../classes/date-ordinal');
var date_math_expression_1 = require('../classes/date-math-expression');
var Collections = require('typescript-collections');
var DateCruncher = (function () {
    function DateCruncher() {
    }
    DateCruncher.getHolidays = function (date) {
        try {
            date = DateCruncher.resolveDate(date);
            if (date == null) {
                return null;
            }
            if (date instanceof Date) {
                var cache_key = DateCruncher.resolveCacheKey(date);
                if (DateCruncher.holiday_cache.getValue(cache_key) === undefined) {
                    var new_holidays = new Collections.Dictionary();
                    DateCruncher.holidays.forEach(function (event) {
                        if (event.month === date.getMonth() + 1) {
                            var holiday_date;
                            if (typeof event.day === 'number') {
                                holiday_date = new Date(event.month + '/' + event.day + '/' + date.getFullYear());
                            }
                            else if (typeof event.day === 'string') {
                                var d = DateCruncher.resolveDate(date);
                                var holiday_date = DateCruncher.evaluateOrdinalDate(DateCruncher.CreateDateOrdinal(d, event.day));
                            }
                            if (holiday_date) {
                                switch (holiday_date.getDay()) {
                                    case days_of_the_week_1.DaysOfTheWeek.Saturday:
                                        holiday_date.setDate(holiday_date.getDate() - 1);
                                        break;
                                    case days_of_the_week_1.DaysOfTheWeek.Sunday:
                                        holiday_date.setDate(holiday_date.getDate() + 1);
                                        break;
                                }
                                new_holidays.setValue(DateCruncher.resolveDateString(holiday_date), event);
                            }
                        }
                    });
                    DateCruncher.holiday_cache.setValue(cache_key, new_holidays);
                }
                return DateCruncher.holiday_cache.getValue(cache_key);
            }
            return null;
        }
        catch (ex) {
            throw ex;
        }
    };
    DateCruncher.getHoliday = function (date) {
        var holidays = DateCruncher.getHolidays(date);
        var holiday = holidays[DateCruncher.resolveDateString(date)];
        if (holiday !== undefined) {
            return holiday;
        }
        return null;
    };
    DateCruncher.resolveDate = function (date) {
        if (date instanceof Date) {
            if (isNaN(Number(date))) {
                return null;
            }
            return date;
        }
        if (typeof date === 'string') {
            var date_match = date.match(DateCruncher.DateExpressionStart);
            if (date_match) {
                var t_date = new Date(date_match.toString());
                if (!!(DateCruncher.resolveDateString(t_date).match(/invalid/i))) {
                    return null;
                }
                return t_date;
            }
        }
        return null;
    };
    DateCruncher.resolveDateString = function (date) {
        date = DateCruncher.resolveDate(date);
        if (date instanceof Date) {
            if (DateCruncher.resolveDate(date)) {
                return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            }
        }
        return null;
    };
    DateCruncher.resolveCacheKey = function (date) {
        if (DateCruncher.resolveDate(date)) {
            return (date.getMonth() + 1) + '/' + date.getFullYear();
        }
        return null;
    };
    DateCruncher.isWeekendDay = function (date) {
        date = DateCruncher.resolveDate(date);
        if (date == null) {
            return false;
        }
        if (date instanceof Date) {
            switch (date.getDay()) {
                case days_of_the_week_1.DaysOfTheWeek.Sunday:
                case days_of_the_week_1.DaysOfTheWeek.Saturday:
                    return true;
            }
        }
        return null;
    };
    DateCruncher.isWeekDay = function (date) {
        return !DateCruncher.isWeekendDay(date);
    };
    DateCruncher.isBusinessDay = function (date) {
        return !DateCruncher.isWeekendDay(date) && !DateCruncher.isHoliday(date);
    };
    DateCruncher.isHoliday = function (date) {
        date = DateCruncher.resolveDate(date);
        if (date == null) {
            return false;
        }
        if (date instanceof Date) {
            var holidays = DateCruncher.getHolidays(date);
            return (holidays[DateCruncher.resolveDateString(date)] !== undefined);
        }
        return false;
    };
    DateCruncher.priorBusinessDay = function (date) {
        date = DateCruncher.resolveDate(date);
        if (date == null) {
            return null;
        }
        if (date instanceof Date) {
            do {
                date.setDate(date.getDate() - 1);
            } while (!DateCruncher.isBusinessDay(date));
            return date;
        }
        return null;
    };
    DateCruncher.nextBusinessDay = function (date) {
        date = DateCruncher.resolveDate(date);
        if (date == null) {
            return null;
        }
        if (date instanceof Date) {
            do {
                date.setDate(date.getDate() + 1);
            } while (!DateCruncher.isBusinessDay(date));
            return date;
        }
        return null;
    };
    DateCruncher.CreateDateOrdinal = function (date, expression) {
        var date_ordinal = new date_ordinal_1.DateOrdinal(date, expression);
        if (date_ordinal.ordinal < 1) {
            return null;
        }
        else if (date_ordinal.ordinal > 5) {
            if (date_ordinal.day != null) {
                return null;
            }
        }
        return date_ordinal;
    };
    DateCruncher.evaluate = function (expression, showStep) {
        var dc = DateCruncher;
        expression = expression.replace(/\s+/g, '');
        expression = expression.replace(/sunday/i, 'sun');
        expression = expression.replace(/monday/i, 'mon');
        expression = expression.replace(/tuesday/i, 'tue');
        expression = expression.replace(/wednesday/i, 'wed');
        expression = expression.replace(/thursday/i, 'thu');
        expression = expression.replace(/friday/i, 'fri');
        expression = expression.replace(/saturday/i, 'sat');
        var date_match = expression.match(dc.DateExpressionStart);
        if (date_match) {
            expression = expression.replace(dc.DateExpressionStart, '');
            var parsed_date = dc.resolveDate(date_match[0]);
            var solution_date = null;
            var ordinal_date = null;
            var ordinal_match = expression.match(dc.DateOrdinalExpression);
            if (ordinal_match) {
                expression = expression.replace(dc.DateOrdinalExpression, '');
                var ordinal = dc.CreateDateOrdinal(parsed_date, ordinal_match[0]);
                if (!ordinal) {
                    return null;
                }
                ordinal_date = dc.resolveDate(dc.evaluateOrdinalDate(ordinal));
                if (showStep) {
                    var nth = ordinal.ordinal.toString();
                    if (parseInt(nth, 10)) {
                        nth += ['st', 'nd', 'rd', 'th'][Math.min(3, parseInt(nth, 10) - 1)];
                    }
                    var day = void 0;
                    ordinal.day ? day = days_of_the_week_1.DaysOfTheWeek[ordinal.day] : day = 'day';
                    day = ' ' + day;
                    var fancy_string = ' is the ' + nth + day + ' in ' + months_of_the_year_1.MonthsOfTheYear[ordinal_date.getMonth()];
                    showStep(dc.resolveDateString(ordinal_date) + fancy_string);
                }
                if (!ordinal_date) {
                    return null;
                }
                else {
                    solution_date = ordinal_date;
                }
            }
            var math_matches = expression.match(dc.DateMathExpressionFragment);
            if (math_matches) {
                expression = expression.replace(dc.DateMathExpressionFragment, '');
                var i_date_1 = null;
                if (ordinal_date) {
                    i_date_1 = ordinal_date;
                }
                else {
                    i_date_1 = parsed_date;
                }
                math_matches.forEach(function (match) {
                    var date_math = new date_math_expression_1.DateMathExpression(i_date_1, match);
                    var init_date_string = dc.resolveDateString(i_date_1);
                    i_date_1 = dc.evaluateDateMathExpression(date_math);
                    if (showStep) {
                        var units = date_math.constant.units;
                        var p_units = dc.pretty_units.getValue(units);
                        if (p_units) {
                            units = p_units;
                        }
                        if (date_math.constant.quantity === 1) {
                            units = units.replace(/s$/i, '');
                        }
                        else if (!units.match(/s$/i)) {
                            units += 's';
                        }
                        showStep(init_date_string + ' ' + date_math.operator + ' ' + date_math.constant.quantity + ' ' + units + ' is ' + dc.resolveDateString(i_date_1));
                    }
                });
                solution_date = i_date_1;
            }
            if (!ordinal_match && !math_matches) {
                solution_date = parsed_date;
            }
            ;
            if (!dc.isBusinessDay(solution_date)) {
                var round_match = expression.match(dc.DateRoundExpression);
                if (round_match) {
                    expression = expression.replace(dc.DateRoundExpression, '');
                    if (showStep) {
                        var dc_1 = DateCruncher;
                        var round_count = 0;
                        var date_string = dc_1.resolveDateString(solution_date);
                        var round_direction = void 0;
                        var round_message = 'the previous business day is ';
                        round_match[0].match(/up/) ? round_direction = 'up' : round_direction = 'down';
                        if (!dc_1.isBusinessDay(solution_date)) {
                            while (!dc_1.isBusinessDay(solution_date)) {
                                round_count++;
                                if (round_count > 4) {
                                    showStep('round_count exceeded 4!!');
                                    return null;
                                }
                                if (dc_1.isWeekendDay(solution_date)) {
                                    showStep(date_string + ' is a ' + days_of_the_week_1.DaysOfTheWeek[solution_date.getDay()]);
                                }
                                else if (dc_1.isHoliday(solution_date)) {
                                    var holidays = dc_1.getHolidays(solution_date);
                                    var holiday = holidays[date_string];
                                    if (holiday !== undefined) {
                                        showStep(date_string + ' is ' + holiday.name);
                                    }
                                    else {
                                        showStep(date_string + ' is a holiday\n');
                                    }
                                }
                                if (round_direction === 'up') {
                                    solution_date.setDate(solution_date.getDate() + 1);
                                }
                                else {
                                    solution_date.setDate(solution_date.getDate() - 1);
                                }
                                date_string = dc_1.resolveDateString(solution_date);
                            }
                            if (round_direction === 'up') {
                                round_message = 'the next business day is ';
                            }
                            showStep(round_message + date_string);
                        }
                    }
                    else {
                        if (round_match[0].match(/up/i)) {
                            solution_date = dc.nextBusinessDay(solution_date);
                        }
                        else {
                            solution_date = dc.priorBusinessDay(solution_date);
                        }
                    }
                }
            }
            return solution_date;
        }
        return null;
    };
    DateCruncher.evaluateDateMathExpression = function (_branch) {
        var dc = DateCruncher;
        if (!_branch) {
            return null;
        }
        var sign_multiplier = 1;
        if (_branch.operator === '-') {
            sign_multiplier = -1;
        }
        var solution_date = _branch.date;
        switch (_branch.constant.units) {
            case 'calendarday':
            case 'calendardays':
            case 'day':
            case 'days':
                solution_date.setDate(solution_date.getDate() + _branch.constant.quantity * sign_multiplier);
                break;
            case 'week':
            case 'weeks':
                solution_date.setDate(solution_date.getDate() + (_branch.constant.quantity * 7 * sign_multiplier));
                break;
            case 'month':
            case 'months':
                solution_date.setDate(solution_date.getDate() + Number(_branch.constant.quantity * 30 * sign_multiplier));
                break;
            case 'calendarmonth':
            case 'calendarmonths':
                solution_date.setDate(15);
                solution_date.setMonth(solution_date.getMonth() + _branch.constant.quantity);
                solution_date = dc.evaluate(dc.resolveDateString(solution_date) + 'last day');
                solution_date = dc.evaluate(dc.resolveDateString(solution_date) + ' + 1 day');
                break;
            case 'year':
            case 'years':
                solution_date.setDate(solution_date.getDate() + Number(_branch.constant.quantity * 365 * sign_multiplier));
                break;
            case 'businessday':
            case 'businessdays':
            case 'workday':
            case 'workdays':
            case 'workingday':
            case 'workingdays':
                if (!dc.isBusinessDay(solution_date)) {
                    solution_date = dc.nextBusinessDay(solution_date);
                }
                for (var i = 0; i < _branch.constant.quantity; i++) {
                    if (_branch.operator === '-') {
                        solution_date = dc.priorBusinessDay(solution_date);
                    }
                    else {
                        solution_date = dc.nextBusinessDay(solution_date);
                    }
                }
                break;
        }
        if (solution_date) {
            return solution_date;
        }
        else {
            return null;
        }
    };
    DateCruncher.evaluateOrdinalDate = function (ordinal) {
        if (!ordinal) {
            return null;
        }
        var date = new Date(ordinal.month.toUTCString());
        date.setDate(1);
        if (ordinal.day == null) {
            if (typeof ordinal.ordinal === 'number') {
                date.setDate(ordinal.ordinal);
                if (date.getMonth() !== ordinal.month.getMonth()) {
                    return null;
                }
            }
            else if (typeof ordinal.ordinal === 'string') {
                if (ordinal.ordinal.toLowerCase() === 'last') {
                    date.setMonth(date.getMonth() + 1);
                    date.setDate(date.getDate() - 1);
                }
                else {
                    return null;
                }
            }
        }
        else {
            var i = 0;
            while (date.getDay() !== ordinal.day) {
                date.setDate(date.getDate() + 1);
                i++;
                if (i > 7) {
                    throw 'DateCruncher.getFirst() incremented past 7 days. Breaking infinite loop.';
                }
            }
            if (ordinal.ordinal === 'last') {
                while (date.getMonth() === ordinal.month.getMonth()) {
                    date.setDate(date.getDate() + 7);
                }
                date.setDate(date.getDate() - 7);
            }
            else {
                for (i = 1; i < ordinal.ordinal; i++) {
                    date.setDate(date.getDate() + 7);
                    if (date.getMonth() !== ordinal.month.getMonth()) {
                        return null;
                    }
                }
            }
        }
        return date;
    };
    DateCruncher.holidays = [{
            name: 'New Year\'s Day',
            month: 1,
            day: '1st day'
        }, {
            name: 'Birthday of Martin Luther King Jr.',
            month: 1,
            day: '3rd monday'
        }, {
            name: 'Washington\'s Birthday',
            month: 2,
            day: '3rd monday'
        }, {
            name: 'Memorial Day',
            month: 5,
            day: 'last monday'
        }, {
            name: 'Independence Day',
            month: 7,
            day: '4th day'
        }, {
            name: 'Labor Day',
            month: 9,
            day: '1st monday'
        }, {
            name: 'Columbus Day',
            month: 10,
            day: '2nd monday'
        }, {
            name: 'Veterans Day',
            month: 11,
            day: '11th day'
        }, {
            name: 'Thanksgiving Day',
            month: 11,
            day: '4th thursday'
        }, {
            name: 'Christmas Day',
            month: 12,
            day: '25th day'
        }];
    DateCruncher.pretty_units = new Collections.Dictionary();
    DateCruncher.DateExpression = /(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}\-\d{2}\-\d{2})/;
    DateCruncher.DateExpressionStart = /^(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}\-\d{2}\-\d{2})/;
    DateCruncher.DateExpressionEnd = /(?:(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}\-\d{2}\-\d{2}))$/;
    DateCruncher.DateOrdinalExpression = /^(?:last|first|second|third|fourth|fifth|(?:\d{1,2})(?:st|nd|rd|th))\s?(?:sun|mon|tue|wed|thu|fri|sat|day)/i;
    DateCruncher.DayOfWeekExpression = /(?:sun|mon|tue|wed|thu(?:r(?:s)?)?|fri|sat|day(?:u(?:r)?)?)(?:day)?/i;
    DateCruncher.OrdinalExpression = /(?:last|first|second|third|fourth|fifth|(?:\d{1,2})(?:st|nd|rd|th))/i;
    DateCruncher.DateMathConsantExpression = /\d+(?:(?:calendar|business|work(?:ing)?)?day(?:s)?|(?:calendar)?month(?:s)?|year(?:s)?|week(?:s)?)/i;
    DateCruncher.DateMathOperatorExpression = /[\-\+]/;
    DateCruncher.DateMathExpressionFragment = /[\-\+]\d+(?:(?:calendar|business|work(?:ing)?)?day(?:s)?|(?:calendar)?month(?:s)?|year(?:s)?|week(?:s)?)/gi;
    DateCruncher.DateRoundExpression = /round\s?(?:down|up)$/i;
    DateCruncher.holiday_cache = new Collections.Dictionary();
    return DateCruncher;
}());
exports.DateCruncher = DateCruncher;
DateCruncher.pretty_units.setValue('calendarday', 'calendar days');
DateCruncher.pretty_units.setValue('calendarday', 'calendar days');
DateCruncher.pretty_units.setValue('calendardays', 'calendar days');
DateCruncher.pretty_units.setValue('calendarmonth', 'calendar months');
DateCruncher.pretty_units.setValue('calendarmonths', 'calendar months');
DateCruncher.pretty_units.setValue('businessday', 'business days');
DateCruncher.pretty_units.setValue('businessdays', 'business days');
DateCruncher.pretty_units.setValue('workday', 'work days');
DateCruncher.pretty_units.setValue('workdays', 'work days');
DateCruncher.pretty_units.setValue('workingday', 'working days');
DateCruncher.pretty_units.setValue('workingdays', 'working days');
//# sourceMappingURL=date-cruncher.js.map