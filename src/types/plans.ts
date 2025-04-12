
export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}
