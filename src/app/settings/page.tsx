'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Download, Trash2, Database, Shield, Info, Key, Eye, EyeOff, CheckCircle, XCircle, RotateCcw, Github } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { getBeliefs, getEdges, getJournalEntries, exportAllData, clearAllData } from '@/lib/client-storage';

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalBeliefs: 0,
    totalJournalEntries: 0,
    totalConnections: 0
  });

  // API Key management
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | 'unknown'>('unknown');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Load stored API key on component mount
    const stored = localStorage.getItem('user_openai_key');
    if (stored) {
      setUserApiKey(stored);
      setHasStoredKey(true);
      setKeyStatus('unknown'); // Will be tested when user clicks test
    }

    // Fetch statistics
    fetchStats();

    // Listen for localStorage changes to refresh stats
    const handleStorageChange = () => {
      fetchStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      // Get data from localStorage instead of API
      const beliefs = getBeliefs();
      const edges = getEdges();
      const journalEntries = getJournalEntries();

      setStats({
        totalBeliefs: beliefs.length,
        totalJournalEntries: journalEntries.length,
        totalConnections: edges.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values of 0
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!userApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!userApiKey.startsWith('sk-')) {
      toast.error('OpenAI API keys should start with "sk-"');
      return;
    }

    localStorage.setItem('user_openai_key', userApiKey);
    setHasStoredKey(true);
    setKeyStatus('unknown');
    toast.success('API key saved successfully');
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('user_openai_key');
    setUserApiKey('');
    setHasStoredKey(false);
    setKeyStatus('unknown');
    toast.success('API key removed');
  };

  const handleTestApiKey = async () => {
    if (!userApiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    setIsTestingKey(true);
    try {
      const response = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: userApiKey }),
      });

      const result = await response.json();

      if (result.valid) {
        setKeyStatus('valid');
        toast.success('API key is valid!');
      } else {
        setKeyStatus('invalid');
        toast.error('API key is invalid');
      }
    } catch {
      setKeyStatus('invalid');
      toast.error('Failed to test API key');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export data from localStorage
      const exportData = exportAllData();

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sagemap-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      // Clear data from localStorage
      clearAllData();

      toast.success('All data deleted successfully');
      // Reset stats
      setStats({ totalBeliefs: 0, totalJournalEntries: 0, totalConnections: 0 });

      // Trigger update event for other components
      window.dispatchEvent(new CustomEvent('localStorageUpdate'));

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete data');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Badge variant="outline">Beta</Badge>
        </div>

        {/* Data Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Overview
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={isLoadingStats}
                className="flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 rounded h-8 w-12 mx-auto"></div>
                  ) : (
                    stats.totalBeliefs
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Beliefs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 rounded h-8 w-12 mx-auto"></div>
                  ) : (
                    stats.totalJournalEntries
                  )}
                </div>
                <div className="text-sm text-gray-600">Journal Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 rounded h-8 w-12 mx-auto"></div>
                  ) : (
                    stats.totalConnections
                  )}
                </div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              OpenAI API Key
            </CardTitle>
            <p className="text-sm text-gray-600">
              Use your own OpenAI API key for belief extraction. This key is stored locally in your browser. Get one from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                OpenAI&apos;s API Keys page
              </a>.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                <Button
                  onClick={handleTestApiKey}
                  disabled={isTestingKey || !userApiKey.trim()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {isTestingKey ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Test
                    </>
                  )}
                </Button>
              </div>

              {/* Key Status */}
              {keyStatus !== 'unknown' && (
                <div className={`flex items-center gap-2 text-sm ${keyStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {keyStatus === 'valid' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      API key is valid and working
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      API key is invalid or has no access
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!userApiKey.trim()}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Key className="w-4 h-4" />
                  Save Key
                </Button>

                {hasStoredKey && (
                  <Button
                    onClick={handleRemoveApiKey}
                    variant="outline"
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Key
                  </Button>
                )}
              </div>

              {/* Current Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">
                      {hasStoredKey ? 'Using your API key' : 'Using server API key'}
                    </p>
                    <p className="mt-1">
                      {hasStoredKey
                        ? 'Your personal OpenAI API key is being used for all AI operations.'
                        : 'Using the server\'s OpenAI API key. Add your own key for full control and to avoid rate limits.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Security Note</p>
                    <p className="mt-1">
                      Your API key is stored locally in your browser and never sent to our servers.
                      It&apos;s used directly to communicate with OpenAI&apos;s API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">Local Storage</h3>
                  <p className="text-sm text-green-700 mt-1">
                    All your data is stored locally in a SQLite database on your device.
                    Only journal content is sent to OpenAI for belief extraction.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">OpenAI Integration</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your journal entries are processed by OpenAI&apos;s GPT-4o to extract beliefs.
                    OpenAI may store this data according to their privacy policy.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <p className="text-sm text-gray-600">
              Export your data for backup or delete everything to start fresh
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-gray-600">
                  Download all your beliefs, journal entries, and connections as JSON
                </p>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
              <div>
                <h3 className="font-medium text-red-800">Delete All Data</h3>
                <p className="text-sm text-red-600">
                  Permanently delete all your beliefs, journal entries, and connections
                </p>
              </div>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Delete All Data
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• All your beliefs and their relationships</li>
                      <li>• All journal entries</li>
                      <li>• All connection data</li>
                    </ul>
                    <p className="text-sm font-medium text-red-600">
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAllData}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About SageMap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                SageMap is an AI-powered tool for mapping and evolving your belief system over time.
                It uses GPT-4o to extract beliefs from your journal entries and visualizes them as an interactive graph.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://github.com/Siddhant-K-code/SageMap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
