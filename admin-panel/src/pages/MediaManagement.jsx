import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const MediaManagement = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/media', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch media files');
      }
      
      const data = await response.json();
      setMediaFiles(data);
    } catch (error) {
      toast.error('Failed to fetch media files');
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      toast.success('File uploaded successfully');
      fetchMediaFiles();
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/admin/media/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      toast.success('File deleted successfully');
      fetchMediaFiles();
    } catch (error) {
      toast.error('Failed to delete file');
      console.error('Error deleting file:', error);
    }
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-600 mt-2">Manage images, documents, and other media files</p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New File</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
            <span className="text-sm text-gray-500">
              Supported formats: Images, PDF, DOC, DOCX
            </span>
          </div>
        </div>
      </Card>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="ml-4">
              <span className="text-sm text-gray-500">
                {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Media Grid */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Loading media files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
              <p className="text-gray-500">Upload your first media file to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {file.mime_type?.startsWith('image/') ? (
                      <img
                        src={`/uploads/${file.filename}`}
                        alt={file.original_name || file.filename}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center">
                        <div className="text-gray-400">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{file.original_name || file.filename}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
                    <p className="text-xs text-gray-400">{formatDate(file.upload_date || file.created_at)}</p>
                    <div className="mt-3 flex space-x-2">
                      <button
                        className="flex-1 bg-indigo-600 text-white px-3 py-1 text-sm rounded hover:bg-indigo-700 transition-colors"
                        onClick={() => window.open(`/uploads/${file.filename}`, '_blank')}
                      >
                        View
                      </button>
                      <button
                        className="flex-1 bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition-colors"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MediaManagement;
