import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Address } from '../types';
import { toast } from 'sonner';

interface AddressInputProps {
  value: Address;
  onChange: (value: Address) => void;
}

export function AddressInput({ value, onChange }: AddressInputProps) {
  const [loading, setLoading] = useState(false);
  const [lastFetchedCP, setLastFetchedCP] = useState('');

  const handleChange = (field: keyof Address, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const handlePostalCodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 7);
    const formatted = digits.length > 4
      ? `${digits.slice(0, 4)}-${digits.slice(4)}`
      : digits;
    handleChange('postalCode', formatted);
  };

  const fetchAddress = async (cp: string) => {
    if (!/^\d{4}-\d{3}$/.test(cp)) return;
    if (cp === lastFetchedCP) return;
    
    setLoading(true);
    setLastFetchedCP(cp);
    try {
      const response = await fetch(`https://json.geoapi.pt/cp/${cp.replace('-', '')}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          const street = data.partes?.[0]?.['Artéria'] || data.partes?.[0]?.arteria || '';
          onChange({
            ...value,
            postalCode: cp,
            locality: data.Localidade || data.localidade || value.locality,
            municipality: data.Concelho || data.concelho || value.municipality,
            district: data.Distrito || data.distrito || value.district,
            street: street || value.street,
          });
          toast.success('Morada preenchida automaticamente');
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value.postalCode.length === 8) {
      fetchAddress(value.postalCode);
    }
  }, [value.postalCode]);

  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="country">País</Label>
          <Select 
            value={value.country || 'Portugal'} 
            onValueChange={(v) => handleChange('country', v)}
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Selecionar país" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Portugal">Portugal</SelectItem>
              <SelectItem value="Espanha">Espanha</SelectItem>
              <SelectItem value="França">França</SelectItem>
              <SelectItem value="Brasil">Brasil</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="postalCode">Código Postal</Label>
          <Input 
            id="postalCode" 
            placeholder="0000-000" 
            value={value.postalCode} 
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            className={loading ? 'opacity-50' : ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="locality">Localidade</Label>
          <Input 
            id="locality" 
            value={value.locality} 
            onChange={(e) => handleChange('locality', e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="municipality">Concelho</Label>
          <Input 
            id="municipality" 
            value={value.municipality} 
            onChange={(e) => handleChange('municipality', e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="district">Distrito</Label>
          <Input 
            id="district" 
            value={value.district} 
            onChange={(e) => handleChange('district', e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3 grid gap-2">
          <Label htmlFor="street">Rua</Label>
          <Input 
            id="street" 
            value={value.street} 
            onChange={(e) => handleChange('street', e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="number">N.º Rua</Label>
          <Input 
            id="number" 
            value={value.number} 
            onChange={(e) => handleChange('number', e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="lot">Lote</Label>
          <Input 
            id="lot" 
            value={value.lot} 
            onChange={(e) => handleChange('lot', e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="floor">Andar</Label>
          <Input 
            id="floor" 
            value={value.floor} 
            onChange={(e) => handleChange('floor', e.target.value)} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="door">Porta/Loja/...</Label>
          <Input 
            id="door" 
            value={value.door} 
            onChange={(e) => handleChange('door', e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
}
