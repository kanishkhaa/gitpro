import React, { useState, useEffect } from 'react';
import { 
  Search, 
  GitCommit, 
  Calendar, 
  User, 
  Clock, 
  Hash, 
  FileText, 
  Brain, 
  Activity, 
  GitBranch,
  Star,
  TrendingUp,
  Zap,
  Code,
  Filter,
  Download,
  Eye
} from 'lucide-react';

const CommitHistory = () => {
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commits, setCommits] = useState([]);
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState({ totalCommits: 0, contributors: 0, avgCommitsPerDay: 0 });
  const [filterAuthor, setFilterAuthor] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Mock data for demonstration
  const mockCommits = [
    {
      sha: '7a8b9c1',
      message: 'Add authentication middleware with JWT support',
      author: 'John Doe',
      date: '2024-05-27T10:30:00Z',
      changes: { additions: 45, deletions: 12, files: 3 },
      type: 'feature'
    },
    {
      sha: '6f7e8d2',
      message: 'Fix memory leak in database connection pool',
      author: 'Jane Smith',
      date: '2024-05-26T15:45:00Z',
      changes: { additions: 23, deletions: 18, files: 2 },
      type: 'bugfix'
    },
    {
      sha: '5d6c7a3',
      message: 'Refactor user service to improve performance',
      author: 'Mike Johnson',
      date: '2024-05-26T09:20:00Z',
      changes: { additions: 67, deletions: 89, files: 5 },
      type: 'refactor'
    },
    {
      sha: '4c5b6d4',
      message: 'Update README with installation instructions',
      author: 'Sarah Wilson',
      date: '2024-05-25T14:10:00Z',
      changes: { additions: 34, deletions: 8, files: 1 },
      type: 'docs'
    },
    {
      sha: '3b4a5c5',
      message: 'Add unit tests for authentication module',
      author: 'John Doe',
      date: '2024-05-25T11:30:00Z',
      changes: { additions: 156, deletions: 0, files: 4 },
      type: 'test'
    }
  ];

  const mockSummary = `
## Repository Development Summary

• **Authentication & Security**: Major implementation of JWT-based authentication middleware with comprehensive security measures
• **Performance Optimization**: Significant refactoring of user services and database connection pooling to improve system efficiency
• **Bug Fixes**: Critical memory leak resolved in database layer, enhancing system stability
• **Documentation**: Updated project documentation and README for better developer onboarding
• **Testing**: Expanded test coverage with new unit tests for authentication components
  `;

  useEffect(() => {
    if (commits.length === 0) {
      setCommits(mockCommits);
      setSummary(mockSummary);
      setStats({
        totalCommits: mockCommits.length,
        contributors: [...new Set(mockCommits.map(c => c.author))].length,
        avgCommitsPerDay: 1.8
      });
    }
  }, []);

  const handleAnalyze = async () => {
    if (!repo.trim() || !repo.includes('/')) {
      alert('Please enter a valid repository in format: owner/repo');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setCommits(mockCommits);
      setSummary(mockSummary);
      setStats({
        totalCommits: mockCommits.length,
        contributors: [...new Set(mockCommits.map(c => c.author))].length,
        avgCommitsPerDay: 1.8
      });
      setIsLoading(false);
    }, 2500);
  };

  const getCommitTypeIcon = (type) => {
    switch (type) {
      case 'feature': return <Star className="w-4 h-4 text-emerald-400" />;
      case 'bugfix': return <Zap className="w-4 h-4 text-red-400" />;
      case 'refactor': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'docs': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'test': return <Activity className="w-4 h-4 text-cyan-400" />;
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
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
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
        {/* Control Panel */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Repository Input */}
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

            {/* Author Filter */}
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

            {/* Analyze Button */}
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
        </div>

        {/* AI Summary Section */}
        {summary && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI-Powered Repository Summary</h2>
                <p className="text-slate-400 mt-1">Intelligent analysis of commit patterns and development trends</p>
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
              <div 
                className="prose prose-invert max-w-none text-slate-300"
                dangerouslySetInnerHTML={{ 
                  __html: summary.replace(/\n/g, '<br>').replace(/•/g, '&bull;').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') 
                }}
              />
            </div>
          </div>
        )}

        {/* Commit Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Calendar className="w-7 h-7 text-blue-400" />
              <span>Commit Timeline</span>
            </h2>
            <div className="flex items-center space-x-4">
              <button className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {filteredCommits.map((commit, index) => (
            <div key={commit.sha} className="relative">
              {/* Timeline Line */}
              {index < filteredCommits.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-16 bg-gradient-to-b from-slate-600 to-slate-700"></div>
              )}
              
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-300 ml-4">
                <div className="flex items-start space-x-6">
                  {/* Timeline Dot */}
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-full shadow-lg ring-2 ring-white/10 flex-shrink-0">
                    {getCommitTypeIcon(commit.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Commit Header */}
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

                    {/* Commit Stats */}
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

          {filteredCommits.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-12 shadow-2xl ring-1 ring-white/5">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <GitCommit className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 mb-3">No Commits Found</h3>
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