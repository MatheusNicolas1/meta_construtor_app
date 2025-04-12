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
          // For demo purposes, select a random country
          const countryCodes = Object.keys(availableCountries);
          const randomCountry = countryCodes[Math.floor(Math.random() * countryCodes.length)];
          const country = availableCountries[randomCountry];
          
          setLocationData({
            country: country.name,
            code: country.code,
            currency: country.currency,
            locale: country.locale
          });
          
          setIsLocationModalOpen(true);
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        toast.error('Erro ao detectar sua localização');
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
