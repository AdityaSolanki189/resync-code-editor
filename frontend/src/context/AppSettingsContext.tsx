import { createContext, useEffect, useMemo, useState } from "react";

export interface IAppSettings {
    theme: string;
    setTheme: (theme: string) => void;
    language: string;
    setLanguage: (language: string) => void;
    fontSize: string;
    setFontSize: (fontSize: string) => void;
    fontFamily: string;
    setFontFamily: (fontFamily: string) => void;
}

const defaultSettings: IAppSettings = {
    theme: "Dracula",
    language: "Javascript",
    fontSize: "16px",
    fontFamily: "Space Mono",
    setTheme: () => {},
    setLanguage: () => {},
    setFontSize: () => {},
    setFontFamily: () => {},
}

export const AppSettingsContext = createContext<IAppSettings>(defaultSettings);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const storedSettings = localStorage.getItem("settings");
    const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};

    const storedTheme =
        parsedSettings.theme !== undefined
            ? parsedSettings.theme
            : defaultSettings.theme;

    const storedLanguage =
        parsedSettings.language !== undefined
            ? parsedSettings.language
            : defaultSettings.language;

    const storedFontSize =
        parsedSettings.fontSize !== undefined
            ? parsedSettings.fontSize
            : defaultSettings.fontSize;

    const storedFontFamily =
        parsedSettings.fontFamily !== undefined
            ? parsedSettings.fontFamily
            : defaultSettings.fontFamily;

    const [theme, setTheme] = useState<string>(storedTheme);
    const [language, setLanguage] = useState<string>(storedLanguage);
    const [fontSize, setFontSize] = useState<string>(storedFontSize);
    const [fontFamily, setFontFamily] = useState<string>(storedFontFamily);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const resetSettings = () => {
        setTheme(defaultSettings.theme);
        setLanguage(defaultSettings.language);
        setFontSize(defaultSettings.fontSize);
        setFontFamily(defaultSettings.fontFamily);
    }

    useEffect(() => {
        // Save settings to local storage whenever they change
        const updatedSettings = {
            theme,
            language,
            fontSize,
            fontFamily,
        }
        localStorage.setItem("settings", JSON.stringify(updatedSettings));
    }, [theme, language, fontSize, fontFamily]);

    const contextValue = useMemo(() => ({
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        resetSettings,
    }), [theme, setTheme, language, setLanguage, fontSize, setFontSize, fontFamily, setFontFamily, resetSettings]);

    return (
        <AppSettingsContext.Provider value={contextValue}>
            {children}
        </AppSettingsContext.Provider>
    );
}
