import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VulnerabilityData {
  pluginID: string;
  pluginName: string;
  severity: string;
  vprScore: number;
  exploitAvailable: boolean;
  newsworthy: boolean;
  affectedCount: number;
  ipsAffected: string;
}

interface DashboardProps {
  data: VulnerabilityData[];
}

const COLORS = {
  Critical: '#ff0000',
  High: '#ff9900',
  Medium: '#ffff00',
  Low: '#00ff00',

};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vprRange, setVprRange] = useState([0, 10]);
  const [showExploitable, setShowExploitable] = useState(false);

  const [showNewsworthy, setShowNewsworthy] = useState(false);

  const filteredData = useMemo(() => 

    data.filter(item => 
      (item.pluginName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.pluginID.includes(searchTerm)) &&
      item.vprScore >= vprRange[0] && item.vprScore <= vprRange[1] &&
      (!showExploitable || item.exploitAvailable) &&
      (!showNewsworthy || item.newsworthy)
    ),

    [data, searchTerm, vprRange, showExploitable, showNewsworthy]

  );


  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    filteredData.forEach(item => {
      if (counts[item.severity]) {
        counts[item.severity]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const topVulnerabilities = useMemo(() => 

    [...filteredData]
      .sort((a, b) => b.affectedCount - a.affectedCount)
      .slice(0, 10),
    [filteredData]
  );

  const scatterData = useMemo(() => 
    filteredData.map(item => ({
      x: item.vprScore,
      y: item.affectedCount,
      z: item.severity,
      name: item.pluginName,
    })),

    [filteredData]
  );

  const handleExport = () => {
    // Implement export functionality

    console.log('Export functionality to be implemented');

  };


  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Vulnerability Dashboard</h1>
      
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search vulnerabilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleExport}>Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>VPR Score Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              min={0}
              max={10}
              step={0.1}
              value={vprRange}

              onValueChange={setVprRange}
            />
            <div className="flex justify-between mt-2">
              <span>{vprRange[0]}</span>
              <span>{vprRange[1]}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch

                id="exploitable"
                checked={showExploitable}
                onCheckedChange={setShowExploitable}
              />
              <Label htmlFor="exploitable">Show only exploitable</Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="newsworthy"
                checked={showNewsworthy}
                onCheckedChange={setShowNewsworthy}
              />
              <Label htmlFor="newsworthy">Show only newsworthy</Label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>

          </CardHeader>
          <CardContent>
            <p>Total Vulnerabilities: {filteredData.length}</p>

            <p>Exploitable: {filteredData.filter(item => item.exploitAvailable).length}</p>
            <p>Newsworthy: {filteredData.filter(item => item.newsworthy).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>

          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {severityCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Top 10 Vulnerabilities</CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topVulnerabilities}>
                <XAxis dataKey="pluginName" tick={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="affectedCount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>

        <CardHeader>
          <CardTitle>VPR Score vs Affected Count</CardTitle>

        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <XAxis dataKey="x" name="VPR Score" />
              <YAxis dataKey="y" name="Affected Count" />
              <ZAxis dataKey="z" name="Severity" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />

              <Scatter name="Vulnerabilities" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vulnerability Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin ID</TableHead>
                <TableHead>Plugin Name</TableHead>

                <TableHead>Severity</TableHead>
                <TableHead>VPR Score</TableHead>
                <TableHead>Exploitable</TableHead>

                <TableHead>Newsworthy</TableHead>
                <TableHead>Affected Count</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.pluginID}>
                  <TableCell>{item.pluginID}</TableCell>
                  <TableCell>{item.pluginName}</TableCell>
                  <TableCell>{item.severity}</TableCell>

                  <TableCell>{item.vprScore.toFixed(2)}</TableCell>
                  <TableCell>{item.exploitAvailable ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{item.newsworthy ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{item.affectedCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
