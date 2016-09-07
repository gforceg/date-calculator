export declare class DateMathExpression {
    date: Date;
    operator: string;
    constant: {
        quantity: number;
        units: string;
    };
    constructor(date: Date, expression: string);
}
