import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Define available locales
export type Locale = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT';

// Define currency types
export type CurrencyType = 'BRL' | 'USD' | 'EUR';

// Define country data structure
type CountryData = {
  name: string;
  code: string;
  currency: CurrencyType;
  locale: Locale;
};

// Define location data structure
type LocationData = {
  country: string;
  code: string;
  currency: CurrencyType;
  locale: Locale;
};

// Define context structure
type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locationData: LocationData | null;
  setLocationData: (locationData: LocationData | null) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (isOpen: boolean) => void;
  confirmLocation: () => void;
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  exchangeRates: Record<CurrencyType, number>;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Available countries with their currencies and locales
const availableCountries: Record<string, CountryData> = {
  // USD countries
  'US': { name: 'United States', code: 'US', currency: 'USD', locale: 'en-US' },
  'EC': { name: 'Ecuador', code: 'EC', currency: 'USD', locale: 'es-ES' },
  'SV': { name: 'El Salvador', code: 'SV', currency: 'USD', locale: 'es-ES' },
  'PA': { name: 'Panama', code: 'PA', currency: 'USD', locale: 'es-ES' },
  'PR': { name: 'Puerto Rico', code: 'PR', currency: 'USD', locale: 'es-ES' },
  
  // EUR countries
  'DE': { name: 'Germany', code: 'DE', currency: 'EUR', locale: 'de-DE' },
  'FR': { name: 'France', code: 'FR', currency: 'EUR', locale: 'fr-FR' },
  'IT': { name: 'Italy', code: 'IT', currency: 'EUR', locale: 'it-IT' },
  'ES': { name: 'Spain', code: 'ES', currency: 'EUR', locale: 'es-ES' },
  'PT': { name: 'Portugal', code: 'PT', currency: 'EUR', locale: 'pt-BR' },
  'IE': { name: 'Ireland', code: 'IE', currency: 'EUR', locale: 'en-US' },
  'AT': { name: 'Austria', code: 'AT', currency: 'EUR', locale: 'de-DE' },
  
  // BRL country
  'BR': { name: 'Brasil', code: 'BR', currency: 'BRL', locale: 'pt-BR' },
};

// Map language codes to country codes for automatic detection
const languageToCountryMap: Record<string, string> = {
  'pt': 'BR',
  'pt-BR': 'BR',
  'en': 'US',
  'en-US': 'US',
  'en-GB': 'IE',
  'es': 'ES',
  'es-ES': 'ES',
  'fr': 'FR',
  'fr-FR': 'FR',
  'de': 'DE',
  'de-DE': 'DE',
  'it': 'IT',
  'it-IT': 'IT',
};

// Fixed exchange rates (approximations)
const exchangeRates = {
  BRL: 1,
  USD: 0.18, // 1 BRL = 0.18 USD
  EUR: 0.16, // 1 BRL = 0.16 EUR
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('pt-BR'); // Default to Portuguese
  const [currency, setCurrency] = useState<CurrencyType>('BRL'); // Default to BRL
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Detect location on first load
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Check if user has already selected a country
        const savedLocale = localStorage.getItem('meta-constructor-locale') as Locale | null;
        const savedCountry = localStorage.getItem('meta-constructor-country') as string | null;
        const hasShownLocationPrompt = localStorage.getItem('meta-constructor-location-shown');
        
        if (savedLocale && savedCountry && availableCountries[savedCountry]) {
          const country = availableCountries[savedCountry];
          setLocale(savedLocale);
          setCurrency(country.currency);
          setLocationData({
            country: country.name,
            code: country.code,
            currency: country.currency,
            locale: country.locale
          });
          return;
        }
        
        if (!hasShownLocationPrompt) {
          // Try to detect the user's language from the browser
          const browserLanguage = navigator.language;
          const browserLanguages = navigator.languages || [browserLanguage];
          
          // Try to find a matching country code from browser language
          let detectedCountryCode = null;
          for (const lang of browserLanguages) {
            const baseLanguage = lang.split('-')[0]; // e.g., get 'pt' from 'pt-BR'
            
            // First try the full language code, then the base language
            if (languageToCountryMap[lang]) {
              detectedCountryCode = languageToCountryMap[lang];
              break;
            } else if (languageToCountryMap[baseLanguage]) {
              detectedCountryCode = languageToCountryMap[baseLanguage];
              break;
            }
          }
          
          // If we found a matching country, use it
          if (detectedCountryCode && availableCountries[detectedCountryCode]) {
            const country = availableCountries[detectedCountryCode];
            setLocationData({
              country: country.name,
              code: country.code,
              currency: country.currency,
              locale: country.locale
            });
          } else {
            // Fallback to Brasil if we can't detect the country
            const country = availableCountries['BR'];
            setLocationData({
              country: country.name,
              code: country.code,
              currency: country.currency,
              locale: country.locale
            });
          }
          
          setIsLocationModalOpen(true);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        toast.error('Erro ao detectar sua localização');
        
        // Fallback to Brasil on error
        const country = availableCountries['BR'];
        setLocationData({
          country: country.name,
          code: country.code,
          currency: country.currency,
          locale: country.locale
        });
        setIsLocationModalOpen(true);
      }
    };
    
    detectLocation();
  }, []);

  const confirmLocation = () => {
    if (locationData) {
      setLocale(locationData.locale);
      setCurrency(locationData.currency);
      localStorage.setItem('meta-constructor-locale', locationData.locale);
      localStorage.setItem('meta-constructor-country', locationData.code);
      localStorage.setItem('meta-constructor-location-shown', 'true');
      setIsLocationModalOpen(false);

      const localizedSuccessMessage = 
        locationData.locale === 'pt-BR' ? 'Localização confirmada!' :
        locationData.locale === 'en-US' ? 'Location confirmed!' :
        locationData.locale === 'es-ES' ? '¡Ubicación confirmada!' :
        locationData.locale === 'fr-FR' ? 'Emplacement confirmé !' :
        'Standort bestätigt!';
        
      toast.success(localizedSuccessMessage);
    }
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        locationData,
        setLocationData,
        isLocationModalOpen,
        setIsLocationModalOpen,
        confirmLocation,
        currency,
        setCurrency,
        exchangeRates
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
