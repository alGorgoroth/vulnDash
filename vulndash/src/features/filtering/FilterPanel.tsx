import React from 'react';
import { useFilters } from './FilterContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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

  const handleCVSSScoreChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, cvssScoreRange: value as [number, number] }));
  };

  const handleRemediationStatusChange = (status: 'Open' | 'In Progress' | 'Closed') => {
    setFilters(prev => ({
      ...prev,
      remediationStatus: prev.remediationStatus.includes(status)
        ? prev.remediationStatus.filter(s => s !== status)
        : [...prev.remediationStatus, status]
    }));
  };

  const handleAgeRangeChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, ageRange: value as [number, number] }));
  };

  const handleAssetCriticalityChange = (criticality: 'High' | 'Medium' | 'Low') => {
    setFilters(prev => ({
      ...prev,
      assetCriticality: prev.assetCriticality.includes(criticality)
        ? prev.assetCriticality.filter(c => c !== criticality)
        : [...prev.assetCriticality, criticality]
    }));
  };

  const handlePatchAvailableChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, patchAvailable: checked ? true : null }));
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
            <Label htmlFor="cvssScore">CVSS Score Range</Label>
            <Slider
              id="cvssScore"
              min={0}
              max={10}
              step={0.1}
              value={filters.cvssScoreRange}
              onValueChange={handleCVSSScoreChange}
            />
            <div className="flex justify-between text-xs mt-1">
              <span>{filters.cvssScoreRange[0]}</span>
              <span>{filters.cvssScoreRange[1]}</span>
            </div>
          </div>

          <div>
            <Label>Remediation Status</Label>
            <div className="flex space-x-2">
              {['Open', 'In Progress', 'Closed'].map(status => (
                <Label key={status} className="flex items-center space-x-2">
                  <Switch
                    checked={filters.remediationStatus.includes(status as 'Open' | 'In Progress' | 'Closed')}
                    onCheckedChange={() => handleRemediationStatusChange(status as 'Open' | 'In Progress' | 'Closed')}
                  />
                  <span>{status}</span>
                </Label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="ageRange">Vulnerability Age Range (days)</Label>
            <Slider
              id="ageRange"
              min={0}
              max={365}
              step={1}
              value={filters.ageRange}
              onValueChange={handleAgeRangeChange}
            />
            <div className="flex justify-between text-xs mt-1">
              <span>{filters.ageRange[0]}</span>
              <span>{filters.ageRange[1] === Infinity ? 'Max' : filters.ageRange[1]}</span>
            </div>
          </div>

          <div>
            <Label>Asset Criticality</Label>
            <div className="flex space-x-2">
              {['High', 'Medium', 'Low'].map(criticality => (
                <Label key={criticality} className="flex items-center space-x-2">
                  <Switch
                    checked={filters.assetCriticality.includes(criticality as 'High' | 'Medium' | 'Low')}
                    onCheckedChange={() => handleAssetCriticalityChange(criticality as 'High' | 'Medium' | 'Low')}
                  />
                  <span>{criticality}</span>
                </Label>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center space-x-2">
              <Switch
                checked={filters.patchAvailable === true}
                onCheckedChange={handlePatchAvailableChange}
              />
              <span>Patch Available</span>
            </Label>
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
