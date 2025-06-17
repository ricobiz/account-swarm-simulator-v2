
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MetricsPanel: React.FC = () => {
  const activityData = [
    { time: '00:00', accounts: 120, actions: 45 },
    { time: '04:00', accounts: 85, actions: 28 },
    { time: '08:00', accounts: 280, actions: 156 },
    { time: '12:00', accounts: 420, actions: 234 },
    { time: '16:00', accounts: 380, actions: 189 },
    { time: '20:00', accounts: 310, actions: 167 },
  ];

  const platformData = [
    { name: 'Instagram', value: 45, color: '#E1306C' },
    { name: 'Twitter', value: 25, color: '#1DA1F2' },
    { name: 'TikTok', value: 20, color: '#000000' },
    { name: 'Facebook', value: 10, color: '#4267B2' },
  ];

  const successData = [
    { day: 'Mon', success: 92, failed: 8 },
    { day: 'Tue', success: 95, failed: 5 },
    { day: 'Wed', success: 88, failed: 12 },
    { day: 'Thu', success: 94, failed: 6 },
    { day: 'Fri', success: 96, failed: 4 },
    { day: 'Sat', success: 91, failed: 9 },
    { day: 'Sun', success: 93, failed: 7 },
  ];

  const COLORS = ['#E1306C', '#1DA1F2', '#000000', '#4267B2'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Analytics & Metrics</h3>
        <p className="text-gray-400">Monitor performance and activity metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Account Activity (24h)</CardTitle>
            <CardDescription className="text-gray-400">
              Active accounts and actions performed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#F9FAFB'
                  }} 
                />
                <Area type="monotone" dataKey="accounts" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="actions" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Platform Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Account distribution across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Success Rate (7 days)</CardTitle>
            <CardDescription className="text-gray-400">
              Daily success and failure rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={successData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="success" stackId="a" fill="#10B981" />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Performance Trends</CardTitle>
            <CardDescription className="text-gray-400">
              Actions per hour trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="actions" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-200 text-lg">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">24,567</div>
            <p className="text-blue-200 text-sm">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-200 text-lg">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">94.2%</div>
            <p className="text-green-200 text-sm">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-200 text-lg">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1.2s</div>
            <p className="text-purple-200 text-sm">-0.3s improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-200 text-lg">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">99.8%</div>
            <p className="text-orange-200 text-sm">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsPanel;
