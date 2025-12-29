import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useReferralTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    
    if (refCode) {
      // Armazenar código de referência no localStorage
      localStorage.setItem("referral_code", refCode);
    }
  }, [searchParams]);

  const getReferralCode = (): string | null => {
    return localStorage.getItem("referral_code");
  };

  const clearReferralCode = () => {
    localStorage.removeItem("referral_code");
  };

  return {
    getReferralCode,
    clearReferralCode,
  };
};
