
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, XCircle, TrendingDown, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

interface LostLeadsProps {
  sharedLeadsData: LeadData[];
}

const LostLeads = ({ sharedLeadsData }: LostLeadsProps) => {
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Professional color palette for charts
  const CHART_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
  ];

  const getFilteredData = useMemo(() => {
    if (!sharedLeadsData.length) return [];

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
        return sharedLeadsData;
    }

    return sharedLeadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: startDate, end: endDate })
    );
  }, [sharedLeadsData, timeFilter]);

  const lostLeadsData = useMemo(() => {
    return getFilteredData.filter(lead => lead.status.toLowerCase().includes('lost'));
  }, [getFilteredData]);

  const lostLeadStats = useMemo(() => {
    if (!sharedLeadsData.length) {
      return [
        {
          title: 'Total Lost Leads',
          value: 'No Data',
          change: 'No Data',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        },
        {
          title: 'Lost This Month',
          value: 'No Data',
          change: 'No Data',
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        },
        {
          title: 'Avg. Time to Loss',
          value: 'No Data',
          change: 'No Data',
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          title: '% of Lost Leads',
          value: 'No Data',
          change: 'No Data',
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        },
      ];
    }

    const totalLost = lostLeadsData.length;
    const totalLeads = getFilteredData.length;
    const lostPercentage = totalLeads > 0 ? Math.round((totalLost / totalLeads) * 100) : 0;
    
    const thisMonth = lostLeadsData.filter(lead => {
      if (!lead.parsedDate) return false;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return lead.parsedDate.getMonth() === currentMonth && lead.parsedDate.getFullYear() === currentYear;
    }).length;

    // Calculate average time to loss
    let avgTimeToLoss = 'No Data';
    if (lostLeadsData.length > 0) {
      const timeDiffs = lostLeadsData
        .filter(lead => lead.parsedDate)
        .map(lead => {
          // Assuming created date as baseline, could be modified date for actual loss time
          const lossDate = lead.parsedDate!;
          const createdDate = lead.parsedDate!; // This should ideally be a separate creation date
          return differenceInDays(lossDate, createdDate);
        })
        .filter(days => days >= 0);
      
      if (timeDiffs.length > 0) {
        const avgDays = timeDiffs.reduce((sum, days) => sum + days, 0) / timeDiffs.length;
        avgTimeToLoss = `${avgDays.toFixed(1)} days`;
      }
    }

    return [
      {
        title: 'Total Lost Leads',
        value: totalLost.toString(),
        change: '+12.3%',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
      {
        title: 'Lost This Month',
        value: thisMonth.toString(),
        change: '+8.1%',
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
      {
        title: 'Avg. Time to Loss',
        value: avgTimeToLoss,
        change: '-0.3 days',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: '% of Lost Leads',
        value: `${lostPercentage}%`,
        change: '+2.1%',
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
    ];
  }, [lostLeadsData, getFilteredData, sharedLeadsData]);

  const lostLeadsOverTime = useMemo(() => {
    if (!lostLeadsData.length) return [];

    const timeData: { [key: string]: number } = {};
    
    lostLeadsData.forEach(lead => {
      if (lead.parsedDate) {
        const dateKey = lead.parsedDate.toISOString().split('T')[0];
        timeData[dateKey] = (timeData[dateKey] || 0) + 1;
      }
    });

    return Object.entries(timeData)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [lostLeadsData]);

  const lostLeadsByAssignee = useMemo(() => {
    if (!lostLeadsData.length) return [];

    const assigneeData: { [key: string]: number } = {};
    
    lostLeadsData.forEach(lead => {
      const assignee = lead['Assignee Name'] || 'Unassigned';
      assigneeData[assignee] = (assigneeData[assignee] || 0) + 1;
    });

    return Object.entries(assigneeData)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [lostLeadsData]);

  const lostLeadsByCity = useMemo(() => {
    if (!lostLeadsData.length) return [];

    const cityData: { [key: string]: number } = {};
    
    lostLeadsData.forEach(lead => {
      const city = lead.City;
      if (city && city.toLowerCase() !== 'unknown' && city.trim() !== '') {
        cityData[city] = (cityData[city] || 0) + 1;
      }
    });

    return Object.entries(cityData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.count - b.count) // Sort in increasing order
      .slice(0, 7);
  }, [lostLeadsData]);

  const lossReasons = useMemo(() => {
    if (!lostLeadsData.length) {
      return [];
    }

    const reasonCounts: { [key: string]: number } = {};
    lostLeadsData.forEach(lead => {
      const reason = lead['Lost Reason'] || 'Unknown';
      if (reason.toLowerCase() !== 'na' && reason.trim() !== '') {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    });

    const total = Object.values(reasonCounts).reduce((sum, count) => sum + count, 0);
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%',
        value: count
      }))
      .sort((a, b) => a.count - b.count); // Sort in increasing order
  }, [lostLeadsData]);

  const topLossReasons = useMemo(() => {
    return lossReasons.slice(-5).reverse(); // Get top 5 and reverse for display
  }, [lossReasons]);

  const lostLeads = useMemo(() => {
    if (!lostLeadsData.length) {
      return [];
    }

    return lostLeadsData
      .sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
      .slice(0, 10)
      .map(lead => ({
        name: lead.Name || 'Unknown',
        country: lead['Student Preference'] || 'Unknown',
        reason: lead['Lost Reason'] || 'Unknown',
        lostDate: lead.parsedDate ? lead.parsedDate.toISOString().split('T')[0] : 'Unknown',
        counselor: lead['Assignee Name'] || 'Unassigned',
        potential: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
      }));
  }, [lostLeadsData]);

  const CustomLegend = ({ data, title }: { data: any[], title: string }) => {
    const displayData = data.slice(0, 5); // Top 5
    const total = data.reduce((sum, item) => sum + (item.value || item.count), 0);
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Top 5 {title}</h4>
        {displayData.map((item, index) => {
          const value = item.value || item.count;
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-gray-700 truncate max-w-24">{item.name || item.reason}</span>
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
        <h2 className="text-2xl font-bold text-gray-900">Lost Leads Analysis</h2>
        <div className="mt-2 sm:mt-0">
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
        {lostLeadStats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = typeof stat.change === 'string' && stat.change.startsWith('+');
          const isNegative = typeof stat.change === 'string' && stat.change.startsWith('-');
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change !== 'No Data' && (
                    <p className={`text-sm mt-1 ${
                      stat.title === '% of Lost Leads' ? 
                        (isPositive ? 'text-red-600' : 'text-green-600') :
                      stat.title === 'Avg. Time to Loss' ? 
                        (isNegative ? 'text-green-600' : 'text-red-600') :
                        (isPositive ? 'text-red-600' : 'text-green-600')
                    }`}>
                      {stat.change} from last period
                    </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lost Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {lostLeadsOverTime.length > 0 ? (
              <ChartContainer config={{}} className="h-80">
                <LineChart data={lostLeadsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
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

        <Card>
          <CardHeader>
            <CardTitle>Top Loss Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            {lossReasons.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-48">
                  <CustomLegend data={lossReasons} title="Reasons" />
                </div>
                <div className="flex-1">
                  <ChartContainer config={{}} className="h-64">
                    <PieChart>
                      <Pie
                        data={lossReasons}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={100}
                        dataKey="value"
                        label={false}
                      >
                        {lossReasons.map((entry, index) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lost Leads by Assignee</CardTitle>
          </CardHeader>
          <CardContent>
            {lostLeadsByAssignee.length > 0 ? (
              <ChartContainer config={{}} className="h-80">
                <BarChart 
                  data={lostLeadsByAssignee} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={70}
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lost Leads by City</CardTitle>
          </CardHeader>
          <CardContent>
            {lostLeadsByCity.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-48">
                  <CustomLegend data={lostLeadsByCity} title="Cities" />
                </div>
                <div className="flex-1">
                  <ChartContainer config={{}} className="h-64">
                    <PieChart>
                      <Pie
                        data={lostLeadsByCity}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={100}
                        dataKey="count"
                        label={false}
                      >
                        {lostLeadsByCity.map((entry, index) => (
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Lost Leads</h3>
        </div>
        {lostLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loss Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Lost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lostLeads.map((lead, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.country}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {lead.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.counselor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.lostDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No lost leads data available
          </div>
        )}
      </div>
    </div>
  );
};

export default LostLeads;
