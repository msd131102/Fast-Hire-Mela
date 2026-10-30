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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Categories</h1>
          <p className="text-xl text-gray-600">
            Explore jobs by category and find your perfect career match
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/jobs?category=${category.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 block"
            >
              <div className="flex items-center mb-4">
                {category.icon && (
                  <div className="text-3xl mr-3">
                    {category.icon}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {category.name}
                </h3>
              </div>

              {category.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.job_count || 0} jobs available
                </span>
                <span className="text-blue-600 hover:text-blue-800 font-medium">
                  View Jobs →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
