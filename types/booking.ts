export interface Service {
  id: string
  name: string
  price: string
  duration: string 
}

export interface Barber {
  id: string
  name: string
  role: string
}

export interface BookingData {
  clientName: string
  clientPhone: string
  service: Service | null
  barber: Barber | null
  date: string
  time: string
}