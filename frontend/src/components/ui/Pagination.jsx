import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading = false }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (!isLoading && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to show (Logic preserved)
  const getVisiblePages = () => {
    const delta = 2; 
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav 
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6"
    >
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm sm:w-auto w-full justify-center ${
            currentPage === 1 || isLoading
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="w-8 text-center text-gray-400 font-bold select-none">...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page)}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center ${
                    page === currentPage
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                      : isLoading
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 active:scale-90 shadow-sm'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm sm:w-auto w-full justify-center ${
            currentPage === totalPages || isLoading
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 active:scale-95'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Mobile-only page indicator for very small screens */}
      <div className="sm:hidden text-xs font-medium text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;