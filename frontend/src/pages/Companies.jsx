import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: search || undefined,
        industry: industry || undefined,
      };
      const response = await getCompanies(params);
      if (response.success) {
        setCompanies(response.data);
        // Companies API doesn't return pagination, set default pagination
        setPagination({
          pages: 1,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setError('Failed to load companies');
      }
    } catch (err) {
      setError('Failed to load companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, industry]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCompanies();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-danger-500 mb-4">Error</h2>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-pixel text-text mb-6 tracking-widest">Guilds</h1>
          <p className="text-xl text-muted font-game">
            Discover top guilds hiring and explore adventure opportunities
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-surface border border-border rounded-[2rem] shadow-adventure p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search guilds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-text placeholder-muted focus:border-primary-500 transition-colors font-game text-xl outline-none"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Filter by realm..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-2xl text-text placeholder-muted focus:border-primary-500 transition-colors font-game text-xl outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-primary-600 text-text font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-primary-500 hover:shadow-adventure border border-border transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/jobs?company=${company.id}`}
              className="bg-surface border border-border rounded-[2rem] shadow-adventure hover:border-primary-500 hover:-translate-y-2 transition-all duration-100 p-6 block group"
            >
              <div className="flex items-center mb-4">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    className="w-12 h-12 mr-3 object-contain border rounded-xl border-border bg-background p-1 filter grayscale group-hover:grayscale-0"
                  />
                ) : (
                  <div className="w-12 h-12 mr-3 bg-secondary-800 rounded-xl flex items-center justify-center border border-border">
                    <span className="text-primary-400 font-game text-lg">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg md:text-xl font-pixel text-text group-hover:text-primary-400 transition-colors">
                    {company.name}
                  </h3>
                  {company.industry && (
                    <p className="text-sm text-muted font-game mt-1">{company.industry}</p>
                  )}
                </div>
              </div>

              {company.description && (
                <p className="text-muted mb-4 line-clamp-2 font-game text-lg">
                  {company.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-[10px] font-bold text-warning-500 uppercase tracking-wider">
                  {company.job_count || 0} Quests
                </span>
                {company.website && (
                  <button
                    className="text-primary-500 hover:text-primary-400 font-bold text-[10px] uppercase transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(company.website, '_blank');
                    }}
                  >
                    Enter →
                  </button>
                )}
              </div>

              {company.location && (
                <div className="mt-4 pt-4 border-t border-border text-sm text-muted font-game flex items-center">
                  <span className="mr-2">🗺️</span> {company.location}
                </div>
              )}
            </Link>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No companies found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 text-sm font-bold text-muted bg-surface border border-border rounded-xl hover:bg-secondary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 text-sm font-bold rounded-xl flex items-center justify-center transition-all ${
                  page === currentPage
                    ? 'text-text bg-primary-600 shadow-adventure border border-primary-500/50 scale-105'
                    : 'text-muted bg-surface border border-border hover:border-primary-500 hover:text-primary-400'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 text-sm font-bold text-muted bg-surface border border-border rounded-xl hover:bg-secondary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
