// greg hedin
// date-calculator
// v1.0

import { DaysOfTheWeek, } from '../enums/days-of-the-week';
import { MonthsOfTheYear } from '../enums/months-of-the-year';
import { IEvent } from '../interfaces/ievent.interface';
import { DateOrdinal } from '../classes/date-ordinal';
import { DateMathExpression } from '../classes/date-math-expression';
import * as Collections from 'typescript-collections';

// a very simple date calculator - it does basic date addition and subtraction
// it handles simple expressions such as:
// 8/3/2016 + 30 days
// 8/3/2016 + 30 business days   \    these
// 8/3/2016 + 30 work days        |--- are
// 8/3/2016 + 30 working days    /   synonyms
// 8/3/2016 + 6 months
// 8/3/2016 - 7 years
export class DateCruncher {

  // the U.S. federal holidays
  // per 5 USC 6103 http://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title5-section6103&f=treesort&fq=true&num=0
  // fixme: this should be loaded in by the client, or specified in a dataset somewhere...
  static holidays: Array<IEvent> = [{
    name: 'New Year\'s Day',
    month: 1,
    day: '1st day' // january 1.
  }, {
      name: 'Birthday of Martin Luther King Jr.', // the third Monday in January.
      month: 1,
      day: '3rd monday'
    }, {
      name: 'Washington\'s Birthday', // the third Monday in February.
      month: 2,
      day: '3rd monday'
    }, {
      name: 'Memorial Day', // the last Monday in May.
      month: 5,
      day: 'last monday'
    }, {
      name: 'Independence Day', // july 4.
      month: 7,
      day: '4th day'
    }, {
      name: 'Labor Day', // the first Monday in September.
      month: 9,
      day: '1st monday'
    }, {
      name: 'Columbus Day', // the second Monday in October.
      month: 10,
      day: '2nd monday'
    }, {
      name: 'Veterans Day', // november 11.
      month: 11,
      day: '11th day'
    }, {
      name: 'Thanksgiving Day', // the fourth Thursday in November.
      month: 11,
      day: '4th thursday'
    }, {
      name: 'Christmas Day', // december 25.
      month: 12,
      day: '25th day'
    }];

  static pretty_units: Collections.Dictionary<string, string> = new Collections.Dictionary<string, string>();
  
  // some nice reusable RegExps
  static DateExpression: RegExp = /(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}\-\d{2}\-\d{2})/;
  static DateExpressionStart: RegExp = /^(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}\-\d{2}\-\d{2})/;
  static DateExpressionEnd: RegExp = /(?:(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}\-\d{2}\-\d{2}))$/;
  // static MonthExpression: RegExp = /[^\d+\/]?\d{1,2}\/\d{4}/;
  // static MonthExpressionStart: RegExp = /^\d{1,2}\/\d{4}/;
  // static MonthExpressionEnd: RegExp = /\d{1,2}\/\d{4}$/;

  // pick up things like:
  // 1st Friday, 2nd Thursday, 3rd Thursday, third Wednesday, last Tuesday (the last Tuesday of the month)
  static DateOrdinalExpression: RegExp = /^(?:last|first|second|third|fourth|fifth|(?:\d{1,2})(?:st|nd|rd|th))\s?(?:sun|mon|tue|wed|thu|fri|sat|day)/i;
  static DayOfWeekExpression: RegExp = /(?:sun|mon|tue|wed|thu(?:r(?:s)?)?|fri|sat|day(?:u(?:r)?)?)(?:day)?/i;
  static OrdinalExpression: RegExp = /(?:last|first|second|third|fourth|fifth|(?:\d{1,2})(?:st|nd|rd|th))/i;
  // pick up things like: '1 day', '15 business days', '2 weeks' and '6 months'
  static DateMathConsantExpression: RegExp = /\d+(?:(?:calendar|business|work(?:ing)?)?day(?:s)?|(?:calendar)?month(?:s)?|year(?:s)?|week(?:s)?)/i;
  static DateMathOperatorExpression: RegExp = /[\-\+]/;
  static DateMathExpressionFragment: RegExp = /[\-\+]\d+(?:(?:calendar|business|work(?:ing)?)?day(?:s)?|(?:calendar)?month(?:s)?|year(?:s)?|week(?:s)?)/gi;

  static DateRoundExpression: RegExp = /round\s?(?:down|up)$/i;

  // an associative array of holiday dates
  // *** this should use a Collections.Dictionary type ***
  // the npm package: 'typescript-collections' but did not work at run time when I tried it.
  // the way holiday_cache is actually used is:
  // holidays_for_this_month = getHolidays('08/09/2016') - returns a lazy-cached assoc array of holidays where:
  // each key is a date and each value is aIEvent.
  static holiday_cache: Collections.Dictionary<String, Collections.Dictionary<String, IEvent>> = new Collections.Dictionary<String, Collections.Dictionary<String, IEvent>>();

  // lazy caching (and retrieving) of holidays for a given 'mm/yyyy'
  // *** this should use a dictionary type ***
  static getHolidays(date: Date | string): any {
    console.log('get holidays');
    try {
      date = DateCruncher.resolveDate(date);
      if (date == null) {
        return null;
      }
      if (date instanceof Date) {

        let cache_key = DateCruncher.resolveCacheKey(date);
        console.log('checking holiday_cache using cache_key: ' + cache_key);
        DateCruncher.holiday_cache.getValue(cache_key)

        if (!DateCruncher.holiday_cache.getValue(cache_key)) {
          // find and cache the holidays for the given 'mm/yyyy'
          // *** this should use a dictionary type ***
          var new_holidays: Collections.Dictionary<String, IEvent> = new Collections.Dictionary<String, IEvent>();
          DateCruncher.holidays.forEach(event => {
            if (event.month === (<Date>date).getMonth() + 1) {
              var holiday_date: Date;
              if (typeof event.day === 'number') {
                holiday_date = new Date(event.month + '/' + event.day + '/' + (<Date>date).getFullYear());
                // new_holidays[event.month + '/' + event.day + '/' + date.getFullYear()] = event;
              } else if (typeof event.day === 'string') {

                // create an ordinal expression
                let d = DateCruncher.resolveDate(date);
                var holiday_date = DateCruncher.evaluateOrdinalDate(DateCruncher.CreateDateOrdinal(d, event.day));
              }

              // now we have a date instance for the holiday for the given year.
              // if it falls on a weekend, we better round to the nearest weekday!
              // if it's a saturday, round down to friday
              // if it's a sunday, round up to monday
              if (holiday_date) {
                switch (holiday_date.getDay()) {

                  case DaysOfTheWeek.Saturday:
                    holiday_date.setDate(holiday_date.getDate() - 1);
                    break;

                  case DaysOfTheWeek.Sunday:
                    holiday_date.setDate(holiday_date.getDate() + 1);
                    break;
                }
                // uncomment to output holidays as they are cached.
                // console.log('added holiday: ' + event.name + ' -> ' + DateCruncher.resolveDateString(holiday_date))
                new_holidays.setValue(DateCruncher.resolveDateString(holiday_date), event);
              }
            }
          });

          DateCruncher.holiday_cache.setValue(cache_key, new_holidays);
        }
        return DateCruncher.holiday_cache.getValue(cache_key);
      }
      return null;
    } catch (ex) {
      throw ex;
    }
  }

  static getHoliday(date: Date | string): IEvent {
    let holidays = DateCruncher.getHolidays(date);
    let holiday = holidays[DateCruncher.resolveDateString(date)];
    if (holiday !== undefined) { return holiday; }

    return null;
  }
  // if string return new date
  // if date just pass-thru
  // if null return null
  // also, this function is called a ton by internal functions
  static resolveDate(date: string | Date): Date {
    // if a date type was passed in
    // and it is not null
    // and it isn't - 'not a number'
    // pass-thru, otherwise return null;
    if (date instanceof Date) {
      if (isNaN(Number(date))) {
        return null;
      }
      return date;
    }

    if (typeof date === 'string') {
      var date_match = date.match(DateCruncher.DateExpressionStart);

      if (date_match) {
        let t_date = new Date(date_match.toString());

        // if the date is invalid
        if (!!(DateCruncher.resolveDateString(t_date).match(/invalid/i))) {
          return null;
        }

        // otherwise return the date object
        return t_date;
      }
    }

    return null;
  }

  static resolveDateString(date: Date | string): string {
    date = DateCruncher.resolveDate(date);
    if (date instanceof Date) {
      if (DateCruncher.resolveDate(date)) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
      }
    }

    return null;
  }

  static resolveCacheKey(date: Date): string {
    if (DateCruncher.resolveDate(date)) {
      return (date.getMonth() + 1) + '/' + date.getFullYear();
    }

    return null;
  }
  // returns true if the date is on the weekend
  static isWeekendDay(date: string | Date): boolean {
    date = DateCruncher.resolveDate(date);
    if (date == null) {
      return false;
    }
    if (date instanceof Date) {
      switch (date.getDay()) {
        case DaysOfTheWeek.Sunday:
        case DaysOfTheWeek.Saturday:
          return true;
      }
    }

    return null;
  }

  // ... if it's not a weekend day then it's a week day
  static isWeekDay(date: string | Date): boolean {
    return !DateCruncher.isWeekendDay(date);
  }

  // returns true if the date is during the week and no a holiday
  static isBusinessDay(date: string | Date): boolean {
    return !DateCruncher.isWeekendDay(date) && !DateCruncher.isHoliday(date);
  }

  static isHoliday(date: string | Date): boolean {
    date = DateCruncher.resolveDate(date);
    if (date == null) {
      return false;
    }
    if (date instanceof Date) {
      // fetch the holidays for the mm/yyyy in the date passed to this function

      var holidays = DateCruncher.getHolidays(date);
      return (holidays[DateCruncher.resolveDateString(date)] !== undefined);
    }
    return false;
  }

  static priorBusinessDay(date: string | Date): Date {
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
  }

  static nextBusinessDay(date: string | Date): Date {
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
  }

  // safely create a date ordinal or retur null, e.g., if they ask for the 16th wednesday of the month, it returns null rather than an erroneous DateOrdinal.
  static CreateDateOrdinal(date: Date, expression: string): DateOrdinal {
    let date_ordinal = new DateOrdinal(date, expression);

    // there can be only 1..5 weeks in a month
    if (date_ordinal.ordinal < 1) {
      return null;
    } else if (date_ordinal.ordinal > 5) {
      if (date_ordinal.day != null) {
        return null;
      }
    }
    return date_ordinal;
  }

  // this is the function called by the client code.
  // the client code can provide the following expressions:

  //          input expression                            DateCruncher method called
  // '8/29/2016 + 30 days'                    \
  // '08/29/2016 - 5 weeks //5 weeks ago'      |
  // '8/29/2016 + 5 business days'             | --> DateCruncher.evaluateDateMathExpression()
  // '08/29/2016 + 6 months'                   |
  // '8/29/2016 + 2 years'                    /

  // '08/29/2016 third Friday'                \
  // '8/3/2016 last Wednesday'                 | --> DateCruncher.evaluateOrdinal()
  // '08/29/2016 1st Friday                   /
  public static evaluate(expression: string, showStep?: (str: string) => void): Date {
    // dc is an alias for DateCruncher
    let dc = DateCruncher;
    /*
     a complex example: expression = '8/6/2016 3rd tuesday + 6 months - 31 days round up'
    // 1. sanitize the expression.
    // Replace remove all spaces: expression = '8/6/20163rdtuesday+6months-31daysroundup';
    // Abbreviate the name of a day: expression = '8/6/20163rdtue+6months-31daysroundup'; 
    // 2. isolate the dateString, instantiate the date, and then peel the dateString off the expression.
    // 3. if there is an ordinal (e.g., 3rd tue), inflate it and peel the ordinal off the expression.
      Then evaluate the ordinal, set the solution_date to the ordinal and continue. (note: the solution date will change if step 4 contains math expressions.)
    // 4. if there are date math expressions, parse them out and peel them off the expression.
      If an ordinal match was found, plug that date into the first iteratation of. Otherwise, plug-in parsed_dated.
      Iterate over all date math expression matches, plugging in i_date and setting i_date. After all iterations, set solution_date to i_date
    // 5. of there is a rounding expression, round up or down to the nearest business day.
    */
    // 1.
    expression = expression.replace(/\s+/g, '');
    expression = expression.replace(/sunday/i, 'sun');
    expression = expression.replace(/monday/i, 'mon');
    expression = expression.replace(/tuesday/i, 'tue');
    expression = expression.replace(/wednesday/i, 'wed');
    expression = expression.replace(/thursday/i, 'thu');
    expression = expression.replace(/friday/i, 'fri');
    expression = expression.replace(/saturday/i, 'sat');
    // console.log('1. ');
    // console.log(expression);
    // 2.
    let date_match = expression.match(dc.DateExpressionStart);
    if (date_match) {
      expression = expression.replace(dc.DateExpressionStart, '');
      let parsed_date = dc.resolveDate(date_match[0]);
      // console.dir(parsed_date);
      // console.log('2. ');
      // console.log(expression);

      // the solution date will eventually be returned
      let solution_date: Date = null;
      let ordinal_date: Date = null;
      // 3.
      let ordinal_match = expression.match(dc.DateOrdinalExpression);
      if (ordinal_match) {
        // console.dir(ordinal_match);
        expression = expression.replace(dc.DateOrdinalExpression, '');
        // console.log('3. ');
        // console.log(expression);
        let ordinal = dc.CreateDateOrdinal(parsed_date, ordinal_match[0]);
        if (!ordinal) { return null; }
        // console.dir(ordinal);
        ordinal_date = dc.resolveDate(dc.evaluateOrdinalDate(ordinal));

        // show steps for the client program.
        if (showStep) {
          // fixme: this probably belongs on its own
          // produce a string like: " is the 3rd mon in October" or " is the last Friday in February"
          let nth: string = ordinal.ordinal.toString();
          // faster than saying if n = '1', n = '1st', if n = '2', n = '2nd', etc ...
          if (parseInt(nth, 10)) {
            nth += ['st', 'nd', 'rd', 'th'][Math.min(3, parseInt(nth, 10) - 1)];
          }
          // day can be the word 'day' or a day of the week 
          let day: string;
          ordinal.day ? day = DaysOfTheWeek[ordinal.day] : day = 'day';
          day = ' ' + day;

          let fancy_string = ' is the ' + nth + day + ' in ' + MonthsOfTheYear[ordinal_date.getMonth()];
          showStep(dc.resolveDateString(ordinal_date) + fancy_string);
        }
        // if we got this far but there was no date returned,
        // the expression was probably malformed. return null.
        if (!ordinal_date) {
          return null;
        } else { solution_date = ordinal_date; }
      }
      // 4.
      let math_matches = expression.match(dc.DateMathExpressionFragment);
      if (math_matches) {
        expression = expression.replace(dc.DateMathExpressionFragment, '');
        // console.log('4. ');
        // console.log(expression);
        let i_date: Date = null;
        if (ordinal_date) {
          i_date = ordinal_date;
        } else { i_date = parsed_date; }

        math_matches.forEach((match) => {
          let date_math = new DateMathExpression(i_date, match);
          let init_date_string = dc.resolveDateString(i_date);
          i_date = dc.evaluateDateMathExpression(date_math);
          // show steps for the client program.
          if (showStep) {
            // 4.1 make sure we say "business days" instead of "businessdays"
            // 4.2 make sure we say "1 day" or "x days"
            let units = date_math.constant.units;
            // 4.1
            let p_units = dc.pretty_units.getValue(units);
            if (p_units) { units = p_units; }
            // 4.2
            if (date_math.constant.quantity === 1) {
              units = units.replace(/s$/i, '');
            } else if (!units.match(/s$/i)) { units += 's'; }
            showStep(init_date_string + ' ' + date_math.operator + ' ' + date_math.constant.quantity + ' ' + units + ' is ' + dc.resolveDateString(i_date));
          }
        });
        solution_date = i_date;
      }
      // 5.
      // if they provided the following expression: "8/20/2016 round down"
      // then set solution_date to the date that was passed in the original expressions
      if (!ordinal_match && !math_matches) { solution_date = parsed_date; };

      if (!dc.isBusinessDay(solution_date)) {
        let round_match = expression.match(dc.DateRoundExpression);
        if (round_match) {
          // console.log('5. ');
          // console.log(expression);
          expression = expression.replace(dc.DateRoundExpression, '');

          if (showStep) {
            let dc = DateCruncher;
            let round_count = 0;
            let date_string = dc.resolveDateString(solution_date);
            let round_direction: string;
            let round_message = 'the previous business day is ';
            // round up if specified, round down by default.
            round_match[0].match(/up/) ? round_direction = 'up' : round_direction = 'down';
            if (!dc.isBusinessDay(solution_date)) {
              while (!dc.isBusinessDay(solution_date)) {
                round_count++;
                // no infinite loops here! if this happens there is a bug!
                if (round_count > 4) {
                  showStep('round_count exceeded 4!!');
                  return null;
                }
                if (dc.isWeekendDay(solution_date)) {
                  showStep(date_string + ' is a ' + DaysOfTheWeek[solution_date.getDay()]);
                } else if (dc.isHoliday(solution_date)) {
                  let holidays = dc.getHolidays(solution_date);
                  let holiday: IEvent = holidays[date_string];
                  if (holiday !== undefined) {
                    showStep(date_string + ' is ' + holiday.name);
                  } else { showStep(date_string + ' is a holiday\n'); }  // this line should be unreachable...  
                }

                if (round_direction === 'up') {
                  solution_date.setDate(solution_date.getDate() + 1);
                } else {
                  solution_date.setDate(solution_date.getDate() - 1);
                }
                date_string = dc.resolveDateString(solution_date);
              }

              if (round_direction === 'up') {
                round_message = 'the next business day is ';
              }

              showStep(round_message + date_string);
            }
          } else {
            if (round_match[0].match(/up/i)) {
              solution_date = dc.nextBusinessDay(solution_date);
            } else {
              solution_date = dc.priorBusinessDay(solution_date);
            }
          }
        }
      } // else { console.log('NO ROUNDING DETECTED'); }
      return solution_date;
    }


    return null;
  }



  // evaluate an expression in the format: <date> <operator> <constant>
  // where date is a date locale string 'mm/dd/yyyy'
  // operator is '+'or '-'
  // and constant is a e.g., 5 and a unit of measure such as 'days', 'weeks', and 'months'
  // e.g., 8/3/2016+30Days
  private static evaluateDateMathExpression(_branch: DateMathExpression): Date {
    let dc = DateCruncher;

    if (!_branch) { return null; }

    // console.dir(_branch);
    // if we go this far everything should be in the correct format.
    // this calculator only does addition and subtraction.
    // subtract if necessary
    let sign_multiplier: number = 1;
    if (_branch.operator === '-') {
      sign_multiplier = -1;
    }

    // our return value will be 'DateCruncher.resolveDateString(solution_date)'
    let solution_date = _branch.date;
    switch (_branch.constant.units) {
      case 'calendarday':
      case 'calendardays':
      case 'day':
      case 'days':
        solution_date.setDate(solution_date.getDate() + _branch.constant.quantity * sign_multiplier);
        break;
      case 'week':
      case 'weeks':
        // add 7 days
        solution_date.setDate(solution_date.getDate() + (_branch.constant.quantity * 7 * sign_multiplier));
        break;
      case 'month':
      case 'months':
        // add 30 days
        solution_date.setDate(solution_date.getDate() + Number(_branch.constant.quantity * 30 * sign_multiplier));
        break;
      case 'calendarmonth':
      case 'calendarmonths':
        // add days of the month days
        // set the date to the middle of the month of the current month (the 15th is an arbtrary number less than 28) to avoid things like:
        // '2/31/2016' which will push you up another month to '3/3/2016'
        solution_date.setDate(15);
        solution_date.setMonth(solution_date.getMonth() + _branch.constant.quantity);
        solution_date = dc.evaluate(dc.resolveDateString(solution_date) + 'last day');
        solution_date = dc.evaluate(dc.resolveDateString(solution_date) + ' + 1 day');
        // solution_date.setDate(solution_date.getDate() + Number(_branch.constant.quantity * 30 * sign_multiplier));
        break;
      case 'year':
      case 'years':
        // add 365 days
        solution_date.setDate(solution_date.getDate() + Number(_branch.constant.quantity * 365 * sign_multiplier));
        break;
      case 'businessday':
      case 'businessdays':
      case 'workday':
      case 'workdays':
      case 'workingday':
      case 'workingdays':
        // if the date passed in was not a business day,
        // advance it to the next business day before counting.
        if (!dc.isBusinessDay(solution_date)) {
          solution_date = dc.nextBusinessDay(solution_date);
        }
        for (let i = 0; i < _branch.constant.quantity; i++) {
          if (_branch.operator === '-') {
            solution_date = dc.priorBusinessDay(solution_date);
          } else {
            solution_date = dc.nextBusinessDay(solution_date);
          }
        }
        break;
    }

    if (solution_date) {
      return solution_date;
    } else {
      return null; // 'unable to calculate.';
    }
  }

  // to get the 3rd friday of the month: DateCruncher.evaluateOrdinalExpression('8/1/2016 3rd Friday')
  // get the first Friday and add 7 * n-1
  // then check to see the day falls under the month in question.
  // if it doesn't, return null
  private static evaluateOrdinalDate(ordinal: DateOrdinal): Date {

    if (!ordinal) {
      return null;
    }

    // instanciate a date and then move to the first of the month.
    let date: Date = new Date(ordinal.month.toUTCString());
    date.setDate(1);

    if (ordinal.day == null) {
      if (typeof ordinal.ordinal === 'number') {
        date.setDate((<number>ordinal.ordinal));
        if (date.getMonth() !== ordinal.month.getMonth()) { return null; }
      } else if (typeof ordinal.ordinal === 'string') {
        if ((<string>ordinal.ordinal).toLowerCase() === 'last') {
          // advance to the first of the following month and subtract 1 day.
          date.setMonth(date.getMonth() + 1);
          date.setDate(date.getDate() - 1);
        } else { return null; }
      }
    } else {
      // i increments to a max of 7 days to prevent an infinite loop.
      let i = 0;

      while (date.getDay() !== ordinal.day) {
        // increment date until we are on the first ordinal.day of the month
        date.setDate(date.getDate() + 1);
        i++;
        if (i > 7) {
          throw 'DateCruncher.getFirst() incremented past 7 days. Breaking infinite loop.';
        }
      }

      if (ordinal.ordinal === 'last') {
        // iterate 7 days at a time until we go too far, then go back 7 days.
        while (date.getMonth() === ordinal.month.getMonth()) {
          date.setDate(date.getDate() + 7);
        }
        date.setDate(date.getDate() - 7);
      } else {
        // pay attention because we are reusing the incrementer here.)
        for (i = 1; i < ordinal.ordinal; i++) {
          date.setDate(date.getDate() + 7);
          if (date.getMonth() !== ordinal.month.getMonth()) {
            return null;
          } // 'invalid date requested ' + expression; }
        }
      }
    }
    return date;
  }

}



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