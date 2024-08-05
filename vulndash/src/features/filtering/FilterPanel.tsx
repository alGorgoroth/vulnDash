import React from 'react';
import { useFilters } from './FilterContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const FilterPanel: React.FC = () => {
  const { filters, setFilters, resetFilters } = useFilters();

  const handleSeverityChange = (severity: string) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity.includes(severity)
        ? prev.severity.filter(s => s !== severity)
        : [...prev.severity, severity]
    }));
  };

  const handlePluginIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, pluginID: e.target.value.split(',').map(id => id.trim()) }));
  };

  const handleAffectedCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [min, max] = e.target.value.split(',').map(Number);
    setFilters(prev => ({ ...prev, affectedCountRange: [min, max || Infinity] }));
  };

  const handleVPRScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [min, max] = e.target.value.split(',').map(Number);
    setFilters(prev => ({ ...prev, vprScoreRange: [min, max] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Vulnerabilities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Severity</Label>
            <div className="flex space-x-2">
              {['Critical', 'High', 'Medium', 'Low'].map(severity => (
                <Label key={severity} className="flex items-center space-x-2">
                  <Switch
                    checked={filters.severity.includes(severity)}
                    onCheckedChange={() => handleSeverityChange(severity)}
                  />
                  <span>{severity}</span>
                </Label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="pluginID">Plugin IDs to exclude (comma-separated)</Label>
            <Input
              id="pluginID"
              value={filters.pluginID.join(', ')}
              onChange={handlePluginIDChange}
              placeholder="e.g. 19506, 10180"
            />
          </div>

          <div>
            <Label htmlFor="affectedCount">Affected Count Range (min,max)</Label>
            <Input
              id="affectedCount"
              value={`${filters.affectedCountRange[0]},${filters.affectedCountRange[1] === Infinity ? '' : filters.affectedCountRange[1]}`}
              onChange={handleAffectedCountChange}
              placeholder="e.g. 0,100"
            />
          </div>

          <div>
            <Label htmlFor="vprScore">VPR Score Range (min,max)</Label>
            <Input
              id="vprScore"
              value={`${filters.vprScoreRange[0]},${filters.vprScoreRange[1]}`}
              onChange={handleVPRScoreChange}
              placeholder="e.g. 0,10"
            />
          </div>

          <div>
            <Label className="flex items-center space-x-2">
              <Switch
                checked={filters.exploitAvailable === true}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, exploitAvailable: checked ? true : null }))}
              />
              <span>Exploit Available</span>
            </Label>
          </div>

          <div>
            <Label className="flex items-center space-x-2">
              <Switch
                checked={filters.newsworthy === true}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, newsworthy: checked ? true : null }))}
              />
              <span>Newsworthy</span>
            </Label>
          </div>

          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
