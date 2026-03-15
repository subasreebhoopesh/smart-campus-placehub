import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { companies as initialCompanies } from '@/lib/data';
import { api } from '@/services/api';

interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  jobRoles: string[];
  packageOffered: { min: number; max: number };
  visitHistory: Array<{ date: string; studentsHired: number }>;
  createdAt: string;
}

interface CompaniesContextType {
  companies: Company[];
  addCompany: (company: Company) => Promise<void>;
  updateCompany: (id: string, company: Company) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  loadCompanies: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load companies from backend on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await api.companies.getAll();
      if (response.success && response.companies) {
        setCompanies(response.companies);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load companies:', error);
      // Fallback to initial companies if API fails
      setCompanies(initialCompanies);
      setIsLoaded(true);
    }
  };

  const addCompany = async (company: Company) => {
    try {
      const response = await api.companies.create(company);
      if (response.success && response.company) {
        setCompanies([...companies, response.company]);
      }
    } catch (error) {
      console.error('Failed to add company:', error);
      // Fallback to local state
      setCompanies([...companies, company]);
    }
  };

  const updateCompany = async (id: string, updatedCompany: Company) => {
    try {
      const response = await api.companies.update(parseInt(id), updatedCompany);
      if (response.success) {
        setCompanies(companies.map(company => 
          company.id === id ? updatedCompany : company
        ));
      }
    } catch (error) {
      console.error('Failed to update company:', error);
      // Fallback to local state
      setCompanies(companies.map(company => 
        company.id === id ? updatedCompany : company
      ));
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const response = await api.companies.delete(parseInt(id));
      if (response.success) {
        setCompanies(companies.filter(company => company.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
      // Fallback to local state
      setCompanies(companies.filter(company => company.id !== id));
    }
  };

  return (
    <CompaniesContext.Provider value={{ companies, addCompany, updateCompany, deleteCompany, loadCompanies }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider');
  }
  return context;
}
