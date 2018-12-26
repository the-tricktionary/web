interface ShopState {
  cart: Cart;
  currency: string;
  customerDetails?: CustomerDetails;
}

interface ProductObject {
  id: string;

  name: string;
  description?: string;
  prices: Prices;
  vat: number;
  qty: number;
  image?: string;
  unit?: string;
  skus: Skus;
  'test-skus': Skus;
}

interface Skus {
  [prop: string]: string;
}

interface Cart {
  [prop: string]: number;
}

interface Prices {
  [prop: string]: number;
}

interface CustomerDetails {
  name: string;
  address1: string;
  address2: string;
  countryCode: string;
  postalCode: string;
  state: string;
  city: string;

  email: string;
  phone: string;

  company: string;
  vatnumber: string;
  vatValid: boolean;
}

interface StripeItem {
  sku: string;
  quantity: number;
}

interface PostCountry {
  [prop: string]: any;
}
