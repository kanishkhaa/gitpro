import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  GitPullRequest,
  Users,
  Code,
  TrendingUp,
  Activity,
  Target,
  Zap,
  ChevronUp,
  ChevronDown,
  Github,
  Plus,
  Minus,
  GitMerge,
  AlertCircle,
  Timer,
  Sparkles,
  Shield,
  Star,
  Eye
} from 'lucide-react';

const InsightsDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [repoInput, setRepoInput] = useState('');
  const [currentRepo, setCurrentRepo] = useState('');
  const [metrics, setMetrics] = useState({
    avgTurnaroundHours: 0,
    avgTurnaroundDays: 0,
    totalMergedPRs: 0,
    totalLinesAdded: 0,
    totalLinesDeleted: 0,
    netLinesChanged: 0,
    uniqueContributors: 0,
    avgChangesPerPR: 0,
    codeQualityScore: 0,
    teamCollaboration: 0,
    testCoverage: 0,
    securityScore: '',
    codeComplexity: '',
    mostActiveContributor: '',
    fastestReviewTime: 0,
    recentActivities: []
  });
  const [error, setError] = useState('');

  const handleAnalyzeRepo = async () => {
    if (!repoInput.trim() || !repoInput.includes('/')) {
      setError('Please enter a valid repository in format: owner/repo');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentRepo(repoInput.trim());

    try {
      const response = await fetch('http://localhost:5000/api/execute/2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoInput.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch metrics');
      }

      const data = await response.json();
      if (data.result && !data.result.error) {
        setMetrics({
          avgTurnaroundHours: data.result.avg_turnaround_hours || 0,
          avgTurnaroundDays: data.result.avg_turnaround_days || 0,
          totalMergedPRs: data.result.total_merged_prs || 0,
          totalLinesAdded: data.result.total_lines_added || 0,
          totalLinesDeleted: data.result.total_lines_deleted || 0,
          netLinesChanged: data.result.net_lines_changed || 0,
          uniqueContributors: data.result.unique_contributors || 0,
          avgChangesPerPR: data.result.avg_changes_per_pr || 0,
          codeQualityScore: data.result.code_quality_score || 0,
          teamCollaboration: data.result.team_collaboration || 0,
          testCoverage: data.result.test_coverage || 0,
          securityScore: data.result.security_score || 'N/A',
          codeComplexity: data.result.code_complexity || 'N/A',
          mostActiveContributor: data.result.most_active_contributor || 'N/A',
          fastestReviewTime: data.result.fastest_review_time || 0,
          recentActivities: data.result.recent_activities || []
        });
      } else {
        throw new Error(data.result.error || 'No metrics returned');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch productivity metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, size = 'normal' }) => (
    <div className={`relative group ${size === 'large' ? 'col-span-2' : ''}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r opacity-20 group-hover:opacity-40 transition duration-500 rounded-2xl blur"
           style={{ background: `linear-gradient(135deg, ${gradient})` }}></div>
      <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 transform hover:scale-[1.02] shadow-xl ring-1 ring-white/5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-xl shadow-lg ring-1 ring-white/10`}
                   style={{ background: `linear-gradient(135deg, ${gradient})` }}>
                <Icon className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <h3 className="text-slate-300 text-sm font-semibold tracking-wide uppercase">{title}</h3>
            </div>
            <div className="space-y-2">
              <p className={`font-bold text-white tracking-tight ${size === 'large' ? 'text-4xl' : 'text-3xl'}`}>{value}</p>
              {subtitle && (
                <p className="text-slate-400 text-sm font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              trend === 'up' ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 
              'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
            }`}>
              {trend === 'up' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ time, action, user, type, icon: Icon }) => (
    <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50">
      <div className={`p-2 rounded-lg ${
        type === 'merge' ? 'bg-emerald-500/20 text-emerald-400' :
        type === 'open' ? 'bg-amber-500/20 text-amber-400' : 
        'bg-purple-500/20 text-purple-400'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{action}</p>
        <p className="text-slate-400 text-xs mt-1">by @{user} • {new Date(time).toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed top-0 right-0 bottom-0 left-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg ring-1 ring-white/10 relative">
                <BarChart3 className="w-10 h-10 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                  Productivity Insights
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-medium">Real-time developer productivity metrics and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Repository
              </label>
              <div className="relative group">
                <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="owner/repository"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-12 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeRepo()}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Action
              </label>
              <button
                onClick={handleAnalyzeRepo}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    <span>Analyze Repository</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {currentRepo && (
            <div className="mt-6 flex items-center space-x-2 text-sm">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Currently analyzing:</span>
              <span className="text-purple-400 font-semibold">{currentRepo}</span>
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="PR Turnaround"
            value={`${metrics.avgTurnaroundHours}h`}
            subtitle={`${metrics.avgTurnaroundDays} days average`}
            icon={Timer}
            gradient="#8b5cf6, #3b82f6"
          />
          <MetricCard
            title="Merged PRs"
            value={metrics.totalMergedPRs.toLocaleString()}
            subtitle="Successfully completed"
            icon={GitMerge}
            gradient="#10b981, #059669"
          />
          <MetricCard
            title="Code Quality"
            value={metrics.codeQualityScore.toFixed(1)}
            subtitle="Out of 5.0 rating"
            icon={Star}
            gradient="#f59e0b, #d97706"
          />
          <MetricCard
            title="Contributors"
            value={metrics.uniqueContributors}
            subtitle="Active developers"
            icon={Users}
            gradient="#ec4899, #be185d"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Lines Added"
            value={metrics.totalLinesAdded.toLocaleString()}
            subtitle="Total additions"
            icon={Plus}
            gradient="#06d6a0, #10b981"
          />
          <MetricCard
            title="Lines Removed"
            value={metrics.totalLinesDeleted.toLocaleString()}
            subtitle="Code cleanup"
            icon={Minus}
            gradient="#ef4444, #dc2626"
          />
          <MetricCard
            title="Net Growth"
            value={metrics.netLinesChanged.toLocaleString()}
            subtitle="Overall codebase"
            icon={TrendingUp}
            gradient="#06b6d4, #0891b2"
          />
          <MetricCard
            title="Velocity Score"
            value={`${metrics.avgChangesPerPR} lines`}
            subtitle="Avg per PR"
            icon={Zap}
            gradient="#6366f1, #4f46e5"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-20 group-hover:opacity-40 transition duration-500 rounded-3xl blur"></div>
            <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl ring-1 ring-white/5">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg ring-1 ring-white/10">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Team Performance</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300 font-medium">Most Active Contributor</span>
                  <span className="text-emerald-400 font-semibold">@{metrics.mostActiveContributor}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300 font-medium">Fastest Review Time</span>
                  <span className="text-cyan-400 font-semibold">{metrics.fastestReviewTime}h</span>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-300 font-medium">Team Collaboration</span>
                    <span className="text-teal-400 text-sm font-semibold">{metrics.teamCollaboration}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-600 rounded-full">
                    <div 
                      className="h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.teamCollaboration}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 group-hover:opacity-40 transition duration-500 rounded-3xl blur"></div>
            <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl ring-1 ring-white/5">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg ring-1 ring-white/10">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Code Health</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <span className="text-slate-300 font-medium">Test Coverage</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">{metrics.testCoverage}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-slate-300 font-medium">Code Complexity</span>
                  </div>
                  <span className="text-amber-400 font-semibold">{metrics.codeComplexity}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300 font-medium">Security Score</span>
                  </div>
                  <span className="text-cyan-400 font-semibold">{metrics.securityScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 group-hover:opacity-40 transition duration-500 rounded-3xl blur"></div>
          <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg ring-1 ring-white/10">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
              </div>
              <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors duration-200 flex items-center space-x-2">
                <span>View All</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics.recentActivities.length > 0 ? (
                metrics.recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    time={activity.time}
                    action={activity.action}
                    user={activity.user}
                    type={activity.type}
                    icon={activity.type === 'merge' ? GitMerge : GitPullRequest}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center text-slate-400">No recent activities found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;