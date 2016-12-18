Feature: Users evaluates some-date plus or minus some number of days

  Part of the "date-cruncher" epic

  As a user/developer
  I want to be able to say evaluate expressions such as "today + 60 business days" and "10/13/2016 + 5 calendar months"
  in order to evaluate date math expressions in plain english.

  Scenario: No date is provided.
    Given that no date was provided.
    When the expression is " + 1 day"
    Then the answer will be today's date plus + 1 day


  