import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HostData {
  id: string;
  name: string;
  ip: string;
  operatingSystem: string;
  vulnerabilities: VulnerabilityData[];
}

interface VulnerabilityData {
  pluginID: string;
  pluginName: string;
  severity: string;
  cvssScore: string;
}

const HostPage: React.FC = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const [hostData, setHostData] = useState<HostData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHostData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Replace this with your actual API endpoint
        const response = await fetch(`/api/host/${hostId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch host data');
        }
        const data = await response.json();
        setHostData(data);
      } catch (err) {
        setError('An error occurred while fetching host data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostData();
  }, [hostId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!hostData) {
    return <div>No host data found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Host Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {hostData.name}</p>
          <p><strong>IP:</strong> {hostData.ip}</p>
          <p><strong>Operating System:</strong> {hostData.operatingSystem}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin ID</TableHead>
                <TableHead>Plugin Name</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>CVSS Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostData.vulnerabilities.map((vuln) => (
                <TableRow key={vuln.pluginID}>
                  <TableCell>
                    <Link to={`/vulnerability/${vuln.pluginID}`} className="text-blue-500 hover:underline">
                      {vuln.pluginID}
                    </Link>
                  </TableCell>
                  <TableCell>{vuln.pluginName}</TableCell>
                  <TableCell>{vuln.severity}</TableCell>
                  <TableCell>{vuln.cvssScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostPage;
