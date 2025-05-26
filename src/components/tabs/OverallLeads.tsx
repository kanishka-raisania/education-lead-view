
import React, { useState } from 'react';
import { TrendingUp, Users, Phone, Mail, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const OverallLeads = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile.name);
      // Handle file upload logic here
    }
  };

  const stats = [
    {
      title: 'Total Leads',
      value: '2,847',
      change: '+12.3%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'This Month',
      value: '486',
      change: '+8.1%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Phone Calls',
      value: '1,234',
      change: '+5.4%',
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Email Inquiries',
      value: '1,613',
      change: '+15.2%',
      icon: Mail,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Overall Leads Overview</h2>
        <div className="mt-2 sm:mt-0">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 3 months</option>
          </select>
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
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lead Activity</h3>
        <div className="space-y-4">
          {[
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverallLeads;
