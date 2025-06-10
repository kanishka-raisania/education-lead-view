import React, { useState, useMemo, useCallback } from 'react';
import { Upload, Download, FileText, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadData {
  status: string;
  'Lost Reason': string;
  'Assignee Name': string;
  'Assignee Email': string;
  Name: string;
  Phone: string;
  Email: string;
  City: string;
  'Fb Campaign': string;
  'Fb Lead ID': string;
  'Facebook Ad': string;
  'Student Preference': string;
  'Created On': string;
  'Modified On': string;
  'Batch Names': string;
  parsedDate?: Date;
}

interface OverallLeadsProps {
  sharedLeadsData: LeadData[];
  setSharedLeadsData: (data: LeadData[]) => void;
}

const OverallLeads: React.FC<OverallLeadsProps> = ({ sharedLeadsData, setSharedLeadsData }) => {
  const [leadsData, setLeadsData] = useState<LeadData[]>(sharedLeadsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Sync with shared data
  React.useEffect(() => {
    if (sharedLeadsData.length > 0) {
      setLeadsData(sharedLeadsData);
    }
  }, [sharedLeadsData]);

  // Memoized filtered data to prevent unnecessary recalculations
  const getFilteredData = useMemo(() => {
    if (!leadsData || leadsData.length === 0) return [];

    return leadsData.filter(lead => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (lead.Name && lead.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.Email && lead.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.Phone && lead.Phone.includes(searchTerm));

      // Status filter
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

      // Date range filter
      let matchesDate = true;
      if (dateRange !== 'all' && lead.parsedDate) {
        const now = new Date();
        const leadDate = lead.parsedDate;
        
        switch (dateRange) {
          case '7days':
            matchesDate = (now.getTime() - leadDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
            break;
          case '30days':
            matchesDate = (now.getTime() - leadDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
            break;
          case '90days':
            matchesDate = (now.getTime() - leadDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [leadsData, searchTerm, statusFilter, dateRange]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const text = await file.text();
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map((row: any) => ({
            ...row,
            parsedDate: row['Created On'] ? new Date(row['Created On']) : new Date()
          }));
          
          setLeadsData(parsedData);
          setSharedLeadsData(parsedData);
          
          toast({
            title: "File uploaded successfully",
            description: `Processed ${parsedData.length} leads`,
          });
        },
        error: (error) => {
          console.error('Parse error:', error);
          toast({
            title: "Error parsing file",
            description: "Please check your CSV format",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [setSharedLeadsData, toast]);

  const exportToCSV = useCallback(() => {
    if (getFilteredData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please upload data first",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const csv = Papa.unparse(getFilteredData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${getFilteredData.length} leads`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [getFilteredData, toast]);

  // Chart colors
  const COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#059669', // Emerald
  ];

  const statusDistribution = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const statusCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const status = lead.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [getFilteredData]);

  const leadsByCityData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const cityCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const city = lead.City;
      if (city && city.trim() !== '' && city.toLowerCase() !== 'unknown') {
        const cleanCity = city.trim().toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        cityCounts[cleanCity] = (cityCounts[cleanCity] || 0) + 1;
      }
    });
    
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ name: city, value: count }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [getFilteredData]);

  const topAdsData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const adCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const ad = lead['Facebook Ad'] || 'Unknown';
      if (ad.trim() !== '' && ad.toLowerCase() !== 'unknown') {
        adCounts[ad] = (adCounts[ad] || 0) + 1;
      }
    });
    
    return Object.entries(adCounts)
      .map(([ad, count]) => ({ name: ad.substring(0, 30) + (ad.length > 30 ? '...' : ''), value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [getFilteredData]);

  const studentPreferencesData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const preferenceCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const preference = lead['Student Preference'];
      if (preference && preference.trim() !== '') {
        const cleanPreference = preference.trim().toLowerCase();
        
        if (cleanPreference === 'other' || 
            cleanPreference === 'other_program' ||
            cleanPreference === 'unknown' ||
            cleanPreference === 'na' ||
            cleanPreference === '') {
          return;
        }
        
        let standardizedPreference = cleanPreference;
        if (cleanPreference.includes('engineering')) {
          standardizedPreference = 'Engineering Programs';
        } else if (cleanPreference.includes('management') || cleanPreference.includes('msc_in_management')) {
          standardizedPreference = 'Management Programs';
        } else if (cleanPreference.includes('healthcare')) {
          standardizedPreference = 'Healthcare Programs';
        } else if (cleanPreference.includes('business')) {
          standardizedPreference = 'Business Programs';
        } else if (cleanPreference.includes('computer') || cleanPreference.includes('it')) {
          standardizedPreference = 'Computer Science/IT';
        } else {
          standardizedPreference = cleanPreference
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        preferenceCounts[standardizedPreference] = (preferenceCounts[standardizedPreference] || 0) + 1;
      }
    });
    
    return Object.entries(preferenceCounts)
      .map(([preference, count]) => ({ name: preference, value: count }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [getFilteredData]);

  const lostReasonData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const lostLeads = getFilteredData.filter(lead => lead.status === 'Lost');
    if (lostLeads.length === 0) return [];
    
    const reasonCounts: { [key: string]: number } = {};
    lostLeads.forEach(lead => {
      const reason = lead['Lost Reason'] || 'Unknown';
      if (reason.trim() !== '' && reason.toLowerCase() !== 'unknown') {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    });
    
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ name: reason, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [getFilteredData]);

  const getUniqueValues = useCallback((field: keyof LeadData) => {
    if (!leadsData.length) return [];
    return [...new Set(leadsData.map(lead => lead[field]).filter(Boolean))];
  }, [leadsData]);

  const uniqueStatuses = getUniqueValues('status');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Overall Leads Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze your lead generation performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={uploading}
            />
            <Button 
              onClick={() => document.getElementById('csv-upload')?.click()}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </div>
          
          <Button 
            onClick={exportToCSV} 
            variant="outline"
            disabled={isExporting || getFilteredData.length === 0}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="outline" className="bg-blue-50">
              {getFilteredData.length} of {leadsData.length} leads
            </Badge>
            {searchTerm && <Badge variant="outline">Search: "{searchTerm}"</Badge>}
            {statusFilter !== 'all' && <Badge variant="outline">Status: {statusFilter}</Badge>}
            {dateRange !== 'all' && <Badge variant="outline">Date: {dateRange}</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{getFilteredData.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Won Leads</p>
                <p className="text-2xl font-bold text-green-600">
                  {getFilteredData.filter(lead => lead.status === 'Won').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lost Leads</p>
                <p className="text-2xl font-bold text-red-600">
                  {getFilteredData.filter(lead => lead.status === 'Lost').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getFilteredData.filter(lead => 
                    lead.status !== 'Won' && lead.status !== 'Lost'
                  ).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
            <CardDescription>Overview of all lead statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available - please upload a CSV file
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads by City */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by City</CardTitle>
            <CardDescription>Top 10 cities with most leads</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsByCityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadsByCityData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No city data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Facebook Ads */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Facebook Ads</CardTitle>
            <CardDescription>Ads generating the most leads</CardDescription>
          </CardHeader>
          <CardContent>
            {topAdsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topAdsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No Facebook ads data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Student Preferences</CardTitle>
            <CardDescription>Popular course preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {studentPreferencesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={studentPreferencesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentPreferencesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No student preference data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lost Reasons Analysis */}
      {lostReasonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lost Lead Reasons</CardTitle>
            <CardDescription>Analysis of why leads were lost</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lostReasonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverallLeads;
