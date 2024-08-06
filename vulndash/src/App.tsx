import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { lightTheme, darkTheme, Theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import { FilterProvider, useFilters } from './features/filtering/FilterContext';
import FilterPanel from './features/filtering/FilterPanel';
import HostPage from './components/pages/HostPage';
import VulnerabilityPage from './components/pages/VulnerabilityPage';

// ... (keep the existing interfaces and constants)

const App: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <ThemeProvider>
      <FilterProvider>
        <div className={isDarkMode ? 'dark' : ''}>
          <Router>
            <AppContent />
          </Router>
        </div>
      </FilterProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  // ... (keep the existing state and functions)

  const theme: Theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <Routes>
        <Route path="/" element={
          !isDataLoaded ? (
            <SplashScreen
              onFileSelect={handleImport}
              onSubmit={() => { }}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          ) : (
            <DashboardContent
              error={error}
              isLoading={isLoading}
              handleImport={handleImport}
              handleExport={handleExport}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSheet={selectedSheet}
              setSelectedSheet={setSelectedSheet}
              sheets={sheets}
              dataLoadedTimestamp={dataLoadedTimestamp}
              pieChartData={pieChartData}
              filteredHosts={filteredHosts}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          )
        } />
        <Route path="/host/:hostId" element={<HostPage hostId="" />} />
        <Route path="/vulnerability/:vulnerabilityId" element={<VulnerabilityPage vulnerabilityId="" />} />
      </Routes>
    </StyledThemeProvider>
  );
};

const DashboardContent: React.FC<{
  error: string | null;
  isLoading: boolean;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleExport: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSheet: string;
  setSelectedSheet: (sheet: string) => void;
  sheets: SheetData[];
  dataLoadedTimestamp: number | null;
  pieChartData: { name: string; value: number }[];
  filteredHosts: HostData[];
  isDarkMode: boolean;
  toggleTheme: () => void;
}> = ({
  error,
  isLoading,
  handleImport,
  handleExport,
  searchTerm,
  setSearchTerm,
  selectedSheet,
  setSelectedSheet,
  sheets,
  dataLoadedTimestamp,
  pieChartData,
  filteredHosts,
  isDarkMode,
  toggleTheme,
}) => {
    return (
      <div className="p-4 space-y-4 bg-background text-foreground">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hacks Up Display</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="flex space-x-4">
          <Input
            type="file"
            onChange={handleImport}
            accept=".xlsx, .xls"
            disabled={isLoading}
          />
          <Button onClick={handleExport} disabled={isLoading}>
            Export Data (Excel)
          </Button>
          <Input
            type="text"
            placeholder="Search vulnerabilities or hosts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sheet" />
            </SelectTrigger>
            <SelectContent>
              {sheets.map((sheet) => (
                <SelectItem key={sheet.name} value={sheet.name}>
                  {sheet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {dataLoadedTimestamp && (
          <div className="text-green-500">
            Data loaded successfully at {new Date(dataLoadedTimestamp).toLocaleTimeString()}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <FilterPanel />
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerabilities by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={severityColors[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div>No data available for the chart</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtered Hosts and Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHosts.map(host => (
                <div key={host.id} className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold">
                    <Link to={`/host/${host.id}`} className="text-blue-500 hover:underline">
                      {host.name} ({host.ip})
                    </Link>
                  </h3>
                  <p>Operating System: {host.operatingSystem}</p>
                  <h4 className="text-md font-semibold mt-2">Vulnerabilities:</h4>
                  <ul className="list-disc pl-5">
                    {host.vulnerabilities.map(vuln => (
                      <li key={vuln.pluginID}>
                        <Link to={`/vulnerability/${vuln.pluginID}`} className="text-blue-500 hover:underline">
                          {vuln.pluginName} - Severity: {vuln.severity}, CVSS: {vuln.cvssScore}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

export default App;
