import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FileUp, Users, TrendingUp, LayoutDashboard, User } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  setSharedLeadsData: React.Dispatch<React.SetStateAction<LeadData[]>>;
}

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
];

const OverallLeads = ({ sharedLeadsData, setSharedLeadsData }: OverallLeadsProps) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvData = e.target.result;
        parseCSV(csvData);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvData: string) => {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map((header: string) => header.trim());
    const parsedData: LeadData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        const lead: any = {};
        for (let j = 0; j < headers.length; j++) {
          lead[headers[j]] = values[j].trim();
        }
        try {
          lead.parsedDate = new Date(lead['Created On']);
        } catch (error) {
          console.error("Error parsing date:", lead['Created On'], error);
          lead.parsedDate = null;
        }
        parsedData.push(lead as LeadData);
      }
    }
    setSharedLeadsData(parsedData);
  };

  const processedData = useMemo(() => {
    return sharedLeadsData.filter(lead => lead.Name && lead.Email && lead.Phone);
  }, [sharedLeadsData]);

  const leadsByAssignee = useMemo(() => {
    if (!processedData.length) return [];
    
    const assigneeCounts: { [key: string]: number } = {};
    processedData.forEach(lead => {
      const assignee = lead['Assignee Name'];
      if (assignee && assignee.trim() !== '') {
        assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
      }
    });

    return Object.entries(assigneeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [processedData]);

  const top5PerformingAds = useMemo(() => {
    if (!processedData.length) return [];
    
    const adCounts: { [key: string]: number } = {};
    processedData.forEach(lead => {
      const fbAd = lead['Facebook Ad'];
      if (fbAd && fbAd.trim() !== '') {
        adCounts[fbAd] = (adCounts[fbAd] || 0) + 1;
      }
    });

    return Object.entries(adCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [processedData]);

  const leadsOverTimeData = useMemo(() => {
    if (!processedData.length) return [];

    const monthlyCounts: { [key: string]: number } = {};
    processedData.forEach(lead => {
      if (lead.parsedDate) {
        const monthYear = `${lead.parsedDate.getMonth() + 1}/${lead.parsedDate.getFullYear()}`;
        monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
      }
    });

    return Object.entries(monthlyCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [processedData]);

  const leadStatusCounts: { [key: string]: number } = useMemo(() => {
    const counts: { [key: string]: number } = {};
    processedData.forEach(lead => {
      const status = lead.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [processedData]);

  const pieChartData = useMemo(() => {
    return Object.entries(leadStatusCounts)
      .map(([name, value]) => ({ name, value }));
  }, [leadStatusCounts]);

  const metrics = [
    {
      title: 'Total Leads',
      value: processedData.length.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'New Leads',
      value: processedData.filter(lead => {
        const createdOn = new Date(lead['Created On']).getTime();
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return createdOn > thirtyDaysAgo;
      }).length.toLocaleString(),
      change: '+8%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Avg. Response Time',
      value: '4.5 hours',
      change: '-3%',
      icon: LayoutDashboard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Conversion Rate',
      value: '18.4%',
      change: '+1.2%',
      icon: FileUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentLeadsActivity = [
    {
      name: 'John Doe',
      action: 'Sent an email',
      time: '5 minutes ago',
      status: 'Replied',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      name: 'Jane Smith',
      action: 'Scheduled a call',
      time: '30 minutes ago',
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      name: 'Alice Johnson',
      action: 'Downloaded brochure',
      time: '1 hour ago',
      status: 'Completed',
      statusColor: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Overall Leads Overview</h2>
        <div className="mt-2 sm:mt-0">
          <label htmlFor="csv-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
            Upload CSV File
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-sm text-green-600 mt-1">{metric.change} from last month</p>
                </div>
                <div className={`${metric.bgColor} ${metric.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Assignee - Column Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Assignee</h3>
          <ChartContainer config={{}} className="h-80">
            <BarChart data={leadsByAssignee} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Top 5 Performing Ads - Column Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Performing Ads</h3>
          <ChartContainer config={{}} className="h-80">
            <BarChart data={top5PerformingAds} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Leads Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Over Time</h3>
          <ChartContainer config={{}} className="h-80">
            <LineChart data={leadsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Lead Status Distribution - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
          <div className="flex items-center gap-6 h-80">
            <div className="flex-shrink-0 w-40">
              <div className="flex flex-col space-y-2 text-sm">
                {pieChartData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-gray-700 text-xs truncate">{entry.name}</span>
                    <span className="text-gray-500 text-xs">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ChartContainer config={{}} className="h-full">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Lead Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Lead Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentLeadsActivity.map((activity, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.statusColor}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverallLeads;
