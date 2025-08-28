import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Trash2, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';

export function DataManagement() {
  const { exportUserData, importUserData, clearAllData, loadExampleData, projects, timelineEvents } = useProjects();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportUserData();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    setImportMessage('Importing data...');

    try {
      const success = await importUserData(file);
      if (success) {
        setImportStatus('success');
        setImportMessage('Data imported successfully!');
        setIsImportDialogOpen(false);
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      } else {
        setImportStatus('error');
        setImportMessage('Failed to import data. Please check the file format.');
      }
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Error importing data. Please try again.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    clearAllData();
    setIsClearDialogOpen(false);
  };

  const handleLoadExampleData = () => {
    loadExampleData();
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'loading':
        return <Database className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (importStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-blue-600">Projects</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{timelineEvents.length}</div>
              <div className="text-sm text-green-600">Timeline Events</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleExport}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>

            <Button
              onClick={handleLoadExampleData}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Database className="h-4 w-4" />
              Load Examples
            </Button>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a JSON file to import your project data. This will replace your current data.
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={importStatus === 'loading'}
                  >
                    Choose File
                  </Button>

                  {importStatus !== 'idle' && (
                    <Alert className={getStatusColor()}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <AlertDescription>{importMessage}</AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This action cannot be undone. All your projects, tasks, and timeline events will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsClearDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearData}
                    >
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground">
            <p>• Your data is automatically saved to your browser's local storage</p>
            <p>• Export your data regularly to create backups</p>
            <p>• Imported data will replace your current data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
