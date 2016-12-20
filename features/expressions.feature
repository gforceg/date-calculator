Feature: The date cruncher should evaluate expressions.

  As a user, I want to be able to evaluate expressions such as "Thursday" and "Fri"

  Scenario: The user wants to determine if an expression matches a day of the week.
    Given the expression "thursday" is a "day of the week"
    Given the expression "thus" is not a "day of the week"
    Given the expression "thurs" is a "day of the week"
    Given the expression "frid" is a "day of the week"
    Given the expression "fride" is not a "day of the week"
    Given the expression "saturda" is a "day of the week"
    Given the expression "sun" is a "day of the week"
  
  Scenario: The expression parser understand ordinals: 1st 2st ... 5th lst and first second ... fifth lastd
    Given the expression "0th" is not an "ordinal"
    Given the expression "1st" is an "ordinal"
    Given the expression "lst" is an "ordinal"
    Given the expression "3st" is an "ordinal"
    Given the expression "4th" is an "ordinal"
    Given the expression "first" is an "ordinal"
    Given the expression "thard" is not an "ordinal"
    Given the expression "fifth" is an "ordinal"
    Given the expression "fith" is not an "ordinal"
    Given the expression "last" is an "ordinal"
  
  Scenario: The expression parser should understand units: 'day', 'tuesday', 'week', 'month'
    Given the expression "day" is an "ordinal unit"
    Given the expression "monday" is an "ordinal unit"
    Given the expression "year" is not an "ordinal unit"
    Given the expression "november" is not an "ordinal unit"

  Scenario: The expression parser should understand ordinal scope units 'November', '2016', '11/2016', '11'
    Given the expression "November" is a "scope unit"
    Given the expression "2016" is a "scope unit"
    Given the expression "21" is not a "scope unit"
    Given the expression "dang" is not a "scope unit"
    Given the expression "11" is a "scope unit"
    Given the expression "4" is a "scope unit"
    Given the expression "04" is a "scope unit"
    Given the expression "11/2016" is a "scope unit"
