import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun } from 'lucide-react';

interface SplashScreenProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFileSelect, onSubmit, isLoading, isDarkMode, toggleTheme }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
          <CardTitle className="text-center text-2xl font-bold">Hacks Up Display</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-center text-xs mb-4 font-mono whitespace-pre overflow-x-auto">
            {`
   ▄█    █▄    ███    █▄  ████████▄  
  ███    ███   ███    ███ ███   ▀███ 
  ███    ███   ███    ███ ███    ███ 
 ▄███▄▄▄▄███▄▄ ███    ███ ███    ███ 
▀▀███▀▀▀▀███▀  ███    ███ ███    ███ 
  ███    ███   ███    ███ ███    ███ 
  ███    ███   ███    ███ ███   ▄███ 
  ███    █▀    ████████▀  ████████▀  
                                     
`}
          </pre>
          <p className="mb-4 text-center">Welcome to Hacks Up Display, your advanced Security Assessment Dashboard.</p>
          <p className="mb-4 text-center">To get started, please upload your vulnerability data file.</p>
          <div className="flex justify-center">
            <Input
              type="file"
              onChange={onFileSelect}
              accept=".xlsx, .xls"
              disabled={isLoading}
              className="mb-4 max-w-sm"
            />
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload and View Dashboard"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Supported file types: .xlsx, .xls
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplashScreen;
