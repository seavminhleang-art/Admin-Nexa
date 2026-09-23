import { useTranslation } from "react-i18next";

export function useWorkspaceTranslation() {
  const { t, i18n } = useTranslation("workspace");
  const w = (text, values) =>
    typeof text === "string"
      ? t(text, {
          ...values,
          defaultValue: text,
          keySeparator: false,
          nsSeparator: false,
        })
      : text;
  return { w, locale: i18n.resolvedLanguage === "km" ? "km-KH" : "en-US" };
}
