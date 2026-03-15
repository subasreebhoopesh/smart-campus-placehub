import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BRANCHES } from '@/lib/types';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const reportTypes = [
  { id: 'placement', name: 'Placement Report', description: 'Overall placement statistics' },
  { id: 'company', name: 'Company Report', description: 'Company-wise hiring data' },
  { id: 'branch', name: 'Branch Report', description: 'Department-wise analysis' },
  { id: 'package', name: 'Package Report', description: 'Salary package analysis' },
];

export default function Reports() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalEligible: 0,
    totalPlaced: 0,
    avgPackage: 0,
    highestPackage: 0,
    placementRate: 0
  });

  // Fetch placement summary data
  useEffect(() => {
    const fetchPlacementSummary = async () => {
      try {
        setLoading(true);
        const response = await api.admin.getPlacementSummary();
        if (response.success) {
          setSummary(response.summary);
          setReportData(response.branchData);
        }
      } catch (error) {
        console.error('Failed to fetch placement summary:', error);
        toast({
          title: "Error",
          description: "Failed to load placement summary data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementSummary();
  }, [toast]);

  // Filter data by selected branch
  const filteredData = selectedBranch === 'all' 
    ? reportData 
    : reportData.filter(d => d.branch === selectedBranch);

  // Export as PDF
  const exportAsPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Placement Report', 14, 20);
    
    // Add year
    doc.setFontSize(12);
    doc.text('Overall placement statistics', 14, 28);
    doc.text(`Academic Year: ${selectedYear}`, 14, 34);
    
    // Add summary statistics
    doc.setFontSize(10);
    doc.text(`Total Eligible: ${summary.totalEligible}`, 14, 44);
    doc.text(`Total Placed: ${summary.totalPlaced}`, 14, 50);
    doc.text(`Placement Rate: ${summary.placementRate}%`, 14, 56);
    doc.text(`Average Package: Rs.${summary.avgPackage} LPA`, 14, 62);
    doc.text(`Highest Package: Rs.${summary.highestPackage} LPA`, 14, 68);
    
    // Add table
    autoTable(doc, {
      startY: 76,
      head: [['Branch', 'Eligible', 'Placed', 'Placement %', 'Avg Package', 'Highest Package']],
      body: filteredData.map(row => [
        row.branch,
        row.eligible.toString(),
        row.placed.toString(),
        `${row.placementPercentage}%`,
        row.avgPackage > 0 ? `Rs.${row.avgPackage} LPA` : 'N/A',
        row.highestPackage > 0 ? `Rs.${row.highestPackage} LPA` : 'N/A'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { 
        font: 'helvetica',
        fontSize: 10
      }
    });
    
    // Save the PDF
    doc.save(`Placement_Report_${selectedYear}.pdf`);
    
    toast({
      title: "PDF Downloaded!",
      description: "Placement summary has been exported as PDF.",
    });
  };

  // Export as CSV
  const exportAsCSV = () => {
    // Create CSV header
    const headers = ['Branch', 'Eligible', 'Placed', 'Placement %', 'Avg Package (LPA)', 'Highest Package (LPA)'];
    
    // Create CSV rows
    const rows = filteredData.map(row => [
      row.branch,
      row.eligible,
      row.placed,
      row.placementPercentage,
      row.avgPackage > 0 ? row.avgPackage : 'N/A',
      row.highestPackage > 0 ? row.highestPackage : 'N/A'
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Placement_Summary_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Downloaded!",
      description: "Placement summary has been exported as CSV.",
    });
  };

  // Export specific report type as PDF
  const exportReportAsPDF = (reportType: string) => {
    const doc = new jsPDF();
    
    // Add title based on report type
    doc.setFontSize(18);
    let title = '';
    let description = '';
    
    switch(reportType) {
      case 'placement':
        title = 'Placement Report';
        description = 'Overall placement statistics';
        break;
      case 'company':
        title = 'Company Report';
        description = 'Company-wise hiring data';
        break;
      case 'branch':
        title = 'Branch Report';
        description = 'Department-wise analysis';
        break;
      case 'package':
        title = 'Package Report';
        description = 'Salary package analysis';
        break;
    }
    
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(description, 14, 28);
    doc.text(`Academic Year: ${selectedYear}`, 14, 34);
    
    // Add summary statistics
    doc.text(`Total Eligible: ${summary.totalEligible}`, 14, 44);
    doc.text(`Total Placed: ${summary.totalPlaced}`, 14, 50);
    doc.text(`Placement Rate: ${summary.placementRate}%`, 14, 56);
    doc.text(`Average Package: Rs.${summary.avgPackage} LPA`, 14, 62);
    doc.text(`Highest Package: Rs.${summary.highestPackage} LPA`, 14, 68);
    
    // Add table
    autoTable(doc, {
      startY: 76,
      head: [['Branch', 'Eligible', 'Placed', 'Placement %', 'Avg Package', 'Highest Package']],
      body: filteredData.map(row => [
        row.branch,
        row.eligible.toString(),
        row.placed.toString(),
        `${row.placementPercentage}%`,
        row.avgPackage > 0 ? `Rs.${row.avgPackage} LPA` : 'N/A',
        row.highestPackage > 0 ? `Rs.${row.highestPackage} LPA` : 'N/A'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { 
        font: 'helvetica',
        fontSize: 10
      }
    });
    
    // Save the PDF
    doc.save(`${title.replace(' ', '_')}_${selectedYear}.pdf`);
    
    toast({
      title: "PDF Downloaded!",
      description: `${title} has been exported as PDF.`,
    });
  };

  // Export specific report type as CSV
  const exportReportAsCSV = (reportType: string) => {
    let title = '';
    
    switch(reportType) {
      case 'placement':
        title = 'Placement_Report';
        break;
      case 'company':
        title = 'Company_Report';
        break;
      case 'branch':
        title = 'Branch_Report';
        break;
      case 'package':
        title = 'Package_Report';
        break;
    }
    
    // Create CSV header
    const headers = ['Branch', 'Eligible', 'Placed', 'Placement %', 'Avg Package (LPA)', 'Highest Package (LPA)'];
    
    // Create CSV rows
    const rows = filteredData.map(row => [
      row.branch,
      row.eligible,
      row.placed,
      row.placementPercentage,
      row.avgPackage > 0 ? row.avgPackage : 'N/A',
      row.highestPackage > 0 ? row.highestPackage : 'N/A'
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV Downloaded!",
      description: `${title.replace('_', ' ')} has been exported as CSV.`,
    });
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and export placement reports</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2023-24</SelectItem>
                  <SelectItem value="2023">2022-23</SelectItem>
                  <SelectItem value="2022">2021-22</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Report Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportTypes.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <CardDescription className="text-xs">{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 gap-1"
                    onClick={() => exportReportAsPDF(report.id)}
                    disabled={loading || filteredData.length === 0}
                  >
                    <Download className="h-3 w-3" /> PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 gap-1"
                    onClick={() => exportReportAsCSV(report.id)}
                    disabled={loading || filteredData.length === 0}
                  >
                    <Download className="h-3 w-3" /> CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Placement Summary - {selectedYear}</CardTitle>
            <CardDescription>Overall placement statistics for the academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold">{loading ? '...' : summary.totalEligible}</p>
                <p className="text-sm text-muted-foreground">Total Eligible</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-green-500">{loading ? '...' : summary.totalPlaced}</p>
                <p className="text-sm text-muted-foreground">Total Placed</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-primary">
                  {loading ? '...' : `₹${summary.avgPackage} LPA`}
                </p>
                <p className="text-sm text-muted-foreground">Average Package</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {loading ? '...' : `₹${summary.highestPackage} LPA`}
                </p>
                <p className="text-sm text-muted-foreground">Highest Package</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Eligible</TableHead>
                  <TableHead className="text-right">Placed</TableHead>
                  <TableHead className="text-right">Placement %</TableHead>
                  <TableHead className="text-right">Avg Package</TableHead>
                  <TableHead className="text-right">Highest Package</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading placement data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No placement data available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow key={row.branch}>
                      <TableCell className="font-medium">{row.branch}</TableCell>
                      <TableCell className="text-right">{row.eligible}</TableCell>
                      <TableCell className="text-right">{row.placed}</TableCell>
                      <TableCell className="text-right">{row.placementPercentage}%</TableCell>
                      <TableCell className="text-right">
                        {row.avgPackage > 0 ? `₹${row.avgPackage} LPA` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.highestPackage > 0 ? `₹${row.highestPackage} LPA` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" className="gap-2" onClick={exportAsPDF} disabled={loading || filteredData.length === 0}>
                <Download className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={exportAsCSV} disabled={loading || filteredData.length === 0}>
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
