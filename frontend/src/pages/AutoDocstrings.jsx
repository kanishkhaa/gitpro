import React, { useState, useEffect } from 'react';
import { Search, FileText, Code, Brain, CheckCircle, AlertTriangle, Clock, Eye, Zap, Star, GitBranch, Users, Shield, Activity, BookOpen, Download, Copy } from 'lucide-react';

const AutoDocstrings = () => {
  const [repo, setRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [stats, setStats] = useState({ totalFiles: 0, docsGenerated: 0, linesDocumented: 0 });
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock data for demonstration
  const mockDocs = [
    {
      id: 1,
      filename: "src/utils/api.py",
      path: "src/utils/api.py",
      language: "python",
      functions: [
        {
          name: "get_changed_files",
          params: ["repo: str"],
          description: "Fetches recently changed files from a GitHub repository using the GitHub API.",
          example: "files = get_changed_files('owner/repo')"
        },
        {
          name: "call_groq_api", 
          params: ["prompt: str"],
          description: "Makes API calls to Groq's AI service for generating documentation content.",
          example: "response = call_groq_api('Generate docs for this code...')"
        }
      ],
      documentation: `# API Utilities Module

## Overview
This module provides essential utilities for interacting with external APIs, specifically GitHub and Groq AI services. It handles repository analysis and AI-powered documentation generation.

## Functions

### get_changed_files(repo: str) -> List[str]
Retrieves a list of recently modified files from a GitHub repository.

**Parameters:**
- \`repo\`: Repository identifier in format 'owner/repo'

**Returns:**
- List of file paths that have been recently changed

**Example:**
\`\`\`python
files = get_changed_files('microsoft/vscode')
print(f"Found {len(files)} changed files")
\`\`\`

### call_groq_api(prompt: str) -> str
Sends a prompt to Groq AI service and returns the generated response.

**Parameters:**
- \`prompt\`: The input prompt for AI processing

**Returns:**
- Generated text response from the AI model

**Example:**
\`\`\`python
doc = call_groq_api("Generate documentation for this function...")
print(doc)
\`\`\`

## Dependencies
- \`requests\`: For HTTP API calls
- \`groq\`: Groq AI SDK

## Usage Notes
- Ensure API keys are properly configured
- Handle rate limiting for GitHub API
- Consider caching responses for frequently accessed repositories`,
      timestamp: new Date().toISOString(),
      status: "completed",
      linesCount: 156
    },
    {
      id: 2,
      filename: "src/core/processor.py",
      path: "src/core/processor.py", 
      language: "python",
      functions: [
        {
          name: "process_code_file",
          params: ["file_path: str", "content: str"],
          description: "Processes a source code file and extracts structural information for documentation.",
          example: "result = process_code_file('app.py', file_content)"
        }
      ],
      documentation: `# Code Processor Module

## Overview
Core processing engine for analyzing source code files and extracting documentation-relevant information.

## Functions

### process_code_file(file_path: str, content: str) -> Dict
Analyzes source code content and extracts functions, classes, and documentation metadata.

**Parameters:**
- \`file_path\`: Path to the source file
- \`content\`: Raw source code content

**Returns:**
- Dictionary containing extracted code structure information

**Example:**
\`\`\`python
with open('example.py', 'r') as f:
    content = f.read()
result = process_code_file('example.py', content)
\`\`\`

## Features
- Multi-language support
- Function signature extraction
- Class hierarchy analysis
- Import dependency tracking`,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: "completed",
      linesCount: 89
    }
  ];

  useEffect(() => {
    setGeneratedDocs(mockDocs);
    setStats({
      totalFiles: mockDocs.length,
      docsGenerated: mockDocs.length,
      linesDocumented: mockDocs.reduce((acc, doc) => acc + doc.linesCount, 0)
    });
  }, []);

  const handleGenerateDocs = async () => {
    if (!repo.trim() || !repo.includes('/')) {
      alert('Please enter a valid repository in format: owner/repo');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newDoc = {
        id: Date.now(),
        filename: "example.js",
        path: "src/components/example.js",
        language: "javascript",
        functions: [
          {
            name: "handleSubmit",
            params: ["event: Event"],
            description: "Handles form submission with validation and API calls.",
            example: "handleSubmit(formEvent)"
          }
        ],
        documentation: `# Example Component

## Overview
A React component demonstrating form handling and user interaction patterns.

## Functions

### handleSubmit(event: Event)
Processes form submission with comprehensive validation.

**Parameters:**
- \`event\`: Form submission event object

**Example:**
\`\`\`javascript
const handleSubmit = (event) => {
  event.preventDefault();
  // Process form data
};
\`\`\``,
        timestamp: new Date().toISOString(),
        status: "completed",
        linesCount: 45
      };
      
      setGeneratedDocs(prev => [newDoc, ...prev]);
      setStats(prev => ({
        totalFiles: prev.totalFiles + 1,
        docsGenerated: prev.docsGenerated + 1,
        linesDocumented: prev.linesDocumented + newDoc.linesCount
      }));
      setIsLoading(false);
    }, 3000);
  };

  const getLanguageColor = (language) => {
    switch (language.toLowerCase()) {
      case 'python': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'javascript': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'typescript': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'java': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'go': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

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
                <BookOpen className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
                  Auto Docstrings
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-medium">AI-powered documentation generation for your codebase</p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-200 font-medium">{stats.totalFiles}</span>
                  <span className="text-slate-400">Files</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-200 font-medium">{stats.docsGenerated}</span>
                  <span className="text-slate-400">Docs</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <Activity className="w-5 h-5 text-teal-400" />
                  <span className="text-slate-200 font-medium">{stats.linesDocumented}</span>
                  <span className="text-slate-400">Lines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative px-8 py-8">
        {/* Control Panel */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-10 shadow-2xl ring-1 ring-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Repository Input */}
            <div>
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

            {/* Generate Button */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Action
              </label>
              <button
                onClick={handleGenerateDocs}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 hover:from-purple-700 hover:via-blue-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl ring-1 ring-white/10 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Generating Documentation...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    <span>Generate Documentation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Documentation List */}
        <div className="space-y-8">
          {generatedDocs.map((doc) => (
            <div key={doc.id} className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all duration-300">
              {/* Documentation Header */}
              <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-2xl shadow-lg ring-1 ring-white/10">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(doc.timestamp).toLocaleString()}</span>
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getLanguageColor(doc.language)}`}>
                          {doc.language}
                        </span>
                        <span className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-lg">
                          <Code className="w-4 h-4" />
                          <span>{doc.linesCount} lines</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => copyToClipboard(doc.documentation)}
                      className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white p-3 rounded-xl transition-all duration-300 flex items-center space-x-2"
                      title="Copy documentation"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <span className="bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-400/30">
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Functions Overview */}
              <div className="p-8 border-b border-slate-700/50 bg-slate-800/30">
                <h4 className="text-lg font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Functions Documented</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doc.functions.map((func, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                          <Code className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="font-mono text-purple-300 font-semibold">{func.name}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{func.description}</p>
                      <div className="bg-slate-800/60 rounded-lg p-2">
                        <code className="text-xs text-slate-300 font-mono">{func.example}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Documentation */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-slate-300 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <span>Generated Documentation</span>
                  </h4>
                </div>
                
                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
                  <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                    {doc.documentation}
                  </pre>
                </div>
              </div>
            </div>
          ))}

          {generatedDocs.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-12 shadow-2xl ring-1 ring-white/5">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-300 mb-3">No Documentation Generated Yet</h3>
                <p className="text-slate-400 text-lg">Enter a repository above to start generating comprehensive documentation for your codebase.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoDocstrings;