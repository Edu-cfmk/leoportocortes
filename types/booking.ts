export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: string | number;       // Permitir string ou number
  price_in_cents?: number;       // Valor em centavos salvo pelo admin
  duration: string;
  category?: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface BookingData {
  clientName: string;
  clientPhone: string;
  services: Service[];
  barber: any | null;
  date: string;
  time: string;
}