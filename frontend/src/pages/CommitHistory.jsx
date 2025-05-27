import React, { useState, useEffect } from 'react';
import { 
  Search, GitCommit, Calendar, User, Clock, Hash, FileText, Brain, Activity, GitBranch, Star, TrendingUp, Zap, Code, Filter, Download, Eye, AlertCircle, RefreshCw
} from 'lucide-react';

const CommitHistory = () => {
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commits, setCommits] = useState([]);
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState({ totalCommits: 0, contributors: 0, avgCommitsPerDay: 0 });
  const [filterAuthor, setFilterAuthor] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [error, setError] = useState('');
  const [rawOutput, setRawOutput] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  const handleAnalyze = async () => {
    if (!repo.trim() || !repo.includes('/')) {
      setError('Please enter a valid repository in format: owner/repo');
      return;
    }

    setIsLoading(true);
    setError('');
    setRawOutput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/execute/6`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo: repo.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch commit history');
      }

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.result && Array.isArray(data.result.commits) && typeof data.result.summary === 'string') {
        // Process commits
        const parsedCommits = data.result.commits.map(commit => ({
          ...commit,
          type: determineCommitType(commit.message)
        }));
        setCommits(parsedCommits);
        setSummary(data.result.summary || 'No summary provided.');

        // Calculate stats
        const uniqueAuthors = new Set(parsedCommits.map(c => c.author)).size;
        const dateRange = parsedCommits.length > 0
          ? (new Date(parsedCommits[0].date) - new Date(parsedCommits[parsedCommits.length - 1].date)) / (1000 * 60 * 60 * 24)
          : 0;
        const avgCommitsPerDay = dateRange > 0 ? (parsedCommits.length / dateRange).toFixed(2) : 0;

        setStats({
          totalCommits: parsedCommits.length,
          contributors: uniqueAuthors,
          avgCommitsPerDay: avgCommitsPerDay
        });
      } else if (data.result && data.result.error) {
        throw new Error(data.result.error);
      } else {
        throw new Error('Unexpected response format: Expected commits array and summary string');
      }
    } catch (err) {
      console.error('Error fetching commit history:', err);
      setError(err.message || 'Failed to analyze repository. Please check the repository name and try again.');
      setCommits([]);
      setSummary('');
      setStats({ totalCommits: 0, contributors: 0, avgCommitsPerDay: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of the component (unchanged)
  const determineCommitType = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('fix') || msg.includes('bug') || msg.includes('patch')) return 'bugfix';
    if (msg.includes('feat') || msg.includes('add') || msg.includes('new')) return 'feature';
    if (msg.includes('refactor') || msg.includes('clean') || msg.includes('improve')) return 'refactor';
    if (msg.includes('doc') || msg.includes('readme') || msg.includes('comment')) return 'docs';
    if (msg.includes('test') || msg.includes('spec')) return 'test';
    if (msg.includes('initial')) return 'initial';
    if (msg.includes('final')) return 'final';
    if (msg.includes('update')) return 'update';
    return 'feature';
  };

  const getCommitTypeIcon = (type) => {
    switch (type) {
      case 'feature': return <Star className="w-4 h-4 text-emerald-400" />;
      case 'bugfix': return <Zap className="w-4 h-4 text-red-400" />;
      case 'refactor': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'docs': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'test': return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'initial': return <Code className="w-4 h-4 text-yellow-400" />;
      case 'final': return <Star className="w-4 h-4 text-green-400" />;
      case 'update': return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default: return <GitCommit className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCommitTypeColor = (type) => {
    switch (type) {
      case 'feature': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'bugfix': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'refactor': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'docs': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'test': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'initial': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'final': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'update': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCommits = commits.filter(commit => 
    !filterAuthor || commit.author.toLowerCase().includes(filterAuthor.toLowerCase())
  );

  return (
    <div className="fixed top-0 right-0 bottom-0 left-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 p-4 rounded-2xl shadow-lg ring-1 ring-white/10">
                <GitCommit className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
                  Commit History
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-medium">Visual timeline and AI-powered commit analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <GitCommit className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-200 font-medium">{stats.totalCommits}</span>
                  <span className="text-slate-400">Commits</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-200 font-medium">{stats.contributors}</span>
                  <span className="text-slate-400">Contributors</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  <span className="text-slate-200 font-medium">{stats.avgCommitsPerDay}</span>
                  <span className="text-slate-400">Avg/Day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Repository
              </label>
              <div className="relative group">
                <GitBranch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="owner/repository"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-12 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Filter by Author
              </label>
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-12 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Action
              </label>
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 hover:from-purple-700 hover:via-blue-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Analyze History</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {(summary || filteredCommits.length > 0) && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Git History Analysis</h2>
                <p className="text-slate-400 mt-1">Repository analysis and development insights</p>
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
              <div 
                className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: summary
                    .replace(/\n/g, '<br>')
                    .replace(/•/g, '•')
                    .replace(/\*\*(.*?)\*\*/g, '<strong className="text-white">$1</strong>')
                    .replace(/`([^`]+)`/g, '<code className="bg-slate-600/50 px-2 py-1 rounded text-cyan-300">$1</code>')
                    .replace(/```json\n([\s\S]*?)```/g, '<pre className="bg-slate-800/80 p-4 rounded-lg overflow-x-auto"><code className="text-green-300">$1</code></pre>')
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Calendar className="w-7 h-7 text-blue-400" />
              <span>Commit Timeline</span>
            </h2>
            {filteredCommits.length > 0 && (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    const dataStr = JSON.stringify(filteredCommits, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${repo.replace('/', '_')}_commits.json`;
                    link.click();
                  }}
                  className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>

          {filteredCommits.map((commit, index) => (
            <div key={commit.sha} className="relative">
              {index < filteredCommits.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-16 bg-gradient-to-b from-slate-600 to-slate-700"></div>
              )}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-300 ml-4">
                <div className="flex items-start space-x-6">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-full shadow-lg ring-2 ring-white/10 flex-shrink-0">
                    {getCommitTypeIcon(commit.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 leading-relaxed">
                          {commit.message}
                        </h3>
                        <div className="flex items-center space-x-6 text-sm text-slate-400">
                          <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                            <Hash className="w-4 h-4" />
                            <span className="font-mono">{commit.sha}</span>
                          </span>
                          <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                            <User className="w-4 h-4" />
                            <span>{commit.author}</span>
                          </span>
                          <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(commit.date)}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getCommitTypeColor(commit.type)} flex-shrink-0`}>
                        {commit.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex items-center space-x-3">
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-400">+{commit.changes.additions}</p>
                            <p className="text-slate-400 text-sm">Additions</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-500/20 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-400">-{commit.changes.deletions}</p>
                            <p className="text-slate-400 text-sm">Deletions</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-500/20 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-400">{commit.changes.files}</p>
                            <p className="text-slate-400 text-sm">Files</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCommits.length === 0 && !isLoading && !error && !summary && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-12 shadow-2xl ring-1 ring-white/5">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <GitCommit className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 mb-3">Ready to Analyze</h3>
                <p className="text-slate-400 text-lg">Enter a repository above to explore its commit history and get AI-powered insights.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitHistory;