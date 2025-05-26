
import React from 'react';
import { AlertTriangle, Clock, XCircle, RefreshCw } from 'lucide-react';

const LostLeads = () => {
  const lostLeadStats = [
    {
      title: 'Total Lost Leads',
      value: '347',
      change: '+12.3%',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Lost This Month',
      value: '58',
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
      title: 'Recovery Rate',
      value: '18%',
      change: '+2.1%',
      icon: RefreshCw,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const lostLeads = [
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

  const lossReasons = [
    { reason: 'Budget constraints', count: 98, percentage: '28%' },
    { reason: 'Found another agency', count: 67, percentage: '19%' },
    { reason: 'Changed mind about studying abroad', count: 56, percentage: '16%' },
    { reason: 'No response to follow-ups', count: 45, percentage: '13%' },
    { reason: 'Visa rejection concerns', count: 34, percentage: '10%' },
    { reason: 'Other', count: 47, percentage: '14%' },
  ];

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
                    stat.title === 'Recovery Rate' || stat.title === 'Avg. Time to Loss' ? 
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Loss Reasons</h3>
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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recovery Opportunities</h3>
          <div className="space-y-4">
            {lostLeads.filter(lead => lead.potential === 'High').map((lead, index) => (
              <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-600">Interested in {lead.country}</p>
                    <p className="text-sm text-orange-600 mt-1">Reason: {lead.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      High Potential
                    </span>
                    <button className="block mt-2 px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors">
                      Re-engage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                  Recovery Potential
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.potential === 'High' ? 'bg-red-100 text-red-800' :
                      lead.potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lead.potential}
                    </span>
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
