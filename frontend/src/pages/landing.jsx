import React, { useState, useEffect } from 'react';
import { ChevronRight, Github, Shield, BarChart3, GitCommit, FileText, Users, Scan, Clock, Zap, Star, ArrowRight, Code2, Brain, Rocket, CheckCircle } from 'lucide-react';
import Lottie from 'lottie-react';
import landing from '../assets/mainlanding.json';
import analyzer from '../assets/analyzer.json';
import document from '../assets/document.json';
import history from '../assets/history.json';
import onboarding from '../assets/onboarding.json';
import productivity from '../assets/productivity.json';
import security from '../assets/security.json';
import smartcode from '../assets/smartcode.json';

// LandingPage component
const LandingPage = () => {
  // State for mouse position, feature rotation, typewriter effect, and animation visibility
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentFeature, setCurrentFeature] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Words for typewriter effect, aligned with feature titles
  const typewriterWords = [
    'Code Review',
    'Productivity',
    'Analysis',
    'Documentation',
    'Onboarding',
    'Security',
    'Git History'
  ];

  // Mouse move effect for background animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Feature rotation effect for highlighting feature cards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 7);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for hero heading
  useEffect(() => {
    const currentWord = typewriterWords[typewriterIndex];
    const typingSpeed = isDeleting ? 75 : 150; // Slower typing for smoother effect

    const timer = setTimeout(() => {
      if (!isDeleting && typewriterText.length < currentWord.length) {
        setTypewriterText(currentWord.slice(0, typewriterText.length + 1));
      } else if (isDeleting && typewriterText.length > 0) {
        setTypewriterText(currentWord.slice(0, typewriterText.length - 1));
      } else if (!isDeleting && typewriterText.length === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1200);
      } else if (isDeleting && typewriterText.length === 0) {
        setIsDeleting(false);
        setTypewriterIndex((prev) => (prev + 1) % typewriterWords.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, typewriterIndex]);

  // Fade-in effect for landing animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Feature data with animations
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Smart Code Reviewer",
      description: "AI-powered analysis of pull requests detecting security vulnerabilities, code smells, and performance bottlenecks",
      color: "from-red-400 to-pink-400",
      animation: smartcode
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Productivity Insights",
      description: "Visual metrics and dashboards showing PR turnaround times, contributor activity, and team workflow optimization",
      color: "from-blue-400 to-cyan-400",
      animation: productivity
    },
    {
      icon: <GitCommit className="w-8 h-8" />,
      title: "Commit Intent Analyzer",
      description: "Analyze commit messages against actual changes, flag inconsistencies, and suggest better descriptions",
      color: "from-green-400 to-emerald-400",
      animation: analyzer
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "AI Documentation Generator",
      description: "Auto-generate comprehensive documentation for functions, classes, and modules following your standards",
      color: "from-purple-400 to-violet-400",
      animation: document
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Smart Onboarding Assistant",
      description: "Help new developers understand codebase structure, key files, and system architecture instantly",
      color: "from-orange-400 to-red-400",
      animation: onboarding
    },
    {
      icon: <Scan className="w-8 h-8" />,
      title: "AI Security Scanner",
      description: "Detect hardcoded secrets, unsafe input handling, and injection risks with AI-suggested fixes",
      color: "from-teal-400 to-cyan-400",
      animation: security
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Visual Git History",
      description: "Timeline view with AI-generated summaries of sprints, releases, and logical code evolution",
      color: "from-indigo-400 to-purple-400",
      animation: history
    }
  ];

  // Stats data
  const stats = [
    { value: "10x", label: "Faster Code Reviews" },
    { value: "85%", label: "Fewer Security Issues" },
    { value: "50%", label: "Reduced Onboarding Time" },
    { value: "99.9%", label: "Uptime Guarantee" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-blue-900/15 to-teal-900/15"></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/25 to-purple-400/25 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePos.x - 192,
            top: mousePos.y - 192,
            transition: 'all 0.3s ease-out'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between p-6 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            DevAI Pro
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-blue-300 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-blue-300 transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-blue-300 transition-colors">Docs</a>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 rounded-full hover:from-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 animate-pulse-subtle">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-24 md:py-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-12">
          <div className="w-full md:w-1/2 text-left">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-8 border border-white/20">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-gray-200">Trusted by 10,000+ developers worldwide</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                AI {typewriterText}
              </span>
              <span className="animate-pulse text-blue-300 drop-shadow-md">|</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-2xl leading-relaxed">
              Transform your development workflow with AI-powered code reviews, security scanning, 
              documentation generation, and team insights. Built for modern development teams.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <button className="group bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 animate-pulse-subtle flex items-center space-x-2">
                <Github className="w-5 h-5" />
                <span>Connect with GitHub</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full text-lg font-semibold border border-white/20 hover:bg-white/10 transition-all">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="mx-auto max-w-3xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 animate-scale-in"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-gray-200 mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-end mt-8 md:mt-0">
            <div className={`w-[500px] h-[500px] md:w-[800px] md:h-[800px] pointer-events-none -mt-24 md:-mt-40 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <Lottie animationData={landing} loop={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="relative z-10 px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Seven integrated AI tools that revolutionize how you develop, review, and maintain code
            </p>
          </div>

          {/* Interactive Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-10 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-105 ${
                  currentFeature === index ? 'ring-2 ring-blue-400/50' : ''
                }`}
                onMouseEnter={() => setCurrentFeature(index)}
              >
                <div className="w-[150px] h-[150px] mx-auto mb-6">
                  <Lottie animationData={feature.animation} loop={true} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/5 group-hover:to-purple-400/5 rounded-2xl transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="relative z-10 px-8 py-24 bg-gradient-to-r from-blue-900/15 to-purple-900/15">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">
            Seamless GitHub Integration
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
            Install once, transform everything. Our AI integrates directly with your existing GitHub workflow
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">One-Click Setup</h3>
              <p className="text-gray-300">Install in seconds with our GitHub App</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real-time Analysis</h3>
              <p className="text-gray-300">AI reviews every PR automatically</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Continuous Learning</h3>
              <p className="text-gray-300">AI adapts to your coding patterns</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-900/15 to-purple-900/15 backdrop-blur-2xl rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Ready to Transform Your Development Workflow?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of developers who've revolutionized their code quality and team productivity
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="group bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 animate-pulse-subtle flex items-center space-x-2">
                <Rocket className="w-5 h-5" />
                <span>Start Free Trial</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full text-lg font-semibold border border-white/20 hover:bg-white/10 transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">DevAI Pro</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">API Docs</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-300">
            <p>© 2025 DevAI Pro. Revolutionizing development with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;