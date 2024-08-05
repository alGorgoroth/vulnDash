import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
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

interface VulnerabilityData {
  pluginID: string;
  pluginName: string;
  severity: string;
  vprScore: string;
  exploitAvailable: string;
  newsworthy: string;
  affectedCount: number;
  ipsAffected: string | string[];
  [key: string]: any; // Allow for additional properties
}

interface SheetData {
  name: string;
  data: VulnerabilityData[];
}

const severityColors: Record<string, string> = {
  Critical: "#ff0000",
  High: "#ff9900",
  Medium: "#ffff00",
  Low: "#00ff00",
};

const App: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <ThemeProvider>
      <FilterProvider>
        <div className={isDarkMode ? 'dark' : ''}>
          <AppContent />
        </div>
      </FilterProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const { filters } = useFilters();
  const [dataLoadedTimestamp, setDataLoadedTimestamp] = useState<number | null>(null);

  const rawData = useMemo(() => {
    const sheet = sheets.find(s => s.name === selectedSheet);
    return sheet ? sheet.data : [];
  }, [sheets, selectedSheet]);

  const filteredData = useMemo(() => {
    console.log('Filtering data. Raw data length:', rawData?.length ?? 0);
    console.log('Raw data sample:', rawData?.slice(0, 5));
    console.log('Current filters:', filters);
    console.log('Current search term:', searchTerm);

    if (!Array.isArray(rawData)) {
      console.error('rawData is not an array:', rawData);
      return [];
    }

    return rawData.filter((item: VulnerabilityData) => {
      if (!item || typeof item !== 'object') {
        console.error('Invalid item in rawData:', item);
        return false;
      }

      const severityCheck = filters.severity.length === 0 || filters.severity.includes(item.severity);
      const pluginIDCheck = filters.pluginID.length === 0 || !filters.pluginID.includes(item.pluginID);
      const affectedCountCheck = (item.affectedCount ?? 0) >= filters.affectedCountRange[0] && (item.affectedCount ?? 0) <= filters.affectedCountRange[1];
      const vprScoreCheck = parseFloat(item.vprScore ?? '0') >= filters.vprScoreRange[0] && parseFloat(item.vprScore ?? '0') <= filters.vprScoreRange[1];
      const exploitAvailableCheck = filters.exploitAvailable === null || item.exploitAvailable === (filters.exploitAvailable ? "Yes" : "No");
      const newsworthyCheck = filters.newsworthy === null || item.newsworthy === (filters.newsworthy ? "Yes" : "No");
      const searchTermCheck = searchTerm === "" || item.pluginName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.pluginID?.includes(searchTerm);

      const result = severityCheck && pluginIDCheck && affectedCountCheck && vprScoreCheck && exploitAvailableCheck && newsworthyCheck && searchTermCheck;

      if (!result) {
        console.log('Item filtered out:', item);
        console.log('Checks:', { severityCheck, pluginIDCheck, affectedCountCheck, vprScoreCheck, exploitAvailableCheck, newsworthyCheck, searchTermCheck });
      }

      return result;
    });
  }, [rawData, filters, searchTerm]);

  const severityCounts = useMemo(() => {
    console.log('Calculating severity counts. Filtered data length:', filteredData?.length ?? 0);
    console.log('Filtered data sample:', filteredData?.slice(0, 5));

    return (filteredData ?? []).reduce<Record<string, number>>((acc, item) => {
      if (item && item.severity) {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
      } else {
        console.error('Invalid item or missing severity:', item);
      }
      return acc;
    }, {});
  }, [filteredData]);

  const pieChartData = useMemo(() => {
    console.log('Preparing pie chart data:', severityCounts);
    return Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
  }, [severityCounts]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      console.log('No file selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name);

      const response = await axios.post<SheetData[]>('http://localhost:3001/api/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response received:', response.status, response.statusText);
      console.log('Response data:', JSON.stringify(response.data).slice(0, 200) + '...');

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('Received data:', response.data);
        setSheets(response.data);
        setSelectedSheet(response.data[0].name);
        setIsDataLoaded(true);
        setDataLoadedTimestamp(Date.now());
        console.log('Data loaded successfully. Total sheets:', response.data.length);
        console.log('First sheet sample:', JSON.stringify(response.data[0].data.slice(0, 2), null, 2));
      } else {
        console.error('Invalid or empty data received:', response.data);
        throw new Error('No valid data received from the server');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      setError('Failed to import data. Please ensure you\'re uploading a valid Excel file.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vulnerabilities.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded && rawData && rawData.length > 0) {
      console.log('Data is loaded and not empty. First item:', rawData[0]);
      console.log('Pie chart data:', pieChartData);
    }
  }, [isDataLoaded, rawData, pieChartData]);

  const theme: Theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      {!isDataLoaded ? (
        <SplashScreen
          onFileSelect={handleImport}
          onSubmit={() => { }}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      ) : (
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
              placeholder="Search vulnerabilities..."
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
        </div>
      )}
    </StyledThemeProvider>
  );
};

export default App;
