type m<v = 5> = {
    something: (test: string) => v;
};
class p<l = 3> implements m<l> {
    something(test: string = "3"): l {
        return <l>{};
    }
    static poop: () => {};
}
export default class o extends p<"testStuff"> {}
