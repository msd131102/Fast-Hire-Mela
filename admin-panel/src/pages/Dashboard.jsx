import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { analyticsAPI, jobsAPI, usersAPI, categoriesAPI } from '../services/api';
import {
  Building,
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  Briefcase,
  UserPlus,
  DollarSign,
  BarChart3,
  FileText,
  Clock,
  Eye,
  Tag,
  Calendar,
  ExternalLink,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalUsers: 0,
    premiumUsers: 0,
    totalCompanies: 0,
    totalApplications: 0,
    revenue: 0,
    monthlyRevenue: 0
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats from API
      const statsResponse = await analyticsAPI.getDashboardStats();
      const data = statsResponse.data.data;

      // Map backend data to frontend structure
      setStats({
        totalJobs: data.overview.totalJobs,
        activeJobs: data.overview.activeJobs,
        totalUsers: 2434,
        premiumUsers: 742,
        totalApplications: data.overview.totalApplications,
        totalViews: data.overview.totalViews,
        totalCompanies: data.topCompanies?.length || 0,
        revenue: 14350, // Backend doesn't provide this yet
        monthlyRevenue: 0 // Backend doesn't provide this yet
      });

      // Map recent jobs from backend data
      setRecentJobs(data.mostViewedJobs?.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: 'Not specified',
        type: 'Full-time',
        posted: 'Recently'
      })) || []);

      // Fetch recent users from API (backend doesn't provide this in dashboard)
      const usersResponse = await usersAPI.getUsers({ limit: 5, sort: 'createdAt:desc' });
      setRecentUsers(usersResponse.data.data?.users?.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.is_premium ? 'Premium' : 'Regular',
        joined: new Date(user.created_at).toLocaleDateString()
      })) || []);

      // Map top categories from backend data
      setTopCategories(data.topCategories?.map((category, index) => ({
        name: category.name,
        count: parseInt(category.job_count),
        percentage: Math.round((parseInt(category.job_count) / data.overview.totalJobs) * 100)
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Jobs',
      value: (stats.totalJobs || 0).toLocaleString(),
      change: '+12%',
      changeType: 'increase',
      icon: Briefcase,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Jobs',
      value: (stats.activeJobs || 0).toLocaleString(),
      change: '+8%',
      changeType: 'increase',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      change: '+23%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Premium Users',
      value: (stats.premiumUsers || 0).toLocaleString(),
      change: '+15%',
      changeType: 'increase',
      icon: UserPlus,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Companies',
      value: (stats.totalCompanies || 0).toLocaleString(),
      change: '+5%',
      changeType: 'increase',
      icon: Building,
      color: 'bg-indigo-500'
    },
    {
      title: 'Applications',
      value: (stats.totalApplications || 0).toLocaleString(),
      change: '+18%',
      changeType: 'increase',
      icon: FileText,
      color: 'bg-red-500'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.revenue || 0).toLocaleString()}`,
      change: '+32%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`,
      change: '+28%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-teal-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening on your platform today.</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'increase' ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest job postings on the platform</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {job.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {job.posted}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.type === 'Premium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {user.joined}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Job Categories</CardTitle>
          <CardDescription>Most popular job categories this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                    <Tag className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.count} jobs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
