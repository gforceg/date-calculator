import { DaysOfTheWeek } from '../enums/days-of-the-week';
import { DateCruncher } from './date-cruncher';
// inflates the following string    /month = new Date('8/9/2016'); (only the month and year in this date will actually be used, hence the variable's name)
// 8/9/2016 2nd Wednesday    ------| ordinal = 2
//                                  \day = 3 
export class DateOrdinal {
  month: Date;
  ordinal: number | string; // possible values are: 1,2,3,4 and 'last' (1st, 2nd, 3rd, 4th are ints and 'last' is a string)
  day: DaysOfTheWeek;

  // init to null
  constructor(date: Date, expression: string) {
    expression = expression.replace(/\s+/g, '');
    // remove all spaces in the expression and create a working expression string
    this.month = DateCruncher.resolveDate(date);
    if (!this.month) {
      return null;
    }
    // remove the date (which we've already parsed by this point) from the expression
    expression = expression.replace(DateCruncher.DateExpressionStart, '');

    this.ordinal = null;
    this.day = null;

    // static evaluateOrdinalExpression(ordinal: string, day: string, date_string: string): string {
    // resolve the ordinal
    let ordinal_match = expression.match(DateCruncher.OrdinalExpression);
    if (!ordinal_match) {
      return null;
    }
    let ordinal_match_string = String(ordinal_match);
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

    // day of the week
    let day_match = expression.match(DateCruncher.DayOfWeekExpression);
    if (!day_match) {
      return null;
    }

    switch (day_match.toString().substr(0, 3).toLowerCase()) {
      case 'sun':
        this.day = DaysOfTheWeek.Sunday;
        break;
      case 'mon':
        this.day = DaysOfTheWeek.Monday;
        break;
      case 'tue':
        this.day = DaysOfTheWeek.Tuesday;
        break;
      case 'wed':
        this.day = DaysOfTheWeek.Wednesday;
        break;
      case 'thu':
        this.day = DaysOfTheWeek.Thursday;
        break;
      case 'fri':
        this.day = DaysOfTheWeek.Friday;
        break;
      case 'sat':
        this.day = DaysOfTheWeek.Saturday;
        break;
      default:
        this.day = null;  // this is okay, this.day is null then we are talking about the 'nth day of the month'
        break;
    }
  }
}
