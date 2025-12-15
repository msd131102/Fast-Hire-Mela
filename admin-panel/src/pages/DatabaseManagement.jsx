import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle, Clock, HardDrive, Activity, Settings, FileText, Search, Filter, X, Eye, Key, Type, Calendar, Users, Zap, Link, Play, Pause } from 'lucide-react';
import { databaseAPI } from '../services/api';

const DatabaseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [databaseStats, setDatabaseStats] = useState({
    totalSize: 0,
    totalTables: 0,
    totalRecords: 0,
    lastBackup: null,
    status: 'healthy'
  });
  const [tables, setTables] = useState([]);
  const [backups, setBackups] = useState([]);
  const [operations, setOperations] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [loadingTableDetails, setLoadingTableDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(50);

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      
      // Fetch all database information in parallel
      const [statsResponse, tablesResponse, backupsResponse, operationsResponse] = await Promise.all([
        databaseAPI.getStats(),
        databaseAPI.getTables(),
        databaseAPI.getBackups(),
        databaseAPI.getOperations()
      ]);

      setDatabaseStats(statsResponse.data);
      setTables(tablesResponse.data);
      setBackups(backupsResponse.data);
      setOperations(operationsResponse.data);
    } catch (error) {
      console.error('Error fetching database information:', error);
      // Set default values on error
      setDatabaseStats({
        totalSize: '0 MB',
        totalTables: 0,
        totalRecords: 0,
        lastBackup: null,
        status: 'error'
      });
      setTables([]);
      setBackups([]);
      setOperations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getOperationIcon = (type) => {
    switch (type) {
      case 'backup':
        return <Download className="w-4 h-4" />;
      case 'restore':
        return <Upload className="w-4 h-4" />;
      case 'optimize':
        return <Settings className="w-4 h-4" />;
      case 'cleanup':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const handleBackup = async () => {
    try {
      await databaseAPI.createBackup();
      console.log('Creating backup...');
      // Refresh data after backup
      fetchDatabaseInfo();
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const handleRestore = async (backupId) => {
    try {
      await databaseAPI.restoreBackup(backupId);
      console.log('Restoring backup:', backupId);
      fetchDatabaseInfo();
    } catch (error) {
      console.error('Error restoring backup:', error);
    }
  };

  const handleOptimize = async () => {
    try {
      await databaseAPI.optimize();
      console.log('Optimizing database...');
      fetchDatabaseInfo();
    } catch (error) {
      console.error('Error optimizing database:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      await databaseAPI.cleanup();
      console.log('Cleaning up database...');
      fetchDatabaseInfo();
    } catch (error) {
      console.error('Error cleaning up database:', error);
    }
  };

  const handleViewTable = async (tableName, page = 0, limit = 50) => {
    try {
      setLoadingTableDetails(true);
      setSelectedTable(null);
      setShowTableModal(true);
      setCurrentPage(page);
      
      const response = await databaseAPI.getTableDetails(tableName, { limit, offset: page * limit });
      setSelectedTable(response.data);
    } catch (error) {
      console.error('Error viewing table:', error);
      alert(`Error loading table details: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoadingTableDetails(false);
    }
  };

  const handleLoadMoreRecords = async () => {
    if (!selectedTable || !selectedTable.pagination?.hasMore) return;
    
    try {
      setLoadingTableDetails(true);
      const nextPage = currentPage + 1;
      const response = await databaseAPI.getTableDetails(selectedTable.tableName, { 
        limit: recordsPerPage, 
        offset: nextPage * recordsPerPage 
      });
      
      setSelectedTable({
        ...response.data,
        records: [...selectedTable.records, ...response.data.records]
      });
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more records:', error);
      alert(`Error loading more records: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoadingTableDetails(false);
    }
  };

  const handleRefreshTable = async () => {
    if (!selectedTable) return;
    handleViewTable(selectedTable.tableName, 0, recordsPerPage);
  };

  const handleOptimizeTable = async (tableName) => {
    try {
      console.log('Optimizing table:', tableName);
      // For now, just optimize entire database
      await databaseAPI.optimize();
      fetchDatabaseInfo();
      alert(`Optimized table: ${tableName}`);
    } catch (error) {
      console.error('Error optimizing table:', error);
    }
  };

  const handleCleanupTable = async (tableName) => {
    try {
      const confirmCleanup = window.confirm(
        `Are you sure you want to cleanup table "${tableName}"?\n\nThis will remove old/unused data and optimize the table.`
      );
      if (!confirmCleanup) return;

      console.log('Cleaning up table:', tableName);
      // For now, just use general database cleanup
      await databaseAPI.cleanup();
      fetchDatabaseInfo();
      
      // Refresh the table view if it's currently open
      if (selectedTable && selectedTable.tableName === tableName) {
        handleViewTable(tableName, 0, recordsPerPage);
      }
      
      alert(`Cleaned up table: ${tableName}`);
    } catch (error) {
      console.error('Error cleaning up table:', error);
      alert(`Error cleaning up table: ${error.response?.data?.error || error.message}`);
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || table.status === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Management</h1>
        <p className="text-gray-600">Monitor and manage your database operations</p>
      </div>

      {/* Database Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">{databaseStats.totalSize}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tables</p>
              <p className="text-2xl font-bold text-gray-900">{databaseStats.totalTables}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{databaseStats.totalRecords.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(databaseStats.status)}
                <span className="text-lg font-semibold text-gray-900 capitalize">{databaseStats.status}</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Create Backup
          </button>
          <button
            onClick={handleOptimize}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Optimize Database
          </button>
          <button
            onClick={handleCleanup}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup Database
          </button>
          <button 
            onClick={() => {
              const backupId = prompt('Enter backup ID to restore:');
              if (backupId) {
                handleRestore(backupId);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Restore Backup
          </button>
        </div>
      </div>

      {/* Database Tables */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Database Tables</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Database className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
            <p className="text-gray-500">No database tables available or no matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTables.map((table) => (
                  <tr key={table.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {table.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(table.status)}`}>
                        {getStatusIcon(table.status)}
                        {table.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleViewTable(table.name)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleOptimizeTable(table.name)}
                        className="text-green-600 hover:text-green-800 font-medium mr-3"
                      >
                        Optimize
                      </button>
                      <button 
                        onClick={() => handleCleanupTable(table.name)}
                        className="text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Cleanup
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Operations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Operations</h2>
          <button
            onClick={fetchDatabaseInfo}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {operations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Activity className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No operations found</h3>
            <p className="text-gray-500">No database operations have been performed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((operation) => (
                  <tr key={operation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getOperationIcon(operation.type)}
                        <span className="capitalize">{operation.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(operation.status)}`}>
                        {getStatusIcon(operation.status)}
                        {operation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(operation.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operation.endTime ? new Date(operation.endTime).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operation.endTime
                        ? `${Math.round((new Date(operation.endTime) - new Date(operation.startTime)) / 1000)}s`
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table Details Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Table Details: {selectedTable?.tableName || 'Loading...'}
              </h2>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingTableDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading table details...</span>
                </div>
              ) : selectedTable ? (
                <div className="space-y-6">
                  {/* Table Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Table Name</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-900">{selectedTable.tableName}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Total Records</span>
                      </div>
                      <p className="text-lg font-semibold text-green-900">
                        {parseInt(selectedTable.stats.total_records).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Table Size</span>
                      </div>
                      <p className="text-lg font-semibold text-purple-900">{selectedTable.stats.table_size}</p>
                    </div>
                  </div>

                  {/* Table Columns */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Type className="w-5 h-5 text-gray-700" />
                      Table Structure ({selectedTable.columns.length} columns)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Column Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Data Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Max Length
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Nullable
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Default Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedTable.columns.map((column, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                                {column.column_name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {column.data_type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                {column.character_maximum_length || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  column.is_nullable === 'YES' 
                                    ? 'bg-yellow-50 text-yellow-700' 
                                    : 'bg-green-50 text-green-700'
                                }`}>
                                  {column.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                <span className="text-gray-500 italic">
                                  {column.column_default || '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Records */}
                  {selectedTable.records.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-gray-700" />
                          Table Records (showing {selectedTable.records.length} of {selectedTable.pagination?.totalRecords || selectedTable.stats.total_records})
                        </h3>
                        <div className="flex gap-2">
                          <select
                            value={recordsPerPage}
                            onChange={(e) => {
                              setRecordsPerPage(parseInt(e.target.value));
                              handleViewTable(selectedTable.tableName, 0, parseInt(e.target.value));
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={25}>25 records</option>
                            <option value={50}>50 records</option>
                            <option value={100}>100 records</option>
                            <option value={200}>200 records</option>
                          </select>
                          <button
                            onClick={handleRefreshTable}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Refresh
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(selectedTable.records[0] || {}).map((key, index) => (
                                <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedTable.records.map((record, recordIndex) => (
                              <tr key={recordIndex} className="hover:bg-gray-50">
                                {Object.values(record).map((value, valueIndex) => (
                                  <td key={valueIndex} className="px-4 py-3 text-sm text-gray-900 border-b max-w-xs truncate">
                                    {value === null ? (
                                      <span className="text-gray-400 italic">NULL</span>
                                    ) : value === '' ? (
                                      <span className="text-gray-400 italic">Empty</span>
                                    ) : (
                                      <span className="truncate">{String(value)}</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Showing {selectedTable.records.length} of {selectedTable.pagination?.totalRecords || selectedTable.stats.total_records} records
                        </div>
                        <div className="flex gap-2">
                          {selectedTable.pagination?.hasMore && (
                            <button
                              onClick={handleLoadMoreRecords}
                              disabled={loadingTableDetails}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingTableDetails ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Load More Records
                                </>
                              )}
                            </button>
                          )}
                          {!selectedTable.pagination?.hasMore && selectedTable.records.length > 0 && (
                            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              All records loaded
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagement;
