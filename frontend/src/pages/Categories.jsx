import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getCategories({ include_job_count: true });
        console.log('Categories response:', response);
        if (response.success && response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    <div className="min-h-screen bg-background text-text py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-pixel text-text mb-6 tracking-widest">Quest Types</h1>
          <p className="text-xl text-muted font-game">
            Choose your path and find your perfect adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(category => Number(category.job_count) > 0).map((category) => (
            <Link
              key={category.id}
              to={`/jobs?category=${category.slug}`}
              className="bg-surface border border-border rounded-[2rem] shadow-adventure hover:border-primary-500 hover:-translate-y-2 transition-all duration-100 p-6 block group"
            >
              <div className="flex items-center mb-4">
                {category.icon && (
                  <div className="text-3xl mr-3 text-primary-400 group-hover:text-primary-300 transition-colors">
                    {category.icon}
                  </div>
                )}
                <h3 className="text-xl font-pixel text-text group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
              </div>

              {category.description && (
                <p className="text-muted mb-4 line-clamp-2 font-game text-lg">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs font-bold text-warning-500 uppercase">
                  {category.job_count || 0} Quests
                </span>
                <span className="text-primary-500 group-hover:text-primary-400 font-bold text-[10px] uppercase transition-colors">
                  Enter →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
