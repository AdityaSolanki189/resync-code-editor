import {atom} from "recoil";

// saving previously selected language and theme to local storage
const localStorageEffect = (key: string) => ({setSelf, onSet}: {setSelf: SetRecoilState<unknown>, onSet: unknown}) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet((newValue: unknown) => {
        //   if (newValue instanceof DefaultValue) {
        //     localStorage.removeItem(key);
        //   } else {
        localStorage.setItem(key, JSON.stringify(newValue));
        //   }
    });
};

export const language = atom({
    key: "language",
    default: "javascript",
    effects_UNSTABLE: [
        localStorageEffect('language'),
    ]
});

export const cmtheme = atom({
    key: "cmtheme",
    default: "monokai",
    effects_UNSTABLE: [
        localStorageEffect('cmtheme'),
    ]
});