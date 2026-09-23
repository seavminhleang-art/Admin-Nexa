import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import i18n from "../../i18n";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("askkh-language");

    return savedLanguage || "km";
  });

  useEffect(() => {
    localStorage.setItem("askkh-language", language);
    document.documentElement.lang = language === "km" ? "km" : "en";
    // Keep the app-wide translation engine in sync with the navbar control.
    i18n.changeLanguage(language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === "km" ? "en" : "km"));
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isKhmer: language === "km",
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider",
    );
  }

  return context;
};
