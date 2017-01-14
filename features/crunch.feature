Feature: The date cruncher should evaluate expressions.

  As a calculator, I want to answer questions like "when is the 3rd thursday in May?"
  I also want to evaluate math expressions like "11/16/2016 + 5 business days"

  Scenario: The user wants to determine if an expression matches a day of the week.
    Given the expression "today" evaluates to "today"
    And the expression "tomorrow" evaluates to "tomorrow"
    And the expression "yesterday" evaluates to "yesterday"
    And the expression "there's no date here!" evaluates to "null"
    And the expression "10/10/2016" evaluates to "10/10/2016"
    And the expression "11/10/2016" evaluates to "10/11/2016"
    