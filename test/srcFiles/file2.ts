type s<p, v> = {
    something: p;
    else: v;
};
type n<v> = s<number, v>;
interface test<c> {
    something: c;
}
