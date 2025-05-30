
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, XCircle, TrendingDown, User, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const LostLeads = ({ sharedLeadsData }: LostLeadsProps) => {
  const [timeFilter, setTimeFilter] = useState('all');

  const lostLeadsData = useMemo(() => {
    return sharedLeadsData.filter(lead => lead.status.toLowerCase().includes('lost'));
  }, [sharedLeadsData]);

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

  const getFilteredData = (data: LeadData[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeFilter) {
      case 'today':
        return data.filter(lead => {
          if (!lead.parsedDate) return false;
          const leadDate = new Date(lead.parsedDate.getFullYear(), lead.parsedDate.getMonth(), lead.parsedDate.getDate());
          return leadDate.getTime() === today.getTime();
        });
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return data.filter(lead => {
          if (!lead.parsedDate) return false;
          const leadDate = new Date(lead.parsedDate.getFullYear(), lead.parsedDate.getMonth(), lead.parsedDate.getDate());
          return leadDate >= startOfWeek && leadDate <= today;
        });
      case 'month':
        return data.filter(lead => {
          if (!lead.parsedDate) return false;
          return lead.parsedDate.getMonth() === now.getMonth() && lead.parsedDate.getFullYear() === now.getFullYear();
        });
      case 'year':
        return data.filter(lead => {
          if (!lead.parsedDate) return false;
          return lead.parsedDate.getFullYear() === now.getFullYear();
        });
      default:
        return data;
    }
  };

  const lostLeadsOverTime = useMemo(() => {
    const filteredData = getFilteredData(lostLeadsData);
    if (!filteredData.length) return [];

    const timeData: { [key: string]: number } = {};
    
    filteredData.forEach(lead => {
      if (lead.parsedDate) {
        let dateKey: string;
        
        if (timeFilter === 'today') {
          dateKey = lead.parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (timeFilter === 'week') {
          dateKey = lead.parsedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } else if (timeFilter === 'month') {
          dateKey = lead.parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (timeFilter === 'year') {
          dateKey = lead.parsedDate.toLocaleDateString('en-US', { month: 'short' });
        } else {
          dateKey = lead.parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        timeData[dateKey] = (timeData[dateKey] || 0) + 1;
      }
    });

    return Object.entries(timeData)
      .map(([date, count]) => ({
        date,
        leads: count
      }))
      .sort((a, b) => {
        if (timeFilter === 'today') {
          return a.date.localeCompare(b.date);
        }
        return a.date.localeCompare(b.date);
      });
  }, [lostLeadsData, timeFilter]);

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
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [lostLeadsData]);

  const lossReasons = useMemo(() => {
    if (!lostLeadsData.length) return [];

    const reasonCounts: { [key: string]: number } = {};
    lostLeadsData.forEach(lead => {
      const reason = lead['Lost Reason'] && lead['Lost Reason'] !== 'NA' ? lead['Lost Reason'] : 'Unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const total = Object.values(reasonCounts).reduce((sum, count) => sum + count, 0);
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        name: reason,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [lostLeadsData]);

  const recentLostLeads = useMemo(() => {
    return lostLeadsData
      .sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
      .slice(0, 10)
      .map(lead => ({
        name: lead.Name || 'Unknown',
        assignee: lead['Assignee Name'] || 'Unassigned',
        reason: lead['Lost Reason'] || 'Unknown',
        createdOn: lead.parsedDate ? lead.parsedDate.toLocaleDateString() : 'Unknown',
        studentPreference: lead['Student Preference'] || 'Not specified',
        email: lead.Email || '',
        phone: lead.Phone || '',
      }));
  }, [lostLeadsData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lost Leads Analysis</h2>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Lost Leads Over Time</CardTitle>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </CardHeader>
          <CardContent>
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
                  dataKey="leads" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
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
            <div className="flex items-center justify-center">
              <ChartContainer config={{}} className="h-80 w-full">
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <Pie
                    data={lossReasons}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {lossReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    iconSize={12}
                    wrapperStyle={{
                      paddingLeft: '20px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ChartContainer>
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
            <ChartContainer config={{}} className="h-80">
              <BarChart 
                data={lostLeadsByAssignee} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Assignee Name', position: 'insideBottom', offset: -5 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
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
            <ChartContainer config={{}} className="h-80">
              <BarChart 
                data={lostLeadsByCity} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'City', position: 'insideBottom', offset: -5 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Recent Lost Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLostLeads.map((lead, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Interested in {lead.studentPreference}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {lead.createdOn}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      <span className="font-medium">Assignee:</span> {lead.assignee}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      <span className="font-medium">Reason:</span> {lead.reason}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LostLeads;
