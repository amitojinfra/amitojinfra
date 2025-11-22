import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  formatEmployeeForDisplay, 
  calculateYearsOfService, 
  getEmployeeStatus 
} from '../../lib/models/Employee';

const EmployeeList = ({ 
  employees = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onSearch,
  showActions = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Filter and sort employees
  useEffect(() => {
    let filtered = [...employees];

    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(employee => 
        employee.name?.toLowerCase().includes(term) ||
        employee.aadhar_id?.includes(term) ||
        (employee.searchKeywords && employee.searchKeywords.some(keyword => 
          keyword.includes(term)
        ))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'joining_date':
          aValue = new Date(a.joining_date || 0);
          bValue = new Date(b.joining_date || 0);
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0);
          bValue = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, sortBy, sortOrder]);

  // Handle search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Call parent search handler if provided
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle delete with confirmation
  const handleDelete = (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      onDelete(employee.id);
    }
  };

  if (loading) {
    return (
      <div className="employee-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="employee-list">
      {/* Search and Controls */}
      <div className="list-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search employees by name or Aadhar ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>

        <div className="sort-section">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="createdAt-desc">Recently Added</option>
            <option value="createdAt-asc">Oldest Added</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="designation-asc">Designation (A-Z)</option>
            <option value="designation-desc">Designation (Z-A)</option>
            <option value="joining_date-desc">Latest Joined</option>
            <option value="joining_date-asc">Earliest Joined</option>
            <option value="age-desc">Age (High to Low)</option>
            <option value="age-asc">Age (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span className="results-count">
          {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
        </span>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="clear-search"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Employee Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No employees found</h3>
          {searchTerm ? (
            <p>No employees match your search criteria. Try a different search term.</p>
          ) : (
            <p>No employees have been added yet. Add your first employee to get started!</p>
          )}
          {!searchTerm && (
            <Link href="/employees/new" className="add-employee-btn">
              Add First Employee
            </Link>
          )}
        </div>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map((employee) => {
            const formattedEmployee = formatEmployeeForDisplay(employee);
            const yearsOfService = calculateYearsOfService(employee.joining_date);
            const status = getEmployeeStatus(employee.joining_date);

            return (
              <div key={employee.id} className="employee-card">
                <div className="card-header">
                  <div className="employee-info">
                    <h3 className="employee-name">{formattedEmployee.name}</h3>
                    <div 
                      className="employee-status" 
                      style={{ backgroundColor: status.color }}
                    >
                      {status.label}
                    </div>
                  </div>
                  {showActions && (
                    <div className="card-actions">
                      <button
                        onClick={() => onEdit(employee)}
                        className="action-btn edit-btn"
                        title="Edit employee"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(employee)}
                        className="action-btn delete-btn"
                        title="Delete employee"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  <div className="employee-details">
                    <div className="detail-row">
                      <span className="detail-label">Employee ID:</span>
                      <span className="detail-value">{employee.id.slice(0, 8)}...</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Designation:</span>
                      <span className="detail-value designation">{formattedEmployee.designation}</span>
                    </div>

                    {employee.aadhar_id && (
                      <div className="detail-row">
                        <span className="detail-label">Aadhar ID:</span>
                        <span className="detail-value">{formattedEmployee.aadhar_id}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="detail-label">Joining Date:</span>
                      <span className="detail-value">{formattedEmployee.formatted_joining_date}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Years of Service:</span>
                      <span className="detail-value service-years">{yearsOfService}</span>
                    </div>

                    {employee.age && (
                      <div className="detail-row">
                        <span className="detail-label">Age:</span>
                        <span className="detail-value">{formattedEmployee.age}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="card-meta">
                    <span className="added-date">
                      Added: {employee.createdAt ? 
                        new Date(employee.createdAt.seconds ? 
                          employee.createdAt.seconds * 1000 : 
                          employee.createdAt
                        ).toLocaleDateString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .employee-list {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .employee-list-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          color: #666;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007cba;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .list-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-section {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .sort-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-section label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .sort-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .results-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .results-count {
          color: #666;
          font-size: 14px;
        }

        .clear-search {
          background: none;
          border: none;
          color: #007cba;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .add-employee-btn {
          display: inline-block;
          padding: 12px 24px;
          background: #007cba;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .add-employee-btn:hover {
          background: #005a87;
        }

        .employee-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .employee-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .employee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 10px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .employee-info {
          flex: 1;
        }

        .employee-name {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .employee-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .edit-btn {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
        }

        .edit-btn:hover {
          background: #ffeaa7;
        }

        .delete-btn {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }

        .delete-btn:hover {
          background: #f5c6cb;
        }

        .card-body {
          padding: 20px;
        }

        .employee-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .service-years {
          color: #059669;
          font-weight: 600;
        }

        .designation {
          color: #1d4ed8;
          font-weight: 600;
          text-transform: capitalize;
        }

        .card-footer {
          padding: 12px 20px;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .added-date {
          font-size: 11px;
          color: #9ca3af;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .employee-list {
            padding: 10px;
          }
          
          .list-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-section {
            min-width: auto;
          }
          
          .employee-grid {
            grid-template-columns: 1fr;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .card-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeList;