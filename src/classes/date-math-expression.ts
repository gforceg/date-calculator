import { DateCruncher } from './';

export class DateMathExpression {
  date: Date;
  operator: string;
  constant: {
    quantity: number;
    units: string;
  };

  // init all values to null
  // if any prop is null, return null immediately
  constructor(date: Date, expression: string) {
    expression = expression.replace(/\s+/g, '');
    // remove all spaces in the expression and create a working expression string
    this.date = DateCruncher.resolveDate(date);
    if (!this.date) {
      return null;
    }

    // remove the date (which we've already parsed by this point) from the expression
    this.operator = null;
    this.constant = {
      quantity: null,
      units: null
    };

    let operator_match = expression.match(DateCruncher.DateMathOperatorExpression);
    if (operator_match) {
      this.operator = String(operator_match);
      expression = expression.replace(operator_match.toString(), '');
    } else {
      return null;
    }

    let constant_match = expression.match(DateCruncher.DateMathConsantExpression);
    if (constant_match) {

      var s_constant = String(constant_match);
      this.constant.quantity = Number(s_constant.match(/\d+/i));
      // _dme.constant.units will be: businessdays, days, calendar months, or years
      this.constant.units = String(s_constant.match(/[a-z]+/)).toLowerCase();
    } else {
      return null;
    }
  }
}
