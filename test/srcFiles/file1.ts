export type s = {
    readonly something: {
        test: number | string;
        crap: any;
        literal: "test";
        boolean: boolean & string;
    };
    array: [number, string];
    otherStuff: string;
};
type something = number;
export type smth = something;
export interface test {
    readonly s: boolean;
}
