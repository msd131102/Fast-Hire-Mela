import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { seoAPI } from '../services/api';

const SEOManagement = () => {
    const [seoSettings, setSeoSettings] = useState({
        siteTitle: '',
        siteDescription: '',
        siteKeywords: '',
        ogImage: '',
        twitterCard: 'summary_large_image',
        twitterSite: '',
        googleAnalytics: '',
        googleVerification: '',
        bingVerification: '',
        robotsTxt: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSEOSettings();
    }, []);

    const fetchSEOSettings = async () => {
        try {
            const response = await seoAPI.getSettings();
            if (response.data && response.data.length > 0) {
                setSeoSettings(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching SEO settings:', error);
            toast.error('Failed to fetch SEO settings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSeoSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (seoSettings.id) {
                await seoAPI.updateSettings(seoSettings.id, seoSettings);
            } else {
                await seoAPI.createSettings(seoSettings);
            }
            toast.success('SEO settings updated successfully');
            // Refetch to get the updated data with ID
            fetchSEOSettings();
        } catch (error) {
            console.error('Error updating SEO settings:', error);
            toast.error('Failed to update SEO settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
                    <p className="text-gray-600">Manage SEO settings and optimization</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic SEO Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic SEO Settings</CardTitle>
                        <CardDescription>Configure basic SEO metadata for your website</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Title
                            </label>
                            <input
                                type="text"
                                name="siteTitle"
                                value={seoSettings.siteTitle}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Fast Hire Mela - Find Your Dream Job"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Description
                            </label>
                            <textarea
                                name="siteDescription"
                                value={seoSettings.siteDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Find your dream job at Fast Hire Mela. Browse thousands of job listings from top companies."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Keywords
                            </label>
                            <input
                                type="text"
                                name="siteKeywords"
                                value={seoSettings.siteKeywords}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="jobs, careers, employment, recruitment, hiring"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media Settings</CardTitle>
                        <CardDescription>Configure Open Graph and Twitter Card settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                OG Image URL
                            </label>
                            <input
                                type="url"
                                name="ogImage"
                                value={seoSettings.ogImage}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://example.com/og-image.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Twitter Card Type
                            </label>
                            <select
                                name="twitterCard"
                                value={seoSettings.twitterCard}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="summary">Summary</option>
                                <option value="summary_large_image">Summary with Large Image</option>
                                <option value="app">App</option>
                                <option value="player">Player</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Twitter Site Handle
                            </label>
                            <input
                                type="text"
                                name="twitterSite"
                                value={seoSettings.twitterSite}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="@fasthiremela"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics & Verification */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analytics & Verification</CardTitle>
                        <CardDescription>Add tracking codes and verification meta tags</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Google Analytics Tracking ID
                            </label>
                            <input
                                type="text"
                                name="googleAnalytics"
                                value={seoSettings.googleAnalytics}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Google Site Verification Code
                            </label>
                            <input
                                type="text"
                                name="googleVerification"
                                value={seoSettings.googleVerification}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="verification_token"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bing Site Verification Code
                            </label>
                            <input
                                type="text"
                                name="bingVerification"
                                value={seoSettings.bingVerification}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="verification_token"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Robots.txt */}
                <Card>
                    <CardHeader>
                        <CardTitle>Robots.txt</CardTitle>
                        <CardDescription>Configure search engine crawling rules</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Robots.txt Content
                            </label>
                            <textarea
                                name="robotsTxt"
                                value={seoSettings.robotsTxt}
                                onChange={handleInputChange}
                                rows={8}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                placeholder={`User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://fasthiremela.com/sitemap.xml`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SEOManagement;
