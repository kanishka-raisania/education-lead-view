
import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, AlertTriangle, UserCheck, Upload, Filter, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import Papa from 'papaparse';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfWeek, endOfWeek, subDays, startOfDay, endOfDay, startOfYear, endOfYear } from 'date-fns';

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

const OverallLeads = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [timeViewMode, setTimeViewMode] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const parseDate = (dateString: string): Date | null => {
    try {
      // Parse format: "15-05-2025 12:06:07 pm"
      const [datePart, timePart, ampm] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hours, minutes, seconds] = timePart.split(':');
      
      let hour = parseInt(hours);
      if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
      
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds));
    } catch {
      return null;
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile.name);
      
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          const processedData = results.data
            .filter((row: any) => {
              // Skip empty rows
              return Object.values(row).some(value => value && value.toString().trim() !== '');
            })
            .map((row: any) => {
              const parsedDate = parseDate(row['Created On']);
              return {
                ...row,
                parsedDate
              } as LeadData;
            })
            .filter(row => row.parsedDate); // Only keep rows with valid dates
          
          setLeadsData(processedData);
          console.log('Processed data:', processedData);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    }
  };

  const getFilteredData = useMemo(() => {
    if (!leadsData.length) return [];

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (timeFilter) {
      case 'Last 7 Days':
        startDate = subDays(now, 7);
        break;
      case 'Last 30 Days':
        startDate = subDays(now, 30);
        break;
      case 'This Month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'All Time':
      default:
        return leadsData;
    }

    return leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: startDate, end: endDate })
    );
  }, [leadsData, timeFilter]);

  const stats = useMemo(() => {
    const filteredData = getFilteredData;
    const totalLeads = filteredData.length;
    
    // This month data
    const thisMonth = startOfMonth(new Date());
    const endThisMonth = endOfMonth(new Date());
    const thisMonthLeads = filteredData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: thisMonth, end: endThisMonth })
    ).length;
    
    // Previous month for comparison
    const lastMonth = startOfMonth(subMonths(new Date(), 1));
    const endLastMonth = endOfMonth(subMonths(new Date(), 1));
    const lastMonthLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: lastMonth, end: endLastMonth })
    ).length;
    
    const monthlyChange = lastMonthLeads > 0 ? 
      ((thisMonthLeads - lastMonthLeads) / lastMonthLeads * 100).toFixed(1) : '0';
    
    const lostLeads = filteredData.filter(lead => 
      lead.status.toLowerCase().includes('lost')
    ).length;
    
    const freshLeads = filteredData.filter(lead => 
      lead.status.toLowerCase().includes('fresh')
    ).length;

    // Previous period lost leads for comparison
    const lastMonthLostLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: lastMonth, end: endLastMonth }) &&
      lead.status.toLowerCase().includes('lost')
    ).length;

    // Previous period fresh leads for comparison
    const lastMonthFreshLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: lastMonth, end: endLastMonth }) &&
      lead.status.toLowerCase().includes('fresh')
    ).length;

    const lostLeadsChange = lastMonthLostLeads > 0 ? 
      ((lostLeads - lastMonthLostLeads) / lastMonthLostLeads * 100).toFixed(1) : '0';
    
    const freshLeadsChange = lastMonthFreshLeads > 0 ? 
      ((freshLeads - lastMonthFreshLeads) / lastMonthFreshLeads * 100).toFixed(1) : '0';

    return [
      {
        title: 'Total Leads',
        value: totalLeads.toString(),
        change: `${monthlyChange.startsWith('-') ? '' : '+'}${monthlyChange}%`,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        changeColor: parseFloat(monthlyChange) >= 0 ? 'text-green-600' : 'text-red-600',
      },
      {
        title: 'This Month',
        value: thisMonthLeads.toString(),
        change: `${monthlyChange.startsWith('-') ? '' : '+'}${monthlyChange}%`,
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        changeColor: parseFloat(monthlyChange) >= 0 ? 'text-green-600' : 'text-red-600',
      },
      {
        title: 'Lost Leads',
        value: lostLeads.toString(),
        change: `${lostLeadsChange.startsWith('-') ? '' : '+'}${lostLeadsChange}%`,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        changeColor: parseFloat(lostLeadsChange) >= 0 ? 'text-red-600' : 'text-green-600',
      },
      {
        title: 'Fresh Leads',
        value: freshLeads.toString(),
        change: `${freshLeadsChange.startsWith('-') ? '' : '+'}${freshLeadsChange}%`,
        icon: UserCheck,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        changeColor: parseFloat(freshLeadsChange) >= 0 ? 'text-green-600' : 'text-red-600',
      },
    ];
  }, [getFilteredData, leadsData]);

  // Chart data processing
  const statusDistribution = useMemo(() => {
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

  const assigneeData = useMemo(() => {
    const assigneeCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const assignee = lead['Assignee Name'] || 'Unassigned';
      assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
    });
    
    return Object.entries(assigneeCounts)
      .map(([assignee, count]) => ({ name: assignee, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [getFilteredData]);

  const cityData = useMemo(() => {
    const cityCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const city = lead.City || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ name: city, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [getFilteredData]);

  const topAdsData = useMemo(() => {
    const adCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const ad = lead['Facebook Ad'] || 'Unknown';
      if (ad !== 'Unknown' && ad.trim() !== '') {
        adCounts[ad] = (adCounts[ad] || 0) + 1;
      }
    });
    
    return Object.entries(adCounts)
      .map(([ad, count]) => ({ name: ad, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [getFilteredData]);

  const lostReasonData = useMemo(() => {
    const reasonCounts: { [key: string]: number } = {};
    getFilteredData
      .filter(lead => lead.status.toLowerCase().includes('lost'))
      .forEach(lead => {
        const reason = lead['Lost Reason'] || 'Unknown';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    
    return Object.entries(reasonCounts).map(([reason, count]) => ({
      name: reason,
      value: count
    }));
  }, [getFilteredData]);

  const leadsOverTimeData = useMemo(() => {
    const timeCounts: { [key: string]: number } = {};
    
    getFilteredData.forEach(lead => {
      if (!lead.parsedDate) return;
      
      let timeKey: string;
      switch (timeViewMode) {
        case 'Daily':
          timeKey = format(lead.parsedDate, 'dd-MM-yyyy');
          break;
        case 'Weekly':
          timeKey = format(startOfWeek(lead.parsedDate), 'dd-MM-yyyy');
          break;
        case 'Monthly':
          timeKey = format(lead.parsedDate, 'MM-yyyy');
          break;
        case 'Yearly':
          timeKey = format(lead.parsedDate, 'yyyy');
          break;
        default:
          timeKey = format(lead.parsedDate, 'MM-yyyy');
      }
      
      timeCounts[timeKey] = (timeCounts[timeKey] || 0) + 1;
    });
    
    return Object.entries(timeCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [getFilteredData, timeViewMode]);

  const recentLeads = useMemo(() => {
    return getFilteredData
      .sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
      .slice(0, 5)
      .map(lead => ({
        name: lead.Name || 'Unknown',
        country: lead.City || 'Unknown Location',
        status: lead.status || 'Unknown',
        time: lead.parsedDate ? format(lead.parsedDate, 'HH:mm') : 'Unknown',
      }));
  }, [getFilteredData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Overall Leads Overview</h2>
        <div className="mt-2 sm:mt-0 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {timeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'].map((filter) => (
                <DropdownMenuItem key={filter} onClick={() => setTimeFilter(filter)}>
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.changeColor}`}>{stat.change} from last month</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Excel File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-sm text-gray-500">Upload a new Excel or CSV file.</p>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="w-full sm:w-auto"
          >
            Submit
          </Button>
        </CardContent>
      </Card>

      {leadsData.length > 0 && (
        <div className="space-y-6">
          {/* Leads Over Time Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leads Over Time</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {timeViewMode}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((mode) => (
                      <DropdownMenuItem key={mode} onClick={() => setTimeViewMode(mode)}>
                        {mode}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <LineChart data={leadsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Leads by Assignee */}
            <Card>
              <CardHeader>
                <CardTitle>Leads by Assignee</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={assigneeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Leads by City */}
            <Card>
              <CardHeader>
                <CardTitle>Leads by City (Top 7)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top 5 Performing Ads */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Performing Ads</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <BarChart data={topAdsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#ffc658" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Lost Reason Distribution */}
            {lostReasonData.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Lost Leads Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-64">
                    <PieChart>
                      <Pie
                        data={lostReasonData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {lostReasonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lead Activity</h3>
        <div className="space-y-4">
          {recentLeads.length > 0 ? recentLeads.map((lead, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-600">Interested in {lead.country}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lead.status.toLowerCase().includes('new') || lead.status.toLowerCase().includes('fresh') ? 'bg-blue-100 text-blue-800' :
                  lead.status.toLowerCase().includes('contacted') ? 'bg-yellow-100 text-yellow-800' :
                  lead.status.toLowerCase().includes('follow') ? 'bg-orange-100 text-orange-800' :
                  lead.status.toLowerCase().includes('lost') ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {lead.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{lead.time}</p>
              </div>
            </div>
          )) : (
            // Fallback data when no file is uploaded
            [
              { name: 'Sarah Johnson', country: 'Canada', status: 'New', time: '2 minutes ago' },
              { name: 'Michael Chen', country: 'Australia', status: 'Contacted', time: '15 minutes ago' },
              { name: 'Emma Rodriguez', country: 'UK', status: 'Follow-up', time: '1 hour ago' },
              { name: 'David Kim', country: 'Germany', status: 'Qualified', time: '2 hours ago' },
            ].map((lead, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-600">Interested in {lead.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'Follow-up' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {lead.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{lead.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverallLeads;
