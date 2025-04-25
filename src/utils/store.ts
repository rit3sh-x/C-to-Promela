import { atom } from 'recoil';

export const promelaCode = atom<string>({
    key: 'promelaCode',
    default: `
    proctype main() {
    int x = 42;
    printf("Value: %d\n", x);
    if
    :: x > 0 -> assert(x != 0);
    :: else -> skip;
    fi
}`,
});

export const cCode = atom<string>({
    key: 'cCode',
    default: '',
});