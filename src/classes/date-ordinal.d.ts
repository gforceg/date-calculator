import { DaysOfTheWeek } from '../enums/days-of-the-week';
export declare class DateOrdinal {
    month: Date;
    ordinal: number | string;
    day: DaysOfTheWeek;
    constructor(date: Date, expression: string);
}
