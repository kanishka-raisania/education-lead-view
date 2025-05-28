
import React, { useState, useMemo } from 'react';
import { Star, Award, Target, TrendingUp, Users, AlertTriangle, UserCheck, ArrowLeft, Filter, Calendar } from 'lucide-react';
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
  ResponsiveContainer
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, getISOWeek } from 'date-fns';

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

interface CounselorData {
  assigneeName: string;
  totalLeads: number;
  lostLeads: number;
  docsReceived: number;
  applicationFiled: number;
  depositPaid: number;
  converted: number;
  conversionRate: number;
}

interface CounselorPerformanceProps {
  sharedLeadsData: LeadData[];
}

const CounselorPerformance = ({ sharedLeadsData }: CounselorPerformanceProps) => {
  const [timeFilter, setTimeFilter] = useState('Monthly');
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);

  // Process data from shared leads data
  const counselorsData: CounselorData[] = useMemo(() => {
    if (!sharedLeadsData.length) return [];

    const counselorStats: { [key: string]: any } = {};
    
    sharedLeadsData.forEach(lead => {
      const assignee = lead['Assignee Name'];
      if (!assignee || assignee.trim() === '') return;
      
      if (!counselorStats[assignee]) {
        counselorStats[assignee] = {
          assigneeName: assignee,
          totalLeads: 0,
          lostLeads: 0,
          docsReceived: 0,
          applicationFiled: 0,
          depositPaid: 0,
          converted: 0,
          conversionRate: 0
        };
      }
      
      const stats = counselorStats[assignee];
      stats.totalLeads++;
      
      const status = lead.status.toLowerCase();
      
      if (status.includes('lost')) {
        stats.lostLeads++;
      }
      if (status.includes('docs received') || status.includes('documentation')) {
        stats.docsReceived++;
      }
      if (status.includes('application filed') || status.includes('applied')) {
        stats.applicationFiled++;
      }
      if (status.includes('deposit') || status.includes('fee paid')) {
        stats.depositPaid++;
      }
      if (status.includes('registered to university') || status.includes('enrolled')) {
        stats.converted++;
      }
    });
    
    // Calculate conversion rates
    Object.values(counselorStats).forEach((counselor: any) => {
      counselor.conversionRate = counselor.totalLeads > 0 
        ? Math.round((counselor.converted / counselor.totalLeads) * 100)
        : 0;
    });
    
    return Object.values(counselorStats);
  }, [sharedLeadsData]);

  const topPerformer = useMemo(() => {
    if (!counselorsData.length) return null;
    return counselorsData.reduce((prev, current) => 
      (prev.conversionRate > current.conversionRate) ? prev : current
    );
  }, [counselorsData]);

  const averageConversionRate = useMemo(() => {
    if (!counselorsData.length) return '0';
    const total = counselorsData.reduce((sum, counselor) => sum + counselor.conversionRate, 0);
    return (total / counselorsData.length).toFixed(1);
  }, [counselorsData]);

  const totalDeposits = useMemo(() => {
    return counselorsData.reduce((sum, counselor) => sum + counselor.depositPaid, 0);
  }, [counselorsData]);

  const currentCounselor = useMemo(() => {
    return counselorsData.find(c => c.assigneeName === selectedCounselor);
  }, [selectedCounselor, counselorsData]);

  // Chart colors
  const CHART_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
  ];

  // Mock data for individual counselor charts (would be filtered by counselor in real implementation)
  const leadsOverTimeData = useMemo(() => {
    if (!selectedCounselor || !sharedLeadsData.length) {
      return [
        { time: 'Jan 2024', count: 12 },
        { time: 'Feb 2024', count: 15 },
        { time: 'Mar 2024', count: 18 },
        { time: 'Apr 2024', count: 14 },
        { time: 'May 2024', count: 20 },
      ];
    }

    const timeCounts: { [key: string]: { count: number; sortKey: string } } = {};
    const counselorLeads = sharedLeadsData.filter(lead => lead['Assignee Name'] === selectedCounselor);
    
    counselorLeads.forEach(lead => {
      if (!lead.parsedDate) return;
      
      let timeKey: string;
      let sortKey: string;
      
      switch (timeFilter) {
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
  }, [selectedCounselor, sharedLeadsData, timeFilter]);

  const funnelData = useMemo(() => [
    { stage: 'Docs Received', count: currentCounselor?.docsReceived || 0 },
    { stage: 'Application Filed', count: currentCounselor?.applicationFiled || 0 },
    { stage: 'Deposit Paid', count: currentCounselor?.depositPaid || 0 },
    { stage: 'Registered', count: currentCounselor?.converted || 0 },
  ], [currentCounselor]);

  const dnpData = useMemo(() => {
    if (!selectedCounselor || !sharedLeadsData.length) {
      return [
        { name: 'DNP1', value: 0 },
        { name: 'DNP2', value: 0 },
        { name: 'DNP3', value: 0 },
        { name: 'DNP4', value: 0 },
      ];
    }

    const dnpCounts: { [key: string]: number } = { DNP1: 0, DNP2: 0, DNP3: 0, DNP4: 0 };
    const counselorLeads = sharedLeadsData.filter(lead => lead['Assignee Name'] === selectedCounselor);
    
    counselorLeads.forEach(lead => {
      const status = lead.status.toUpperCase();
      if (status.includes('DNP1')) dnpCounts.DNP1++;
      else if (status.includes('DNP2')) dnpCounts.DNP2++;
      else if (status.includes('DNP3')) dnpCounts.DNP3++;
      else if (status.includes('DNP4')) dnpCounts.DNP4++;
    });
    
    return Object.entries(dnpCounts).map(([name, value]) => ({ name, value }));
  }, [selectedCounselor, sharedLeadsData]);

  const lostReasonData = useMemo(() => {
    if (!selectedCounselor || !sharedLeadsData.length) {
      return [];
    }

    const reasonCounts: { [key: string]: number } = {};
    const counselorLeads = sharedLeadsData
      .filter(lead => lead['Assignee Name'] === selectedCounselor && lead.status.toLowerCase().includes('lost'));
    
    counselorLeads.forEach(lead => {
      const reason = lead['Lost Reason'] || 'Unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    return Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));
  }, [selectedCounselor, sharedLeadsData]);

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-col space-y-2 text-sm max-w-48">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 text-xs truncate">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (selectedCounselor && currentCounselor) {
    // View 2: Individual Counselor
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCounselor(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Counselors
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{currentCounselor.assigneeName}</h2>
          </div>
          <div className="mt-2 sm:mt-0 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {timeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((filter) => (
                  <DropdownMenuItem key={filter} onClick={() => setTimeFilter(filter)}>
                    {filter}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Total Leads', value: currentCounselor.totalLeads, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
            { title: 'Docs Received', value: currentCounselor.docsReceived, icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
            { title: 'Application Filed', value: currentCounselor.applicationFiled, icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' },
            { title: 'Deposit Paid', value: currentCounselor.depositPaid, icon: Award, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
            { title: 'Lost Leads', value: currentCounselor.lostLeads, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
            { title: 'Converted', value: currentCounselor.converted, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Leads Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <LineChart data={leadsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Funnel Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <BarChart data={funnelData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* DNP Chart */}
          <Card>
            <CardHeader>
              <CardTitle>DNP Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <BarChart data={dnpData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Lost Reason Pie Chart */}
          {lostReasonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lost Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-40">
                    <CustomLegend payload={lostReasonData.map((item, index) => ({
                      value: item.name,
                      color: CHART_COLORS[index % CHART_COLORS.length]
                    }))} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChartContainer config={{}} className="h-80">
                      <PieChart width={320} height={320}>
                        <Pie
                          data={lostReasonData}
                          cx="50%"
                          cy="50%"
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
    );
  }

  // View 1: All Counselors
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Counselor Performance</h2>
        <div className="mt-2 sm:mt-0 flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {timeFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((filter) => (
                <DropdownMenuItem key={filter} onClick={() => setTimeFilter(filter)}>
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Select Counselor
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {counselorsData.map((counselor) => (
                <DropdownMenuItem 
                  key={counselor.assigneeName} 
                  onClick={() => setSelectedCounselor(counselor.assigneeName)}
                >
                  {counselor.assigneeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Top 3 Scorecards - Now Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                <p className="text-xl font-bold text-gray-900">{topPerformer?.assigneeName || 'No data'}</p>
                <p className="text-sm text-green-600">{topPerformer?.conversionRate || 0}% conversion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Conversion</p>
                <p className="text-xl font-bold text-gray-900">{averageConversionRate}%</p>
                <p className="text-sm text-blue-600">Based on uploaded data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-xl font-bold text-gray-900">{totalDeposits}</p>
                <p className="text-sm text-yellow-600">Across all counselors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lost Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docs Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Converted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {counselorsData.map((counselor, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCounselor(counselor.assigneeName)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {counselor.assigneeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{counselor.assigneeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {counselor.totalLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {counselor.lostLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {counselor.docsReceived}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {counselor.converted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        counselor.conversionRate >= 10 ? 'bg-green-100 text-green-800' :
                        counselor.conversionRate >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {counselor.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CounselorPerformance;
