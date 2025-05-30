
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, XCircle, TrendingDown, Filter, Calendar, User, MapPin, MessageCircle } from 'lucide-react';
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
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

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
  const [chartFilter, setChartFilter] = useState('All Time');

  const CHART_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const lostLeadsData = useMemo(() => {
    return sharedLeadsData.filter(lead => lead.status.toLowerCase().includes('lost'));
  }, [sharedLeadsData]);

  const getFilteredChartData = useMemo(() => {
    if (chartFilter === 'All Time') return lostLeadsData;

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (chartFilter) {
      case 'Daily':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'Weekly':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'Monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'Yearly':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        return lostLeadsData;
    }

    return lostLeadsData.filter(lead => 
      lead.parsedDate && isWithinInterval(lead.parsedDate, { start: startDate, end: endDate })
    );
  }, [lostLeadsData, chartFilter]);

  const lostLeadStats = useMemo(() => {
    const totalLost = lostLeadsData.length;
    const totalLeads = sharedLeadsData.length;
    const lostPercentage = totalLeads > 0 ? Math.round((totalLost / totalLeads) * 100) : 0;
    
    const thisMonth = lostLeadsData.filter(lead => {
      if (!lead.parsedDate) return false;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return lead.parsedDate.getMonth() === currentMonth && lead.parsedDate.getFullYear() === currentYear;
    }).length;

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
        value: '4.2 days',
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
  }, [lostLeadsData, sharedLeadsData]);

  const lostLeadsOverTime = useMemo(() => {
    if (!getFilteredChartData.length) return [];

    const timeData: { [key: string]: number } = {};
    
    getFilteredChartData.forEach(lead => {
      if (lead.parsedDate) {
        let dateKey: string;
        switch (chartFilter) {
          case 'Daily':
            dateKey = format(lead.parsedDate, 'HH:mm');
            break;
          case 'Weekly':
            dateKey = format(lead.parsedDate, 'EEE');
            break;
          case 'Monthly':
            dateKey = format(lead.parsedDate, 'dd MMM');
            break;
          case 'Yearly':
            dateKey = format(lead.parsedDate, 'MMM yyyy');
            break;
          default:
            dateKey = format(lead.parsedDate, 'MMM yyyy');
        }
        timeData[dateKey] = (timeData[dateKey] || 0) + 1;
      }
    });

    return Object.entries(timeData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        if (chartFilter === 'Daily') {
          return a.date.localeCompare(b.date);
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [getFilteredChartData, chartFilter]);

  const lostLeadsByAssignee = useMemo(() => {
    if (!getFilteredChartData.length) return [];

    const assigneeData: { [key: string]: number } = {};
    
    getFilteredChartData.forEach(lead => {
      const assignee = lead['Assignee Name'] || 'Unassigned';
      assigneeData[assignee] = (assigneeData[assignee] || 0) + 1;
    });

    return Object.entries(assigneeData)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [getFilteredChartData]);

  const lostLeadsByCity = useMemo(() => {
    if (!getFilteredChartData.length) return [];

    const cityData: { [key: string]: number } = {};
    
    getFilteredChartData.forEach(lead => {
      const city = lead.City;
      if (city && city.toLowerCase() !== 'unknown' && city.trim() !== '') {
        cityData[city] = (cityData[city] || 0) + 1;
      }
    });

    return Object.entries(cityData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [getFilteredChartData]);

  const lossReasons = useMemo(() => {
    if (!getFilteredChartData.length) return [];

    const reasonCounts: { [key: string]: number } = {};
    getFilteredChartData.forEach(lead => {
      const reason = lead['Lost Reason'] || 'Unknown';
      if (reason.trim() !== '') {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    });

    const total = Object.values(reasonCounts).reduce((sum, count) => sum + count, 0);
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        name: reason,
        value: count,
        percentage: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%'
      }))
      .sort((a, b) => b.value - a.value);
  }, [getFilteredChartData]);

  const recentLostLeads = useMemo(() => {
    return lostLeadsData
      .filter(lead => lead.parsedDate)
      .sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
      .slice(0, 10)
      .map(lead => ({
        name: lead.Name || 'Unknown',
        studentPreference: lead['Student Preference'] || 'Unknown Program',
        reason: lead['Lost Reason'] || 'Unknown',
        createdOn: lead.parsedDate ? format(lead.parsedDate, 'dd MMM yyyy') : 'Unknown',
        assignee: lead['Assignee Name'] || 'Unassigned',
      }));
  }, [lostLeadsData]);

  const CustomLegend = ({ data }: { data: any[] }) => {
    return (
      <div className="flex flex-col space-y-2 text-sm max-w-48">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-gray-700 text-xs truncate">{entry.name}</span>
            </div>
            <span className="text-gray-500 text-xs font-medium">{entry.percentage}</span>
          </div>
        ))}
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
                Charts: {chartFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['All Time', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((filter) => (
                <DropdownMenuItem key={filter} onClick={() => setChartFilter(filter)}>
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
          const isPositive = stat.change.startsWith('+');
          const isNegative = stat.change.startsWith('-');
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.title === '% of Lost Leads' ? 
                      (isPositive ? 'text-red-600' : 'text-green-600') :
                    stat.title === 'Avg. Time to Loss' ? 
                      (isNegative ? 'text-green-600' : 'text-red-600') :
                      (isPositive ? 'text-red-600' : 'text-green-600')
                  }`}>
                    {stat.change} from last period
                  </p>
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
            <ChartContainer config={{}} className="h-80">
              <LineChart data={lostLeadsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Loss Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-40">
                <CustomLegend data={lossReasons} />
              </div>
              <div className="flex-1">
                <ChartContainer config={{}} className="h-80">
                  <PieChart>
                    <Pie
                      data={lossReasons}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={120}
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lost Leads by Assignee</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-96">
              <BarChart 
                data={lostLeadsByAssignee} 
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={140}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Assignee Name', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Count of Lost Leads', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lost Leads by City</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-96">
              <BarChart 
                data={lostLeadsByCity} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'City', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Count of Lost Leads', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-red-600" />
            Recent Lost Leads
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loss Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Lost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLostLeads.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Interested in {lead.studentPreference}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {lead.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {lead.assignee}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {lead.createdOn}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LostLeads;
