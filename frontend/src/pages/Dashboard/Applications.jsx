import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { applicationAPI } from '../../services/api';

const Applications = () => {
  const [filter, setFilter] = useState('all');
  
  const { data: applicationsData, isLoading, error, refetch } = useQuery({
    queryKey: ['applications', filter],
    queryFn: () => applicationAPI.getMyApplications(),
    onError: (error) => {
      toast.error('Failed to load applications');
      console.error('Applications error:', error);
    }
  });

  // Handle different response structures
  const applications = Array.isArray(applicationsData) 
    ? applicationsData 
    : applicationsData?.data?.applications 
    ? applicationsData.data.applications 
    : applicationsData?.applications 
    ? applicationsData.applications 
    : applicationsData?.data 
    ? applicationsData.data 
    : [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning-500/20 text-warning-400';
      case 'accepted':
        return 'bg-success-500/20 text-success-400';
      case 'rejected':
        return 'bg-danger-500/20 text-danger-400';
      case 'reviewed':
        return 'bg-secondary-500/20 text-secondary-400';
      default:
        return 'bg-background text-muted border border-border';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Convert to India timezone
    const date = new Date(dateString);
    const indiaTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const now = new Date();
    const indiaNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    // For same day in India
    if (indiaTime.toDateString() === indiaNow.toDateString()) {
      return 'Today';
    }
    
    // For yesterday in India
    const yesterday = new Date(indiaNow);
    yesterday.setDate(yesterday.getDate() - 1);
    if (indiaTime.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For other dates, show in Indian format
    return indiaTime.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: indiaTime.getFullYear() !== indiaNow.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredApplications = Array.isArray(applications) ? applications.filter(app => {
    if (filter === 'all') return true;
    return app.status?.toLowerCase() === filter.toLowerCase();
  }) : [];

  if (isLoading) {
  return (
    <div className="min-h-screen bg-background text-text pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-text pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text mb-4">Error Loading Applications</h2>
            <p className="text-muted mb-4">There was an error loading your job applications.</p>
            <button
              onClick={() => refetch()}
              className="bg-primary-600 text-text px-4 py-2 rounded-md hover:bg-primary-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">My Applications</h1>
          <p className="mt-2 text-muted">Track the status of your job applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {['all', 'pending', 'accepted', 'rejected', 'reviewed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  filter === status
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-muted/70 hover:text-muted hover:border-border'
                }`}
              >
                {status}
              </button>
            ))}
          </nav>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text mb-2">No applications found</h3>
              <p className="text-muted">
                {filter === 'all' 
                  ? "You haven't applied to any jobs yet. Start browsing jobs to apply!"
                  : `No ${filter} applications found.`}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => window.location.href = '/jobs'}
                  className="mt-4 bg-primary-600 text-text px-4 py-2 rounded-md hover:bg-primary-500"
                >
                  Browse Jobs
                </button>
              )}
            </div>
          ) : (
            filteredApplications?.map((application) => (
              <div key={application.id} className="bg-surface border border-border shadow-adventure rounded-[2rem] p-6 hover:border-primary-500/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-text group-hover:text-primary-400 mr-3">
                        {application.job_title || 'Job Title'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {application.company_name || 'Company Name'}
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {application.location || 'Location'}
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Applied on {formatDate(application.created_at || application.applied_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <button
                      onClick={() => window.location.href = `/jobs/${application.job_slug || application.job_id}`}
                      className="text-primary-500 hover:text-primary-400 text-sm font-medium"
                    >
                      View Job
                    </button>
                    {application.resume_url && (
                      <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-text text-sm"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
