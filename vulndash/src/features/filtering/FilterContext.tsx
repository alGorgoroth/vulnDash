import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  severity: string[];
  pluginID: string[];
  affectedCountRange: [number, number];
  vprScoreRange: [number, number];
  cvssScoreRange: [number, number];
  exploitAvailable: boolean | null;
  newsworthy: boolean | null;
  remediationStatus: ('Open' | 'In Progress' | 'Closed')[];
  ageRange: [number, number];
  assetCriticality: ('High' | 'Medium' | 'Low')[];
  patchAvailable: boolean | null;
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  severity: [],
  pluginID: [],
  affectedCountRange: [0, Infinity],
  vprScoreRange: [0, 10],
  cvssScoreRange: [0, 10],
  exploitAvailable: null,
  newsworthy: null,
  remediationStatus: [],
  ageRange: [0, Infinity],
  assetCriticality: [],
  patchAvailable: null,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const resetFilters = () => setFilters(initialFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
