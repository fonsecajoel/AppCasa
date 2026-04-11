export interface Address {
  street: string;
  number: string;
  lot?: string;
  floor?: string;
  door?: string;
  postalCode: string;
  locality: string;
  municipality: string;
  district: string;
  country: string;
}

export interface Property {
  id: string;
  name: string;
  matricialArticle?: string;
  usageLicense?: string;
  energyCertificate?: string;
  type: 'Moradia' | 'Apartamento' | 'Garagem/Box' | 'Armazém' | 'Loja' | 'Espaço Comercial';
  typology: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8' | 'T9';
  area: number;
  address: Address;
  observations?: string;
  ownerId: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  type: 'Habitação Completa' | 'Quarto Individual' | 'Quarto Partilhado' | 'Assoalhada' | 'Anexo';
  name: string;
  inventory?: string[];
  ownerId: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  nif: string;
  documentType?: 'Cartão de Cidadão' | 'Bilhete de Identidade' | 'Passaporte' | 'Título de Residência' | 'Autorização de Residência' | 'Cartão de Residência UE';
  documentNumber?: string;
  documentValidity?: string;
  nationality?: string;
  birthDate?: string;
  address?: Address;
  phone?: string;
  email?: string;
  profession?: string;
  emergencyContact?: string;
  ownerId: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  unitId: string;
  tenantIds: string[];
  type: 'Com Prazo Certo' | 'Sem Termo' | 'De Curta Duração' | 'Arrendamento de Quarto' | 'Comodato';
  startDate: string;
  endDate?: string;
  rentAmount: number;
  paymentDay: number;
  depositAmount: number;
  firstRentAmount: number;
  lastRentAmount: number;
  observations?: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Terminated';
  ownerId: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  type: 'Renda' | 'Despesa' | 'Encargo';
  category?: string;
  amount: number;
  dueDate: string;
  day?: number;
  month?: string;
  frequency?: 'Anual' | 'Semestral' | 'Trimestral' | 'Mensal' | 'Único';
  nextDueDate?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'Pending' | 'Paid' | 'Late';
  description?: string;
  ownerId: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  type: 'Renda' | 'Despesa' | 'Caução' | 'Outro';
  amount: number;
  dueDate: string;
  status: 'Emitido' | 'Por Emitir' | 'Anulado';
  month: string;
  category?: string;
  method?: 'Fatura' | 'Contagem Manual' | 'Valor Fixo';
  previousReading?: number;
  currentReading?: number;
  pricePerUnit?: number;
  ownerId: string;
  createdAt: string;
}

export interface LandlordExpense {
  id: string;
  propertyId: string;
  type: 'IMI' | 'AIMI' | 'Condomínio' | 'Seguro' | 'Prestação ao Banco' | 'Licenças' | 'Outros';
  amount: number;
  frequency: 'Anual' | 'Semestral' | 'Trimestral' | 'Mensal' | 'Único';
  dueDate: string;
  nextDueDate?: string;
  status: 'Pending' | 'Paid' | 'Late';
  description?: string;
  ownerId: string;
  createdAt: string;
}

export type LandlordCharge = LandlordExpense;

export interface Movement {
  id: string;
  propertyId: string;
  unitId: string;
  type: 'Entrada' | 'Saída';
  amount: number;
  date: string;
  status: 'Concluído' | 'Pendente' | 'Cancelado';
  description: string;
  ownerId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  propertyId: string;
  unitId?: string;
  type: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Paid';
  description?: string;
  ownerId: string;
  method?: 'Fatura' | 'Contagem Manual' | 'Valor Fixo';
  previousReading?: number;
  currentReading?: number;
  pricePerUnit?: number;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  unitId?: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In-Progress' | 'Closed';
  ownerId: string;
  createdAt: string;
}
