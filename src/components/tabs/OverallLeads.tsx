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
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfWeek, endOfWeek, subDays, startOfDay, endOfDay, startOfYear, endOfYear, getISOWeek, getYear, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

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

const OverallLeads = ({ sharedLeadsData, setSharedLeadsData }: OverallLeadsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [timeViewMode, setTimeViewMode] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // Use shared data instead of local state
  const leadsData = sharedLeadsData;

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
          
          setSharedLeadsData(processedData);
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
    if (!leadsData.length) {
      return [
        {
          title: 'Total Leads',
          value: 'No Data',
          change: 'No Data',
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          changeColor: 'text-gray-500',
        },
        {
          title: 'This Month',
          value: 'No Data',
          change: 'No Data',
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          changeColor: 'text-gray-500',
        },
        {
          title: 'Lost Leads',
          value: 'No Data',
          change: 'No Data',
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          changeColor: 'text-gray-500',
        },
        {
          title: 'Fresh Leads',
          value: 'No Data',
          change: 'No Data',
          icon: UserCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          changeColor: 'text-gray-500',
        },
      ];
    }

    const filteredData = getFilteredData;
    const now = new Date();
    
    // Current period data
    const totalLeads = filteredData.length;
    const lostLeads = filteredData.filter(lead => 
      lead.status.toLowerCase().includes('lost')
    ).length;
    const freshLeads = filteredData.filter(lead => 
      lead.status.toLowerCase().includes('fresh')
    ).length;
    
    // This month data
    const thisMonth = startOfMonth(now);
    const endThisMonth = endOfMonth(now);
    const thisMonthLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: thisMonth, end: endThisMonth })
    ).length;
    
    // Previous month data for comparison
    const lastMonth = startOfMonth(subMonths(now, 1));
    const endLastMonth = endOfMonth(subMonths(now, 1));
    const lastMonthLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: lastMonth, end: endLastMonth })
    ).length;
    const lastMonthLostLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: lastMonth, end: endLastMonth }) &&
      lead.status.toLowerCase().includes('lost')
    ).length;
    const lastMonthFreshLeads = leadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: lastMonth, end: endLastMonth }) &&
      lead.status.toLowerCase().includes('fresh')
    ).length;
    
    // Calculate percentage changes
    const totalLeadsChange = lastMonthLeads > 0 ? 
      ((totalLeads - lastMonthLeads) / lastMonthLeads * 100).toFixed(1) : '0';
    const thisMonthChange = lastMonthLeads > 0 ? 
      ((thisMonthLeads - lastMonthLeads) / lastMonthLeads * 100).toFixed(1) : '0';
    const lostLeadsChange = lastMonthLostLeads > 0 ? 
      ((lostLeads - lastMonthLostLeads) / lastMonthLostLeads * 100).toFixed(1) : '0';
    const freshLeadsChange = lastMonthFreshLeads > 0 ? 
      ((freshLeads - lastMonthFreshLeads) / lastMonthFreshLeads * 100).toFixed(1) : '0';

    return [
      {
        title: 'Total Leads',
        value: totalLeads.toString(),
        change: `${totalLeadsChange.startsWith('-') ? '' : '+'}${totalLeadsChange}%`,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        changeColor: parseFloat(totalLeadsChange) >= 0 ? 'text-green-600' : 'text-red-600',
      },
      {
        title: 'This Month',
        value: thisMonthLeads.toString(),
        change: `${thisMonthChange.startsWith('-') ? '' : '+'}${thisMonthChange}%`,
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        changeColor: parseFloat(thisMonthChange) >= 0 ? 'text-green-600' : 'text-red-600',
      },
      {
        title: 'Lost Leads',
        value: lostLeads.toString(),
        change: `${lostLeadsChange.startsWith('-') ? '' : '+'}${lostLeadsChange}%`,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        changeColor: parseFloat(lostLeadsChange) <= 0 ? 'text-green-600' : 'text-red-600',
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

  // Professional color palette for charts
  const CHART_COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#7C2D12', // Brown
    '#7C3AED', // Violet
    '#059669', // Emerald
  ];

  const statusDistribution = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const statusCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const status = lead.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status,
        value: count
      }))
      .sort((a, b) => a.value - b.value); // Sort in increasing order
  }, [getFilteredData]);

  const assigneeData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const assigneeCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const assignee = lead['Assignee Name'] || '';
      if (assignee.trim() !== '' && assignee !== 'Unassigned') {
        assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
      }
    });
    
    return Object.entries(assigneeCounts)
      .map(([assignee, leads]) => ({ 
        name: assignee.length > 15 ? assignee.substring(0, 15) + '...' : assignee, 
        leads,
        fullName: assignee 
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 8);
  }, [getFilteredData]);

  const cityData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const cityCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const city = lead.City;
      if (city && city.trim() !== '' && city.toLowerCase() !== 'unknown') {
        // Clean the city name - remove extra spaces and standardize case
        const cleanCity = city.trim().toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        cityCounts[cleanCity] = (cityCounts[cleanCity] || 0) + 1;
      }
    });
    
    return Object.entries(cityCounts)
      .map(([city, count]) => ({ name: city, value: count }))
      .filter(item => item.value > 0) // Only include cities with actual data
      .sort((a, b) => a.value - b.value) // Sort in increasing order
      .slice(0, 10); // Show top 10 cities
  }, [getFilteredData]);

  const topAdsData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const adCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const ad = lead['Facebook Ad'] || '';
      if (ad.trim() !== '' && ad.toLowerCase() !== 'unknown') {
        adCounts[ad] = (adCounts[ad] || 0) + 1;
      }
    });
    
    return Object.entries(adCounts)
      .map(([ad, leads]) => ({ 
        name: ad.length > 20 ? ad.substring(0, 20) + '...' : ad, 
        leads,
        fullName: ad 
      }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 6);
  }, [getFilteredData]);

  const studentPreferenceData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const preferenceCounts: { [key: string]: number } = {};
    getFilteredData.forEach(lead => {
      const preference = lead['Student Preference'];
      if (preference && preference.trim() !== '') {
        // Clean and standardize the preference data
        const cleanPreference = preference.trim().toLowerCase();
        
        // Skip meaningless values
        if (cleanPreference === 'other' || 
            cleanPreference === 'other_program' ||
            cleanPreference === 'unknown' ||
            cleanPreference === 'na' ||
            cleanPreference === '') {
          return;
        }
        
        // Map common variations to standard names
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
          // Capitalize first letter of each word for display
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
      .filter(item => item.value > 0) // Only include preferences with actual data
      .sort((a, b) => a.value - b.value) // Sort in increasing order
      .slice(0, 8); // Show top 8 preferences
  }, [getFilteredData]);

  const lostReasonData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const reasonCounts: { [key: string]: number } = {};
    getFilteredData
      .filter(lead => lead.status.toLowerCase().includes('lost'))
      .forEach(lead => {
        const reason = lead['Lost Reason'] || 'Unknown';
        if (reason.toLowerCase() !== 'na' && reason.trim() !== '') {
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        }
      });
    
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        name: reason,
        value: count
      }))
      .sort((a, b) => a.value - b.value); // Sort in increasing order
  }, [getFilteredData]);

  const leadsOverTimeData = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const timeCounts: { [key: string]: { count: number; sortKey: string } } = {};
    const now = new Date();
    
    let filteredLeads = getFilteredData;
    
    // For weekly filter, only show weeks of current month
    if (timeViewMode === 'Weekly') {
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      filteredLeads = getFilteredData.filter(lead => 
        lead.parsedDate && isWithinInterval(lead.parsedDate, { start: currentMonthStart, end: currentMonthEnd })
      );
    }
    
    filteredLeads.forEach(lead => {
      if (!lead.parsedDate) return;
      
      let timeKey: string;
      let sortKey: string;
      
      switch (timeViewMode) {
        case 'Daily':
          timeKey = format(lead.parsedDate, 'dd MMM');
          sortKey = format(lead.parsedDate, 'yyyy-MM-dd');
          break;
        case 'Weekly':
          const weekNum = getISOWeek(lead.parsedDate);
          timeKey = `Week ${weekNum}`;
          sortKey = `${format(lead.parsedDate, 'yyyy-MM')}-W${weekNum.toString().padStart(2, '0')}`;
          break;
        case 'Monthly':
          timeKey = format(lead.parsedDate, 'MMM yyyy');
          sortKey = format(lead.parsedDate, 'yyyy-MM');
          break;
        case 'Yearly':
          timeKey = format(lead.parsedDate, 'yyyy');
          sortKey = format(lead.parsedDate, 'yyyy');
          break;
        default:
          timeKey = format(lead.parsedDate, 'MMM yyyy');
          sortKey = format(lead.parsedDate, 'yyyy-MM');
      }
      
      if (!timeCounts[timeKey]) {
        timeCounts[timeKey] = { count: 0, sortKey };
      }
      timeCounts[timeKey].count++;
    });
    
    return Object.entries(timeCounts)
      .map(([time, data]) => ({ 
        time, 
        count: data.count,
        sortKey: data.sortKey
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [getFilteredData, timeViewMode]);

  const recentLeads = useMemo(() => {
    if (!getFilteredData.length) return [];
    
    const now = new Date();
    
    const formatTimeAgo = (createdDate: Date): string => {
      const diffMinutes = differenceInMinutes(now, createdDate);
      const diffHours = differenceInHours(now, createdDate);
      const diffDays = differenceInDays(now, createdDate);
      
      if (diffMinutes < 1) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      } else {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      }
    };
    
    return getFilteredData
      .filter(lead => lead.parsedDate)
      .sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
      .slice(0, 5)
      .map(lead => ({
        name: lead.Name || 'Unknown',
        preference: lead['Student Preference'] || 'Unknown Program',
        status: lead.status || 'Unknown',
        timeAgo: lead.parsedDate ? formatTimeAgo(lead.parsedDate) : 'Unknown',
      }));
  }, [getFilteredData]);

  const CustomLegend = ({ data, title }: { data: any[], title: string }) => {
    const displayData = data.slice(-5).reverse(); // Top 5 (last 5 from sorted increasing order)
    const total = data.reduce((sum, item) => sum + (item.value || item.leads || item.count), 0);
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Top 5 {title}</h4>
        {displayData.map((item, index) => {
          const value = item.value || item.leads || item.count;
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-gray-700 truncate max-w-24">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{value}</div>
                <div className="text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
                  {stat.change !== 'No Data' && (
                    <p className={`text-sm mt-1 ${stat.changeColor}`}>{stat.change} from last month</p>
                  )}
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
              {leadsOverTimeData.length > 0 ? (
                <ChartContainer config={{}} className="h-80">
                  <LineChart data={leadsOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Number of Leads', angle: -90, position: 'insideLeft' }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => `Period: ${value}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {statusDistribution.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-48">
                      <CustomLegend data={statusDistribution} title="Status" />
                    </div>
                    <div className="flex-1">
                      <ChartContainer config={{}} className="h-64">
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={100}
                            dataKey="value"
                            label={false}
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads by Assignee</CardTitle>
              </CardHeader>
              <CardContent>
                {assigneeData.length > 0 ? (
                  <ChartContainer config={{}} className="h-96">
                    <BarChart 
                      data={assigneeData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={140}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Number of Leads', angle: -90, position: 'insideLeft' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value, payload) => {
                          const item = assigneeData.find(d => d.name === value);
                          return item?.fullName || value;
                        }}
                      />
                      <Bar 
                        dataKey="leads" 
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]}
                        minPointSize={5}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads by City</CardTitle>
              </CardHeader>
              <CardContent>
                {cityData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-48">
                      <CustomLegend data={cityData} title="Cities" />
                    </div>
                    <div className="flex-1">
                      <ChartContainer config={{}} className="h-64">
                        <PieChart>
                          <Pie
                            data={cityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={100}
                            dataKey="value"
                            label={false}
                          >
                            {cityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Ads</CardTitle>
              </CardHeader>
              <CardContent>
                {topAdsData.length > 0 ? (
                  <ChartContainer config={{}} className="h-96">
                    <BarChart 
                      data={topAdsData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 140 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={160}
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Number of Leads', angle: -90, position: 'insideLeft' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value, payload) => {
                          const item = topAdsData.find(d => d.name === value);
                          return item?.fullName || value;
                        }}
                      />
                      <Bar 
                        dataKey="leads" 
                        fill="#F59E0B" 
                        radius={[4, 4, 0, 0]}
                        minPointSize={5}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {studentPreferenceData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-48">
                      <CustomLegend data={studentPreferenceData} title="Preferences" />
                    </div>
                    <div className="flex-1">
                      <ChartContainer config={{}} className="h-64">
                        <PieChart>
                          <Pie
                            data={studentPreferenceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={100}
                            dataKey="value"
                            label={false}
                          >
                            {studentPreferenceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {lostReasonData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Lost Leads Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-48">
                      <CustomLegend data={lostReasonData} title="Reasons" />
                    </div>
                    <div className="flex-1">
                      <ChartContainer config={{}} className="h-64">
                        <PieChart>
                          <Pie
                            data={lostReasonData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={100}
                            dataKey="value"
                            label={false}
                          >
                            {lostReasonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
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
                  <p className="text-sm text-gray-600">Interested in {lead.preference}</p>
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
                <p className="text-xs text-gray-500 mt-1">{lead.timeAgo}</p>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-8">
              No recent leads available. Upload data to see activity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverallLeads;
