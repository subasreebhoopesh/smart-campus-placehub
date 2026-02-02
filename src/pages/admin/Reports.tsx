import { useState } from 'react';
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

const reportData = [
  { branch: 'CSE', eligible: 120, placed: 85, avgPackage: 12.5, highestPackage: 45 },
  { branch: 'IT', eligible: 60, placed: 45, avgPackage: 10.2, highestPackage: 28 },
  { branch: 'ECE', eligible: 80, placed: 38, avgPackage: 8.5, highestPackage: 22 },
  { branch: 'EEE', eligible: 50, placed: 22, avgPackage: 6.8, highestPackage: 15 },
  { branch: 'MECH', eligible: 70, placed: 18, avgPackage: 5.5, highestPackage: 12 },
  { branch: 'CIVIL', eligible: 40, placed: 15, avgPackage: 5.2, highestPackage: 10 },
];

const reportTypes = [
  { id: 'placement', name: 'Placement Report', description: 'Overall placement statistics' },
  { id: 'company', name: 'Company Report', description: 'Company-wise hiring data' },
  { id: 'branch', name: 'Branch Report', description: 'Department-wise analysis' },
  { id: 'package', name: 'Package Report', description: 'Salary package analysis' },
];

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const totalEligible = reportData.reduce((sum, d) => sum + d.eligible, 0);
  const totalPlaced = reportData.reduce((sum, d) => sum + d.placed, 0);
  const avgPackage = (reportData.reduce((sum, d) => sum + d.avgPackage, 0) / reportData.length).toFixed(1);
  const highestPackage = Math.max(...reportData.map((d) => d.highestPackage));

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
            <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Download className="h-3 w-3" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
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
                <p className="text-3xl font-bold">{totalEligible}</p>
                <p className="text-sm text-muted-foreground">Total Eligible</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-green-500">{totalPlaced}</p>
                <p className="text-sm text-muted-foreground">Total Placed</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-primary">₹{avgPackage} LPA</p>
                <p className="text-sm text-muted-foreground">Average Package</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-orange-500">₹{highestPackage} LPA</p>
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
                {reportData.map((row) => (
                  <TableRow key={row.branch}>
                    <TableCell className="font-medium">{row.branch}</TableCell>
                    <TableCell className="text-right">{row.eligible}</TableCell>
                    <TableCell className="text-right">{row.placed}</TableCell>
                    <TableCell className="text-right">
                      {((row.placed / row.eligible) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">₹{row.avgPackage} LPA</TableCell>
                    <TableCell className="text-right">₹{row.highestPackage} LPA</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="gap-2">
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
