import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  GitCommit,
  FileText,
  Code2,
  Clock,
  Star,
  Zap,
  Sparkles,
  Activity,
  Shield,
  Eye,
  MessageSquare,
  TrendingUp,
  Brain,
  GitBranch,
  Users,
  BarChart3
} from 'lucide-react';

const CommitValidator = () => {
  const [repo, setRepo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Mock analysis function (replace with actual API call)
  const analyzeCommit = async () => {
    if (!repo || !repo.includes('/')) {
      setError('Please enter a valid repository format (owner/repo)');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setAnalysisResult({
        commitSha: 'a1b2c3d',
        commitMessage: 'Fix user authentication bug and update dependencies',
        rating: 'Good',
        score: 8.5,
        analysis: {
          messageAccuracy: {
            score: 9,
            description: 'Commit message accurately describes the changes made',
            status: 'good'
          },
          messagePractices: {
            score: 8,
            description: 'Follows conventional commit format with clear, concise description',
            status: 'good'
          },
          changesCohesion: {
            score: 8,
            description: 'Changes are focused and logically grouped together',
            status: 'good'
          }
        },
        suggestions: [
          'Consider breaking dependency updates into a separate commit',
          'Add more specific details about which authentication bug was fixed'
        ],
        stats: {
          filesChanged: 5,
          additions: 127,
          deletions: 43,
          complexity: 'Medium'
        },
        diff: `@@ -15,7 +15,10 @@ def authenticate_user(username, password):
-    if not user or user.password != password:
+    if not user or not check_password_hash(user.password, password):
         return None
+    
+    # Update last login timestamp
+    user.last_login = datetime.now()
+    db.session.commit()
     
     return user`
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getRatingColor = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'good': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'fair': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'poor': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'fair': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'poor': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <CheckCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg ring-1 ring-white/10 transform group-hover:scale-105 transition-all duration-300">
                  <Brain className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                  Commit Intent Analyzer
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-medium">AI-driven insights to ensure commit messages match code changes</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <GitCommit className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-200 font-medium">12,489</span>
                  <span className="text-slate-400">Analyzed</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-200 font-medium">94.2%</span>
                  <span className="text-slate-400">Accuracy</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span className="text-slate-200 font-medium">1,247</span>
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Repository to Analyze
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
              
              {error && (
                <div className="flex items-center space-x-2 mt-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-pulse">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Action
              </label>
              <button
                onClick={analyzeCommit}
                disabled={isAnalyzing || !repo}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Analyze Latest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult ? (
          <div className="space-y-8 animate-fade-in">
            {/* Overall Score Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl ring-1 ring-white/5">
              <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-2xl shadow-lg ring-1 ring-white/10">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Overall Rating: {analysisResult.rating}
                      </h3>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <GitCommit className="w-4 h-4" />
                          <span>SHA: {analysisResult.commitSha}</span>
                        </span>
                        <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <BarChart3 className="w-4 h-4" />
                          <span>Score: {analysisResult.score}/10</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysisResult.score)} mb-1`}>
                      {analysisResult.score}
                    </div>
                    <div className="text-slate-400 text-sm">out of 10</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                  <div className="flex items-start space-x-4">
                    <div className="bg-slate-600/50 p-2 rounded-xl">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300 text-sm font-medium mb-2">Commit Message:</p>
                      <p className="text-white text-lg font-mono leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-600/30">
                        "{analysisResult.commitMessage}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(analysisResult.analysis).map(([key, data]) => (
                <div
                  key={key}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-slate-700/50 p-2 rounded-xl">
                        {getStatusIcon(data.status)}
                      </div>
                      <h4 className="text-lg font-semibold text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                    </div>
                    <div className={`text-xl font-bold ${getScoreColor(data.score)}`}>
                      {data.score}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{data.description}</p>
                  
                  <div className="w-full bg-slate-700/50 rounded-full h-3 shadow-inner">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r ${
                        data.score >= 8 ? 'from-emerald-500 to-teal-500' :
                        data.score >= 6 ? 'from-amber-500 to-orange-500' :
                        'from-red-500 to-rose-500'
                      } transition-all duration-700 ease-out shadow-lg`}
                      style={{ width: `${(data.score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats and Diff Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Commit Stats */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl ring-1 ring-white/5">
                <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Commit Statistics</h4>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Files Changed', value: analysisResult.stats.filesChanged, color: 'text-blue-400', icon: FileText },
                      { label: 'Additions', value: `+${analysisResult.stats.additions}`, color: 'text-emerald-400', icon: TrendingUp },
                      { label: 'Deletions', value: `-${analysisResult.stats.deletions}`, color: 'text-red-400', icon: XCircle },
                      { label: 'Complexity', value: analysisResult.stats.complexity, color: 'text-purple-400', icon: BarChart3 }
                    ].map((stat, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                        <div className="flex items-center space-x-2 mb-2">
                          <stat.icon className="w-4 h-4 text-slate-400" />
                          <p className="text-slate-300 text-xs font-medium">{stat.label}</p>
                        </div>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Diff Preview */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl ring-1 ring-white/5">
                <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-white">Code Changes Preview</h4>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700/30 font-mono text-sm overflow-x-auto shadow-inner">
                    <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {analysisResult.diff}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl ring-1 ring-white/5">
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">AI Suggestions</h4>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 bg-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-amber-500/30 transition-all duration-300 transform hover:scale-102"
                    >
                      <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-2 rounded-full flex-shrink-0 shadow-lg">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-12 shadow-2xl ring-1 ring-white/5">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Brain className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-300 mb-3">No Analysis Yet</h3>
              <p className="text-slate-400 text-lg">Enter a repository above to start analyzing commits with AI-powered insights.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitValidator;