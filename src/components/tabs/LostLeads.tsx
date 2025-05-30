
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, XCircle, TrendingDown, User, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  const [timeFilter, setTimeFilter] = useState('all');

  const lostLeadsData = useMemo(() => {
    return sharedLeadsData.filter(lead => lead.status.toLowerCase().includes('lost'));
  }, [sharedLeadsData]);

  const filteredLostLeads = useMemo(() => {
    if (timeFilter === 'all') return lostLeadsData;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    return lostLeadsData.filter(lead => {
      if (!lead.parsedDate) return false;
      
      switch (timeFilter) {
        case 'daily':
          return lead.parsedDate >= today;
        case 'weekly':
          return lead.parsedDate >= thisWeek;
        case 'monthly':
          return lead.parsedDate >= thisMonth;
        case 'yearly':
          return lead.parsedDate >= thisYear;
        default:
          return true;
      }
    });
  }, [lostLeadsData, timeFilter]);

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
    if (!filteredLostLeads.length) return [];

    const timeData: { [key: string]: number } = {};
    
    filteredLostLeads.forEach(lead => {
      if (lead.parsedDate) {
        const dateKey = lead.parsedDate.toISOString().split('T')[0];
        timeData[dateKey] = (timeData[dateKey] || 0) + 1;
      }
    });

    return Object.entries(timeData)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
        fullDate: date
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [filteredLostLeads]);

  const lostLeadsByAssignee = useMemo(() => {
    if (!filteredLostLeads.length) return [];

    const assigneeData: { [key: string]: number } = {};
    
    filteredLostLeads.forEach(lead => {
      const assignee = lead['Assignee Name'] || 'Unassigned';
      assigneeData[assignee] = (assigneeData[assignee] || 0) + 1;
    });

    return Object.entries(assigneeData)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredLostLeads]);

  const lostLeadsByCity = useMemo(() => {
    if (!filteredLostLeads.length) return [];

    const cityData: { [key: string]: number } = {};
    
    filteredLostLeads.forEach(lead => {
      const city = lead.City;
      if (city && city.toLowerCase() !== 'unknown' && city.trim() !== '' && city.toLowerCase() !== 'n/a') {
        cityData[city] = (cityData[city] || 0) + 1;
      }
    });

    return Object.entries(cityData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredLostLeads]);

  const lossReasons = useMemo(() => {
    if (!filteredLostLeads.length) return [];

    const reasonCounts: { [key: string]: number } = {};
    filteredLostLeads.forEach(lead => {
      const reason = lead['Lost Reason'];
      if (reason && reason.trim() !== '' && reason.toLowerCase() !== 'unknown') {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      }
    });

    const total = Object.values(reasonCounts).reduce((sum, count) => sum + count, 0);
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLostLeads]);

  const recentLostLeads = useMemo(() => {
    return lostLeadsData
      .sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
      .slice(0, 10)
      .map(lead => ({
        name: lead.Name || 'Unknown',
        studentPreference: lead['Student Preference'] || 'Not specified',
        reason: lead['Lost Reason'] || 'Unknown',
        createdOn: lead.parsedDate ? lead.parsedDate.toLocaleDateString() : 'Unknown',
        assignee: lead['Assignee Name'] || 'Unassigned',
      }));
  }, [lostLeadsData]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lost Leads Analysis</h2>
        <div className="mt-2 sm:mt-0">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="daily">Today</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
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
              <LineChart data={lostLeadsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Loss Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between h-80">
              <ChartContainer config={{}} className="flex-1 h-full">
                <PieChart>
                  <Pie
                    data={lossReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {lossReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-medium">{data.reason}</p>
                            <p className="text-sm">{data.count} leads ({data.percentage}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                </PieChart>
              </ChartContainer>
              <div className="ml-4 space-y-2">
                {lossReasons.map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 truncate max-w-[120px]" title={item.reason}>
                      {item.reason}
                    </span>
                    <span className="ml-2 text-gray-500">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
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
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Assignee Name', position: 'insideBottom', offset: -5 }}
                />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
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
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
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
              <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-700">
                      {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Interested in {lead.studentPreference}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      <span className="font-medium">Reason:</span> {lead.reason}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Calendar className="h-3 w-3" />
                    {lead.createdOn}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {lead.assignee}
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
