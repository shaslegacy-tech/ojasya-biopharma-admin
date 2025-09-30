// types/hospital.ts
export interface Hospital {
  _id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  dlNumber: string;
  gstNumber: string;
  createdAt: string;
  updatedAt: string;
    approved: boolean;
}
