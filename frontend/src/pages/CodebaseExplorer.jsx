import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  FileText, 
  FolderOpen, 
  Folder, 
  Code, 
  Eye, 
  Brain, 
  GitBranch, 
  Star, 
  Zap, 
  Clock, 
  Activity, 
  ChevronRight, 
  ChevronDown, 
  File,
  TreePine,
  BookOpen,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CodebaseExplorer = ({ isSidebarCollapsed }) => {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [fileTree, setFileTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({ totalFiles: 0, analyzedFiles: 0, folders: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const analysisQueueRef = useRef([]);

  // Mock file structure for demonstration
  const mockFileTree = [
    {
      path: 'src',
      type: 'folder',
      children: [
        {
          path: 'src/components',
          type: 'folder',
          children: [
            { path: 'src/components/Header.jsx', type: 'file', language: 'javascript', size: 2340 },
            { path: 'src/components/Sidebar.jsx', type: 'file', language: 'javascript', size: 1820 },
            { path: 'src/components/Button.jsx', type: 'file', language: 'javascript', size: 950 }
          ]
        },
        {
          path: 'src/pages',
          type: 'folder',
          children: [
            { path: 'src/pages/Home.jsx', type: 'file', language: 'javascript', size: 3200 },
            { path: 'src/pages/Dashboard.jsx', type: 'file', language: 'javascript', size: 4500 }
          ]
        },
        {
          path: 'src/utils',
          type: 'folder',
          children: [
            { path: 'src/utils/api.js', type: 'file', language: 'javascript', size: 1200 },
            { path: 'src/utils/helpers.js', type: 'file', language: 'javascript', size: 800 }
          ]
        },
        { path: 'src/App.jsx', type: 'file', language: 'javascript', size: 2100 },
        { path: 'src/index.js', type: 'file', language: 'javascript', size: 450 }
      ]
    },
    {
      path: 'public',
      type: 'folder',
      children: [
        { path: 'public/index.html', type: 'file', language: 'html', size: 680 },
        { path: 'public/manifest.json', type: 'file', language: 'json', size: 320 }
      ]
    },
    { path: 'package.json', type: 'file', language: 'json', size: 1100 },
    { path: 'README.md', type: 'file', language: 'markdown', size: 2800 },
    { path: '.gitignore', type: 'file', language: 'text', size: 180 }
  ];

  // Mock analysis results
  const mockAnalysisResults = {
    'src/components/Header.jsx': {
      description: 'Main navigation header component with responsive design and user authentication state management.',
      functions: ['toggleMobileMenu', 'handleUserDropdown', 'logout'],
      complexity: 'medium',
      suggestions: ['Consider extracting user menu logic into separate hook', 'Add accessibility labels for mobile menu']
    },
    'src/pages/Dashboard.jsx': {
      description: 'Dashboard page component that displays user analytics, charts, and recent activity with real-time data updates.',
      functions: ['fetchDashboardData', 'updateCharts', 'handleRefresh'],
      complexity: 'high',
      suggestions: ['Implement data caching to reduce API calls', 'Add loading states for better UX', 'Consider code splitting for charts']
    },
    'src/utils/api.js': {
      description: 'API utility functions for making HTTP requests with authentication and error handling.',
      functions: ['makeRequest', 'handleAuth', 'processResponse'],
      complexity: 'low',
      suggestions: ['Add request interceptors for better error handling', 'Implement retry logic for failed requests']
    }
  };

  useEffect(() => {
    setFileTree(mockFileTree);
    setAnalysisResults(mockAnalysisResults);
    calculateStats(mockFileTree);
  }, []);

  const calculateStats = (tree) => {
    let totalFiles = 0;
    let folders = 0;
    
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.type === 'folder') {
          folders++;
          if (node.children) traverse(node.children);
        } else {
          totalFiles++;
        }
      });
    };
    
    traverse(tree);
    setStats({ 
      totalFiles, 
      folders, 
      analyzedFiles: Object.keys(mockAnalysisResults).length 
    });
  };

  const handleExplore = async () => {
    if (!repo.trim() || !repo.includes('/')) {
      alert('Please enter a valid repository in format: owner/repo');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setFileTree(mockFileTree);
      setAnalysisResults(mockAnalysisResults);
      calculateStats(mockFileTree);
      setIsLoading(false);
    }, 2000);
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const analyzeFile = async (filePath) => {
    setAnalyzing(true);
    
    setTimeout(() => {
      if (!analysisResults[filePath]) {
        const newAnalysis = {
          description: `AI-generated analysis for ${filePath}. This file contains important functionality for the application.`,
          functions: ['exampleFunction', 'helperMethod'],
          complexity: 'medium',
          suggestions: ['Consider adding more comments', 'Review for optimization opportunities']
        };
        
        setAnalysisResults(prev => ({
          ...prev,
          [filePath]: newAnalysis
        }));
        
        setStats(prev => ({
          ...prev,
          analyzedFiles: prev.analyzedFiles + 1
        }));
      }
      setAnalyzing(false);
    }, 1500);
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.path) ? 
        <FolderOpen className="w-5 h-5 text-amber-400" /> : 
        <Folder className="w-5 h-5 text-amber-400" />;
    }
    
    switch (file.language) {
      case 'javascript':
        return <div className="w-5 h-5 bg-yellow-400 rounded text-black text-xs flex items-center justify-center font-bold">JS</div>;
      case 'html':
        return <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">H</div>;
      case 'json':
        return <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">J</div>;
      case 'markdown':
        return <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">MD</div>;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const renderFileTree = (nodes, depth = 0) => {
    return nodes
      .filter(node => {
        if (!searchQuery) return true;
        return node.path.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter(node => {
        if (filterType === 'all') return true;
        if (filterType === 'analyzed') return analysisResults[node.path];
        if (filterType === 'unanalyzed') return !analysisResults[node.path] && node.type === 'file';
        return true;
      })
      .map((node, index) => (
        <div key={node.path}>
          <div
            className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
              selectedFile?.path === node.path ? 'bg-gradient-to-r from-blue-600/20 to-teal-600/20 border border-blue-500/30' : ''
            }`}
            style={{ paddingLeft: `${depth * 24 + 12}px` }}
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(node.path);
              } else {
                setSelectedFile(node);
              }
            }}
          >
            {node.type === 'folder' && (
              <div className="w-4 h-4 flex items-center justify-center">
                {expandedFolders.has(node.path) ? 
                  <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                }
              </div>
            )}
            
            {getFileIcon(node)}
            
            <span className="text-slate-200 font-medium flex-1">
              {node.path.split('/').pop()}
            </span>
            
            {node.type === 'file' && (
              <div className="flex items-center space-x-2">
                {node.size && (
                  <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                    {(node.size / 1000).toFixed(1)}KB
                  </span>
                )}
                {analysisResults[node.path] && (
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                )}
              </div>
            )}
          </div>
          
          {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
            <div>
              {renderFileTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      ));
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className={`fixed top-0 right-0 bottom-0 transition-all duration-300 ${isSidebarCollapsed ? 'left-16' : 'left-72'} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto`}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Control Panel */}
      <div className="relative bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 p-4 rounded-2xl shadow-lg ring-1 ring-white/10">
                <TreePine className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
                  Codebase Explorer
                </h1>
                <p className="text-slate-400 text-lg font-medium">Navigate and analyze your code</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-slate-200 font-medium">{stats.totalFiles}</span>
                <span className="text-slate-400">Files</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <Folder className="w-5 h-5 text-amber-400" />
                <span className="text-slate-200 font-medium">{stats.folders}</span>
                <span className="text-slate-400">Folders</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <Brain className="w-5 h-5 text-teal-400" />
                <span className="text-slate-200 font-medium">{stats.analyzedFiles}</span>
                <span className="text-slate-400">Analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-8 py-8">
        {/* Repository and Search Controls */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Repository</label>
              <div className="relative group">
                <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-400 transition-colors" />
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="owner/repository"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Action</label>
              <button
                onClick={handleExplore}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 hover:from-purple-700 hover:via-blue-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Exploring...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Explore Repository</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* File Tree and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 p-3 rounded-xl shadow-lg ring-1 ring-white/10">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">File Explorer</h2>
          </div>
          <div className="flex space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-10 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
              />
            </div>
            <div className="flex space-x-2">
              {['all', 'analyzed', 'unanalyzed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === filter
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {fileTree.length > 0 ? (
              renderFileTree(fileTree)
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-700/30 p-6 rounded-2xl">
                  <TreePine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400">No repository loaded</p>
                  <p className="text-slate-500 text-sm mt-1">Enter a repository above to explore</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Analysis */}
        {selectedFile && (
          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-700/50 p-3 rounded-xl">
                    {getFileIcon(selectedFile)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedFile.path.split('/').pop()}
                    </h2>
                    <p className="text-slate-400 font-mono text-sm">{selectedFile.path}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {selectedFile.size && (
                    <span className="bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium">
                      {(selectedFile.size / 1000).toFixed(1)}KB
                    </span>
                  )}
                  <button
                    onClick={() => analyzeFile(selectedFile.path)}
                    disabled={analyzing || analysisResults[selectedFile.path]}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg ring-1 ring-white/10 hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : analysisResults[selectedFile.path] ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyzed</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Analyze with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {analysisResults[selectedFile.path] && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg ring-1 ring-white/10">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">AI Analysis Results</h3>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      <span>Description</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {analysisResults[selectedFile.path].description}
                    </p>
                  </div>

                  <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Code className="w-5 h-5 text-purple-400" />
                      <span>Key Functions</span>
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {analysisResults[selectedFile.path].functions.map((func, index) => (
                        <span
                          key={index}
                          className="bg-purple-400/20 text-purple-300 px-4 py-2 rounded-xl text-sm font-medium border border-purple-400/30"
                        >
                          {func}()
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-amber-400" />
                      <span>Complexity Level</span>
                    </h4>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getComplexityColor(analysisResults[selectedFile.path].complexity)}`}>
                      {analysisResults[selectedFile.path].complexity.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span>Suggestions</span>
                    </h4>
                    <div className="space-y-3">
                      {analysisResults[selectedFile.path].suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-slate-800/60 rounded-xl border border-slate-600/30">
                          <div className="bg-yellow-400/20 p-2 rounded-lg">
                            <ArrowRight className="w-4 h-4 text-yellow-400" />
                          </div>
                          <p className="text-slate-300 leading-relaxed flex-1">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {!selectedFile && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-12 shadow-2xl ring-1 ring-white/5">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Eye className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 mb-3">Select a File to Explore</h3>
                <p className="text-slate-400 text-lg">Choose a file from the tree above to view its analysis and details.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodebaseExplorer;