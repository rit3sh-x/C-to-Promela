import { atom } from 'recoil';

export const promelaCode = atom<string>({
    key: 'promelaCode',
    default: "",
});

export const cCode = atom<string>({
    key: 'cCode',
    default: '',
});

export const isLLM = atom<boolean>({
    key: 'isLLM',
    default: true,
})