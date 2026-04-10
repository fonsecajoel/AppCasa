import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Address } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address?: Address | string): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  
  const parts = [
    address.street,
    address.number ? `n.º ${address.number}` : '',
    address.lot ? `Lote ${address.lot}` : '',
    address.floor ? `${address.floor}º` : '',
    address.door,
    address.postalCode,
    address.locality,
    address.municipality,
    address.district,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
}
