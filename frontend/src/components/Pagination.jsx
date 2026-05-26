import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      background: '#fff',
      borderTop: '1px solid #e2e8f0',
      borderRadius: '0 0 12px 12px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Left: Items per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1e293b',
            background: '#fff',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span style={{ fontSize: '13px', color: '#64748b' }}>entries</span>
      </div>

      {/* Center: Page info */}
      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Showing <strong style={{ color: '#1e293b' }}>{startItem}</strong> to{' '}
        <strong style={{ color: '#1e293b' }}>{endItem}</strong> of{' '}
        <strong style={{ color: '#1e293b' }}>{totalItems}</strong> entries
      </div>

      {/* Right: Page navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: currentPage === 1 ? '#f8fafc' : '#fff',
            color: currentPage === 1 ? '#cbd5e1' : '#64748b',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.15s'
          }}
          title="First page"
        >
          ««
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: currentPage === 1 ? '#f8fafc' : '#fff',
            color: currentPage === 1 ? '#cbd5e1' : '#64748b',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.15s'
          }}
          title="Previous page"
        >
          ‹
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => page !== '...' && onPageChange(page)}
            disabled={page === '...'}
            style={{
              padding: '6px 12px',
              border: page === currentPage ? '1px solid #7c3aed' : '1px solid #e2e8f0',
              borderRadius: '6px',
              background: page === currentPage ? '#7c3aed' : '#fff',
              color: page === currentPage ? '#fff' : page === '...' ? '#94a3b8' : '#1e293b',
              cursor: page === '...' ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: page === currentPage ? '600' : '500',
              transition: 'all 0.15s',
              minWidth: '36px'
            }}
          >
            {page}
          </button>
        ))}

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: currentPage === totalPages ? '#f8fafc' : '#fff',
            color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.15s'
          }}
          title="Next page"
        >
          ›
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: currentPage === totalPages ? '#f8fafc' : '#fff',
            color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.15s'
          }}
          title="Last page"
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;
