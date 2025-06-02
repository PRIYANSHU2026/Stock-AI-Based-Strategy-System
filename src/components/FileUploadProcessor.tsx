
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProcessorProps {
  onDataProcessed: (data: any[], fileName: string) => void;
}

const FileUploadProcessor: React.FC<FileUploadProcessorProps> = ({ onDataProcessed }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<any>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('sheet') || fileType.includes('csv') || fileType.includes('excel')) 
      return <FileSpreadsheet className="h-4 w-4" />;
    return <Upload className="h-4 w-4" />;
  };

  const processCSVFile = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, i) => {
        const value = values[i];
        // Try to parse as number for price/volume data
        if (header.toLowerCase().includes('price') || 
            header.toLowerCase().includes('close') || 
            header.toLowerCase().includes('open') || 
            header.toLowerCase().includes('high') || 
            header.toLowerCase().includes('low') || 
            header.toLowerCase().includes('volume')) {
          row[header] = parseFloat(value) || 0;
        } else if (header.toLowerCase().includes('date')) {
          row[header] = value;
        } else {
          row[header] = isNaN(Number(value)) ? value : Number(value);
        }
      });
      
      // Generate mock additional data for demonstration
      if (!row.date && !row.Date) {
        const baseDate = new Date('2020-01-01');
        baseDate.setDate(baseDate.getDate() + index);
        row.date = baseDate.toISOString().split('T')[0];
      }
      
      return row;
    });
  };

  const processPDFFile = (): any[] => {
    // Simulate PDF processing - in reality, you'd use PDF parsing libraries
    const mockData = [];
    const basePrice = 100 + Math.random() * 200;
    
    for (let i = 0; i < 100; i++) {
      const date = new Date('2020-01-01');
      date.setDate(date.getDate() + i);
      
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
      mockData.push({
        date: date.toISOString().split('T')[0],
        open: price * (1 + (Math.random() - 0.5) * 0.02),
        high: price * (1 + Math.random() * 0.03),
        low: price * (1 - Math.random() * 0.03),
        close: price,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return mockData;
  };

  const processExcelFile = (): any[] => {
    // Simulate Excel processing
    const mockData = [];
    const symbols = ['STOCK_A', 'STOCK_B', 'STOCK_C'];
    const basePrice = 150 + Math.random() * 100;
    
    for (let i = 0; i < 150; i++) {
      const date = new Date('2021-01-01');
      date.setDate(date.getDate() + i);
      
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.15);
      mockData.push({
        date: date.toISOString().split('T')[0],
        symbol: symbols[i % symbols.length],
        open: price * (1 + (Math.random() - 0.5) * 0.02),
        high: price * (1 + Math.random() * 0.04),
        low: price * (1 - Math.random() * 0.04),
        close: price,
        volume: Math.floor(Math.random() * 15000000) + 2000000,
        marketCap: price * (1000000 + Math.random() * 500000),
        pe_ratio: 15 + Math.random() * 20
      });
    }
    
    return mockData;
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      let processedData: any[] = [];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const content = await file.text();
        processedData = processCSVFile(content);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        processedData = processPDFFile();
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processedData = processExcelFile();
      }

      // Final progress update
      setTimeout(() => {
        setProgress(100);
        setFileInfo({
          name: file.name,
          size: file.size,
          type: file.type,
          recordCount: processedData.length,
          columns: Object.keys(processedData[0] || {})
        });
        
        onDataProcessed(processedData, file.name);
        setIsProcessing(false);
        
        toast({
          title: "File Processed Successfully",
          description: `Loaded ${processedData.length} records from ${file.name}`,
        });
      }, 500);

    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Processing Error",
        description: "Failed to process the uploaded file",
        variant: "destructive"
      });
    }
  }, [onDataProcessed]);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-purple-400" />
          Upload Custom Dataset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select File (PDF, CSV, XLS/XLSX)</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.pdf,.xlsx,.xls"
            onChange={handleFileUpload}
            className="bg-slate-700 border-slate-600"
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {uploadedFile && !isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
              {getFileIcon(uploadedFile.type)}
              <div className="flex-1">
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-slate-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
        )}

        {fileInfo && (
          <div className="space-y-2">
            <h4 className="font-semibold">Dataset Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Records:</span>
                <Badge variant="outline" className="ml-2">{fileInfo.recordCount}</Badge>
              </div>
              <div>
                <span className="text-slate-400">Columns:</span>
                <Badge variant="outline" className="ml-2">{fileInfo.columns.length}</Badge>
              </div>
            </div>
            <div>
              <span className="text-slate-400">Available Fields:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {fileInfo.columns.slice(0, 6).map((col: string) => (
                  <Badge key={col} variant="secondary" className="text-xs">
                    {col}
                  </Badge>
                ))}
                {fileInfo.columns.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{fileInfo.columns.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-400">
          <p className="mb-2">Supported formats:</p>
          <ul className="space-y-1">
            <li>• CSV - Comma-separated values with headers</li>
            <li>• PDF - Financial reports and statements</li>
            <li>• XLS/XLSX - Excel spreadsheets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadProcessor;
