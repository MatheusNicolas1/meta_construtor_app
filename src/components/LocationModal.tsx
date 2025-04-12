
import React, { useState, useMemo } from 'react';
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
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'EC', name: 'Ecuador', currency: 'USD' },
  { code: 'SV', name: 'El Salvador', currency: 'USD' },
  { code: 'PA', name: 'Panama', currency: 'USD' },
  { code: 'PR', name: 'Puerto Rico', currency: 'USD' },
  
  // EUR countries
  { code: 'DE', name: 'Germany (Deutschland)', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'IT', name: 'Italy (Italia)', currency: 'EUR' },
  { code: 'ES', name: 'Spain (España)', currency: 'EUR' },
  { code: 'PT', name: 'Portugal', currency: 'EUR' },
  { code: 'IE', name: 'Ireland', currency: 'EUR' },
  { code: 'AT', name: 'Austria (Österreich)', currency: 'EUR' },
  
  // BRL country
  { code: 'BR', name: 'Brasil', currency: 'BRL' },
];

const LocationModal: React.FC = () => {
  const { locale, locationData, isLocationModalOpen, setIsLocationModalOpen, confirmLocation, setLocale } = useLocale();
  const t = useTranslation(locale);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    locationData?.code || undefined
  );

  // Sort countries alphabetically for the dropdown
  const sortedCountries = useMemo(() => {
    return [...availableCountries].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedCountry(value);
    
    // Find the country data
    const country = availableCountries.find(c => c.code === value);
    if (country) {
      // Update locationData in context (we'll need to enhance the context for this)
      // This is a simplified version, the real implementation will be in the LocaleContext
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
