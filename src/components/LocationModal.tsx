import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from '@/locales/translations';
import { Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Available countries with their currencies and locales for dropdown
const availableCountries = [
  // USD countries
  { code: 'US', name: 'United States', currency: 'USD', locale: 'en-US' },
  { code: 'EC', name: 'Ecuador', currency: 'USD', locale: 'es-ES' },
  { code: 'SV', name: 'El Salvador', currency: 'USD', locale: 'es-ES' },
  { code: 'PA', name: 'Panama', currency: 'USD', locale: 'es-ES' },
  { code: 'PR', name: 'Puerto Rico', currency: 'USD', locale: 'es-ES' },
  
  // EUR countries
  { code: 'DE', name: 'Germany (Deutschland)', currency: 'EUR', locale: 'de-DE' },
  { code: 'FR', name: 'France', currency: 'EUR', locale: 'fr-FR' },
  { code: 'IT', name: 'Italy (Italia)', currency: 'EUR', locale: 'it-IT' },
  { code: 'ES', name: 'Spain (España)', currency: 'EUR', locale: 'es-ES' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', locale: 'pt-BR' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', locale: 'en-US' },
  { code: 'AT', name: 'Austria (Österreich)', currency: 'EUR', locale: 'de-DE' },
  
  // BRL country
  { code: 'BR', name: 'Brasil', currency: 'BRL', locale: 'pt-BR' },
];

const LocationModal: React.FC = () => {
  const { locale, locationData, setLocationData, isLocationModalOpen, setIsLocationModalOpen, confirmLocation } = useLocale();
  const t = useTranslation(locale);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    locationData?.code || undefined
  );

  // Update selectedCountry when locationData changes
  useEffect(() => {
    if (locationData?.code) {
      setSelectedCountry(locationData.code);
    }
  }, [locationData]);

  // Sort countries alphabetically for the dropdown
  const sortedCountries = useMemo(() => {
    return [...availableCountries].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedCountry(value);
    
    // Find the country data
    const country = availableCountries.find(c => c.code === value);
    if (country) {
      // Update locationData in context
      setLocationData({
        country: country.name,
        code: country.code,
        currency: country.currency as any,
        locale: country.locale as any
      });
    }
  };

  const handleSaveCountry = () => {
    if (selectedCountry) {
      // Update the context with the selected country
      confirmLocation();
    }
  };

  return (
    <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t.locationModal.whereAreYou}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={selectedCountry} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.locationModal.selectCountry} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                {sortedCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSaveCountry}
            className="bg-meta-orange hover:bg-meta-orange/90"
            disabled={!selectedCountry}
          >
            {t.common.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
