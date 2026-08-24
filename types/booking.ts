export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

export interface Barber {
  id: string
  name: string
  role: string
}

export interface BookingData {
  clientName: string;
  clientPhone: string;
  services: Service[]; // Mudou de 'service: Service | null' para 'services: Service[]'
  barber: any | null;
  date: string;
  time: string;
}