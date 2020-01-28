import { Dict } from "@tsow/ow-attest/dist/types/ipv8/types/Dict";
import React, { createContext, FC, useContext, useState } from "react";

/** The context object for i18n */
export interface I18nContext {
    langCode: string;
    setLanguage: (lang: string) => void;
    translate: KeyTranslator;
    fromLanguageDict: DictionaryTranslator;
}

const Context = createContext<I18nContext>({} as I18nContext);

/** Provider that creates and handles state */
export const I18nContextProvider: FC<Props> = ({ children, fallbackLangs }) => {
    const [langCode, setLanguage] = useState<string>("nl_NL");

    const context = {
        langCode,
        setLanguage,
        translate: (id: string) => id, // Currently cannot translate
        fromLanguageDict: pickFromDictionary([langCode, ...fallbackLangs]),
    };

    return <Context.Provider value={context}>{children}</Context.Provider>;
}

interface Props {
    /** 
     * The language that will be used if Wallet content (like attributes)
     * does not have a translation for the current language.
     */
    fallbackLangs: string[];
}

export const useInternationalization = () => {
    return useContext(Context);
};

export type KeyTranslator = (key: string) => string
export type DictionaryTranslator = (dict: Dict<string>) => string

/**
 * Picks from a list of available languages the first
 * according to a priority, or otherwise the first of
 * the available languages.
 */
function pickLanguage(available: string[], priority: string[]) {
    const lang = priority.find(p => available.indexOf(p) >= 0)
    return lang ? lang : available[0];
}

function pickFromDictionary(priority: string[]) {
    return (dict: Dict<string>) => {
        const availableLanguages = Object.keys(dict);
        const chosenLanguage = pickLanguage(availableLanguages, priority);

        return dict[chosenLanguage];
    }
}
