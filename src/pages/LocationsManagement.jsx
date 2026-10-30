import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Edit, Trash2, Building, Globe, Filter, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { cn } from '../utils/cn';
import { locationsAPI } from '../services/api';

const LocationsManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await locationsAPI.getLocations();
        // Handle the actual API response format
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          const formattedData = response.data.data.map((item, index) => ({
            id: index + 1,
            city: item.location.split(' ')[0] || item.location,
            state: item.location.split(' ').slice(1).join(' ') || 'Unknown',
            jobCount: parseInt(item.job_count) || 0,
            activeJobCount: parseInt(item.active_job_count) || 0,
            recentJobCount: parseInt(item.recent_job_count) || 0,
            active: parseInt(item.active_job_count) > 0,
            createdAt: item.first_job_posted || new Date().toISOString(),
            lastJobPosted: item.last_job_posted
          }));
          setLocations(formattedData);
        } else {
          setLocations([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const filteredLocations = (locations || []).filter(location => {
    const matchesSearch = location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'all' || location.state === filterState;

    return matchesSearch && matchesState;
  });

  const handleSelectLocation = (locationId) => {
    setSelectedLocations(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === filteredLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(filteredLocations.map(location => location.id));
    }
  };

  const handleDeleteLocation = (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(location => location.id !== locationId));
      setSelectedLocations(prev => prev.filter(id => id !== locationId));
    }
  };

  const handleToggleStatus = (locationId) => {
    setLocations(prev => prev.map(location =>
      location.id === locationId
        ? { ...location, active: !location.active }
        : location
    ));
  };

  const exportLocations = () => {
    console.log('Exporting locations...');
  };

  // Indian states for filter
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations Management</h1>
          <p className="text-gray-600">Manage job locations across India</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">States Covered</p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(locations.map(loc => loc.state))].length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {locations.reduce((sum, loc) => sum + (loc.jobCount || 0), 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {locations.filter(loc => loc.active).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search locations by city or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All States</option>
            {indianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <Button variant="outline" onClick={exportLocations}>
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedLocations.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Locations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLocations.length === filteredLocations.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No locations found</p>
                    <p className="text-sm text-gray-500">Get started by adding your first location</p>
                    <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location.id)}
                        onChange={() => handleSelectLocation(location.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{location.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{location.state}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(location.id)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-full font-medium",
                          location.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        )}
                      >
                        {location.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{location.jobCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(location.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentLocation(location);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  placeholder="Enter city name"
                  id="addCity"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="addState"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const city = document.getElementById('addCity').value.trim();
                  const state = document.getElementById('addState').value;
                  
                  if (!city || !state) {
                    alert('Please fill in all fields');
                    return;
                  }

                  try {
                    const locationData = {
                      location: `${city}, ${state}`,
                      city: city,
                      state: state,
                      country: 'India',
                      is_active: true
                    };

                    await locationsAPI.createLocation(locationData);
                    
                    // Refresh the locations list
                    const response = await locationsAPI.getLocations();
                    if (response.data && response.data.data && Array.isArray(response.data.data)) {
                      const formattedData = response.data.data.map((item, index) => ({
                        id: index + 1,
                        city: item.location.split(' ')[0] || item.location,
                        state: item.location.split(' ').slice(1).join(' ') || 'Unknown',
                        jobCount: parseInt(item.job_count) || 0,
                        activeJobCount: parseInt(item.active_job_count) || 0,
                        recentJobCount: parseInt(item.recent_job_count) || 0,
                        active: parseInt(item.active_job_count) > 0,
                        createdAt: item.first_job_posted || new Date().toISOString(),
                        lastJobPosted: item.last_job_posted
                      }));
                      setLocations(formattedData);
                    }

                    setShowAddModal(false);
                    alert('Location added successfully!');
                  } catch (error) {
                    console.error('Error adding location:', error);
                    alert('Error adding location: ' + (error.response?.data?.message || error.message));
                  }
                }}
              >
                Add Location
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditModal && currentLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  placeholder="Enter city name"
                  id="editCity"
                  defaultValue={currentLocation.city}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="editState"
                  defaultValue={currentLocation.state}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentLocation(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const city = document.getElementById('editCity').value.trim();
                  const state = document.getElementById('editState').value;
                  
                  if (!city || !state) {
                    alert('Please fill in all fields');
                    return;
                  }

                  try {
                    const locationData = {
                      location: `${city}, ${state}`,
                      city: city,
                      state: state,
                      country: 'India',
                      is_active: currentLocation.active
                    };

                    await locationsAPI.updateLocation(currentLocation.id, locationData);
                    
                    // Update the location in the list
                    setLocations(prev => prev.map(loc => 
                      loc.id === currentLocation.id 
                        ? { ...loc, city, state, location: `${city}, ${state}` }
                        : loc
                    ));

                    setShowEditModal(false);
                    setCurrentLocation(null);
                    alert('Location updated successfully!');
                  } catch (error) {
                    console.error('Error updating location:', error);
                    alert('Error updating location: ' + (error.response?.data?.message || error.message));
                  }
                }}
              >
                Update Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsManagement;
