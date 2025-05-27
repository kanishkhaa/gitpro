import React, { useState, useEffect } from 'react';
import { Search, GitPullRequest, FileText, Brain, CheckCircle, AlertTriangle, Clock, Eye, Code, Zap, Star, GitBranch, Users, Shield, Activity } from 'lucide-react';

const AICodeReview = () => {
  const [repo, setRepo] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [reviewMode, setReviewMode] = useState('recent'); // 'recent', 'specific', 'all'
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [stats, setStats] = useState({ totalPRs: 0, filesReviewed: 0, issuesFound: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data for demonstration
  const mockReviews = [
    {
      id: 1,
      prNumber: 142,
      title: "Add authentication middleware",
      files: [
        {
          filename: "src/middleware/auth.js",
          changes: 23,
          suggestions: [
            { type: "security", text: "Consider adding rate limiting to prevent brute force attacks" },
            { type: "performance", text: "Cache JWT verification results for better performance" },
            { type: "bug", text: "Missing null check for user object in line 45" }
          ],
          quality: "good"
        },
        {
          filename: "src/routes/protected.js", 
          changes: 12,
          suggestions: [
            { type: "improvement", text: "Add input validation for request parameters" }
          ],
          quality: "excellent"
        }
      ],
      status: "completed",
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      prNumber: 141,
      title: "Fix database connection pooling",
      files: [
        {
          filename: "src/database/pool.js",
          changes: 35,
          suggestions: [
            { type: "critical", text: "Memory leak detected in connection cleanup" },
            { type: "performance", text: "Optimize pool size based on concurrent connections" }
          ],
          quality: "needs-work"
        }
      ],
      status: "completed",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  useEffect(() => {
    setReviews(mockReviews);
    setStats({
      totalPRs: mockReviews.length,
      filesReviewed: mockReviews.reduce((acc, review) => acc + review.files.length, 0),
      issuesFound: mockReviews.reduce((acc, review) => 
        acc + review.files.reduce((fileAcc, file) => fileAcc + file.suggestions.length, 0), 0)
    });
  }, []);

  const handleReview = async () => {
    if (!repo.trim() || !repo.includes('/')) {
      alert('Please enter a valid repository in format: owner/repo');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (reviewMode === 'specific' && prNumber) {
        const newReview = {
          id: Date.now(),
          prNumber: parseInt(prNumber),
          title: `PR #${prNumber} Review`,
          files: [{
            filename: "example.js",
            changes: Math.floor(Math.random() * 50) + 1,
            suggestions: [
              { type: "improvement", text: "Consider using async/await instead of callbacks" },
              { type: "security", text: "Validate input parameters to prevent injection" }
            ],
            quality: "good"
          }],
          status: "completed",
          timestamp: new Date().toISOString()
        };
        setReviews(prev => [newReview, ...prev]);
        setCurrentReview(newReview);
      }
      setIsLoading(false);
    }, 2000);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'security': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'bug': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'performance': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'improvement': return <Star className="w-4 h-4 text-cyan-400" />;
      default: return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'good': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'needs-work': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-cyan-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 via-teal-500 to-cyan-500 p-4 rounded-2xl shadow-lg ring-1 ring-white/10">
                <Brain className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                  AI Code Review
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-medium">Intelligent code analysis powered by advanced AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <GitPullRequest className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-200 font-medium">{stats.totalPRs}</span>
                  <span className="text-slate-400">PRs</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <span className="text-slate-200 font-medium">{stats.filesReviewed}</span>
                  <span className="text-slate-400">Files</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <span className="text-slate-200 font-medium">{stats.issuesFound}</span>
                  <span className="text-slate-400">Issues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-8 py-8">
        {/* Control Panel */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Repository Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Repository
              </label>
              <div className="relative group">
                <GitBranch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="owner/repository"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-12 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Review Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Review Mode
              </label>
              <select
                value={reviewMode}
                onChange={(e) => setReviewMode(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <option value="recent">Recent PR</option>
                <option value="specific">Specific PR</option>
                <option value="all">All PRs</option>
              </select>
            </div>

            {/* PR Number (conditional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                {reviewMode === 'specific' ? 'PR Number' : 'Action'}
              </label>
              {reviewMode === 'specific' ? (
                <input
                  type="number"
                  value={prNumber}
                  onChange={(e) => setPrNumber(e.target.value)}
                  placeholder="Enter PR number"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-5 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 backdrop-blur-sm"
                />
              ) : (
                <button
                  onClick={handleReview}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 hover:from-blue-700 hover:via-teal-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Start Review</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {reviewMode === 'specific' && (
            <div className="mt-6">
              <button
                onClick={handleReview}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 hover:from-blue-700 hover:via-teal-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Reviewing PR #{prNumber}...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    <span>Review PR #{prNumber}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-300">
              {/* Review Header */}
              <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg ring-1 ring-white/10">
                      <GitPullRequest className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        PR #{review.prNumber}: {review.title}
                      </h3>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(review.timestamp).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <FileText className="w-4 h-4" />
                          <span>{review.files.length} files</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-400/30">
                      {review.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Files */}
              <div className="p-8 space-y-6">
                {review.files.map((file, fileIndex) => (
                  <div key={fileIndex} className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-slate-600/50 p-2 rounded-xl">
                          <Code className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="font-mono text-cyan-300 text-lg">{file.filename}</span>
                        <span className="bg-slate-600/60 text-slate-300 px-3 py-1 rounded-lg text-sm font-medium">
                          {file.changes} changes
                        </span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getQualityColor(file.quality)}`}>
                        {file.quality}
                      </span>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-4">
                      {file.suggestions.map((suggestion, suggestionIndex) => (
                        <div key={suggestionIndex} className="flex items-start space-x-4 p-4 bg-slate-800/60 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                          <div className="bg-slate-700/50 p-2 rounded-lg">
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                suggestion.type === 'critical' ? 'text-red-400 bg-red-400/10' :
                                suggestion.type === 'security' ? 'text-amber-400 bg-amber-400/10' :
                                suggestion.type === 'bug' ? 'text-red-400 bg-red-400/10' :
                                suggestion.type === 'performance' ? 'text-yellow-400 bg-yellow-400/10' :
                                'text-cyan-400 bg-cyan-400/10'
                              }`}>
                                {suggestion.type}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                              {suggestion.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {reviews.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-12 shadow-2xl ring-1 ring-white/5">
                <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 mb-3">No Reviews Yet</h3>
                <p className="text-slate-400 text-lg">Enter a repository above to start reviewing pull requests with AI assistance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICodeReview;