
import React, { useMemo } from 'react';
import { AlertTriangle, Clock, XCircle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';

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
      .slice(-30); // Show last 30 days
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
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Top 7 cities
  }, [lostLeadsData]);

  const lossReasons = useMemo(() => {
    if (!lostLeadsData.length) {
      return [
        { reason: 'Budget constraints', count: 98, percentage: '28%' },
        { reason: 'Found another agency', count: 67, percentage: '19%' },
        { reason: 'Changed mind about studying abroad', count: 56, percentage: '16%' },
        { reason: 'No response to follow-ups', count: 45, percentage: '13%' },
        { reason: 'Visa rejection concerns', count: 34, percentage: '10%' },
        { reason: 'Other', count: 47, percentage: '14%' },
      ];
    }

    const reasonCounts: { [key: string]: number } = {};
    lostLeadsData.forEach(lead => {
      const reason = lead['Lost Reason'] || 'Unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const total = Object.values(reasonCounts).reduce((sum, count) => sum + count, 0);
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: total > 0 ? `${Math.round((count / total) * 100)}%` : '0%'
      }))
      .sort((a, b) => b.count - a.count);
  }, [lostLeadsData]);

  const lostLeads = useMemo(() => {
    if (!lostLeadsData.length) {
      return [
        {
          name: 'James Wilson',
          country: 'Canada',
          reason: 'Budget constraints',
          lostDate: '2024-01-15',
          counselor: 'Jessica Martinez',
          potential: 'High',
        },
        {
          name: 'Lisa Chen',
          country: 'Australia',
          reason: 'Changed mind about studying abroad',
          lostDate: '2024-01-14',
          counselor: 'Alex Thompson',
          potential: 'Medium',
        },
        {
          name: 'Mohammed Al-Rashid',
          country: 'UK',
          reason: 'Found another agency',
          lostDate: '2024-01-13',
          counselor: 'Priya Sharma',
          potential: 'High',
        },
        {
          name: 'Sofia Rodriguez',
          country: 'Germany',
          reason: 'Visa rejection concerns',
          lostDate: '2024-01-12',
          counselor: 'Robert Wilson',
          potential: 'Low',
        },
        {
          name: 'David Kim',
          country: 'Canada',
          reason: 'No response to follow-ups',
          lostDate: '2024-01-11',
          counselor: 'Jessica Martinez',
          potential: 'Medium',
        },
      ];
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lost Leads Analysis</h2>
        <div className="mt-2 sm:mt-0">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 3 months</option>
          </select>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Loss Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lossReasons.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                      <span className="text-sm text-gray-500">{item.count} leads ({item.percentage})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: item.percentage }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Lost Leads</h3>
        </div>
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
      </div>
    </div>
  );
};

export default LostLeads;
