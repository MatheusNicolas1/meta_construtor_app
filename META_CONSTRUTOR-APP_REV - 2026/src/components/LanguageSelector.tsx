import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { supportedLanguages } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const LanguageSelector = memo(() => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 touch-safe"
          title={t('language.select')}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-semibold">
          {t('language.select')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {supportedLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={cn(
                "cursor-pointer flex items-center gap-3 px-3 py-2",
                i18n.language === language.code && "bg-accent"
              )}
            >
              <span className="text-xl" role="img" aria-label={language.name}>
                {language.flag}
              </span>
              <span className="flex-1 text-sm">{language.name}</span>
              {i18n.language === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

LanguageSelector.displayName = "LanguageSelector";
