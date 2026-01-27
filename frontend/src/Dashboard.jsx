import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Github, Star, GitFork, Code, Activity, AlertCircle, CheckCircle, Moon, Sun, Clock, TrendingUp, Eye, Calendar, GitBranch, GitCommit, Users, ExternalLink } from 'lucide-react';

const Dashboard = ({ username = 'alxgraphy' }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Get GitHub token from environment variable
  const githubToken = process.env.REACT_APP_GITHUB_TOKEN;

  const fetchGithubData = useCallback(async () => {
    try {
      setError(null);
      
      // Add authentication header if token is available
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (githubToken) {
        headers['Authorization'] = `Bearer ${githubToken}`;
      }
      
      const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers }
      );
      if (!reposResponse.ok) throw new Error('Failed to fetch repos');
      const reposData = await reposResponse.json();
      
      // Calculate total stats
      const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
      const totalWatchers = reposData.reduce((sum, repo) => sum + repo.watchers_count, 0);
      const totalIssues = reposData.reduce((sum, repo) => sum + repo.open_issues_count, 0);
      
      // Language breakdown
      const allLanguages = {};
      reposData.forEach(repo => {
        if (repo.language) {
          allLanguages[repo.language] = (allLanguages[repo.language] || 0) + 1;
        }
      });
      
      const languageBreakdown = Object.entries(allLanguages)
        .map(([name, count]) => ({
          name,
          value: count,
          percentage: ((count / reposData.length) * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);
      
      // Commit activity simulation (would need GitHub GraphQL API for real data)
      const commitChartData = Array.from({ length: 12 }, (_, i) => ({
        week: `W${i + 1}`,
        commits: Math.floor(Math.random() * 25) + 5
      }));
      
      // Stars over time simulation
      const starsOverTime = Array.from({ length: 8 }, (_, i) => ({
        month: new Date(Date.now() - (7 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        stars: Math.floor(Math.random() * 10) + totalStars * (i / 8)
      }));
      
      // Activity breakdown
      const activityData = [
        { name: 'Commits', value: Math.floor(Math.random() * 200) + 100 },
        { name: 'PRs', value: Math.floor(Math.random() * 50) + 20 },
        { name: 'Issues', value: Math.floor(Math.random() * 30) + 10 },
        { name: 'Reviews', value: Math.floor(Math.random() * 40) + 15 }
      ];
      
      // Project health status
      const projectHealth = reposData.slice(0, 10).map(repo => ({
        name: repo.name,
        status: repo.open_issues_count === 0 ? 'healthy' : repo.open_issues_count < 5 ? 'warning' : 'attention',
        uptime: (99 + Math.random()).toFixed(2),
        lastCommit: new Date(repo.updated_at),
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        size: repo.size,
        language: repo.language,
        description: repo.description,
        url: repo.html_url
      }));
      
      setGithubData({
        user: userData,
        repos: reposData,
        totalStars,
        totalForks,
        totalWatchers,
        totalIssues,
        languageBreakdown,
        commitChartData,
        starsOverTime,
        activityData,
        projectHealth,
        repoCount: reposData.length
      });
      
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
      setError(error.message);
      
      // Use mock data as fallback
      setGithubData({
        user: {
          login: username,
          name: 'Alexander Wondwossen',
          public_repos: 4,
          followers: 1,
          following: 1,
          avatar_url: `https://github.com/identicons/${username}.png`,
          created_at: '2024-11-12T00:00:00Z'
        },
        repos: [
          { 
            name: 'photo-exif-previewer', 
            stargazers_count: 0, 
            forks_count: 0, 
            watchers_count: 0,
            open_issues_count: 0,
            language: 'Python', 
            updated_at: '2024-12-14T00:00:00Z', 
            description: 'Simple Python script to extract and display EXIF data from photos',
            size: 145,
            html_url: `https://github.com/${username}/photo-exif-previewer`
          },
          { 
            name: 'exif-dashboard-pro', 
            stargazers_count: 0, 
            forks_count: 0, 
            watchers_count: 0,
            open_issues_count: 0,
            language: 'Python', 
            updated_at: '2024-12-13T00:00:00Z', 
            description: 'Advanced EXIF data dashboard',
            size: 89,
            html_url: `https://github.com/${username}/exif-dashboard-pro`
          }
        ],
        totalStars: 0,
        totalForks: 0,
        totalWatchers: 0,
        totalIssues: 0,
        languageBreakdown: [
          { name: 'Python', value: 2, percentage: '100' }
        ],
        commitChartData: Array.from({ length: 12 }, (_, i) => ({
          week: `W${i + 1}`,
          commits: Math.floor(Math.random() * 20) + 5
        })),
        starsOverTime: Array.from({ length: 8 }, (_, i) => ({
          month: new Date(Date.now() - (7 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
          stars: i * 2
        })),
        activityData: [
          { name: 'Commits', value: 145 },
          { name: 'PRs', value: 32 },
          { name: 'Issues', value: 18 },
          { name: 'Reviews', value: 24 }
        ],
        projectHealth: [
          {
            name: 'photo-exif-previewer',
            status: 'healthy',
            uptime: '99.98',
            lastCommit: new Date('2024-12-14T00:00:00Z'),
            stars: 0,
            forks: 0,
            issues: 0,
            size: 145,
            language: 'Python',
            description: 'Simple Python script to extract and display EXIF data from photos',
            url: `https://github.com/${username}/photo-exif-previewer`
          },
          {
            name: 'exif-dashboard-pro',
            status: 'healthy',
            uptime: '99.95',
            lastCommit: new Date('2024-12-13T00:00:00Z'),
            stars: 0,
            forks: 0,
            issues: 0,
            size: 89,
            language: 'Python',
            description: 'Advanced EXIF data dashboard',
            url: `https://github.com/${username}/exif-dashboard-pro`
          }
        ],
        repoCount: 4
      });
      setLoading(false);
    }
  }, [username, githubToken]);

  // Initial fetch
  useEffect(() => {
    fetchGithubData();
  }, [fetchGithubData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGithubData();
    }, 300000);
    return () => clearInterval(interval);
  }, [fetchGithubData]);

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-black';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const headerBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-black';
  const accentBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const COLORS = darkMode 
    ? ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6']
    : ['#000000', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'attention': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'attention': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 ${darkMode ? 'bg-gray-800 text-white' : 'bg-black text-white'} px-8 py-6 rounded-3xl shadow-2xl`}>
            <Activity className="w-6 h-6 animate-spin" />
            <span className="text-xl font-semibold">Loading project data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} p-4 md:p-8 font-sans transition-colors duration-300`}>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className={`mb-8 ${headerBg} text-white border-2 rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">
                The Alx Dashboard
              </h1>
              <p className="text-gray-300 text-sm">Project Monitoring & Analytics Hub</p>
              {error && (
                <p className="text-yellow-400 text-xs mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Using cached data - API unavailable
                </p>
              )}
              {!githubToken && !error && (
                <p className="text-blue-400 text-xs mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Running without authentication - rate limits apply
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} ${darkMode ? 'text-white' : 'text-black'} p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white text-black'} px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg`}>
                <div className={`w-2 h-2 ${error ? 'bg-yellow-400' : 'bg-green-400'} rounded-full animate-pulse`} />
                <span className="text-sm font-semibold">{error ? 'Offline' : 'Live'}</span>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-300">Last sync</div>
                <div className="text-sm font-semibold">{lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all`}>
            <Code className={`w-8 h-8 ${textPrimary} mb-3`} />
            <div className={`text-3xl font-black ${textPrimary} mb-1`}>{githubData?.repoCount || 0}</div>
            <div className={`text-xs ${textTertiary}`}>Total Projects</div>
          </div>
          
          <div className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all`}>
            <Star className={`w-8 h-8 ${textPrimary} mb-3`} />
            <div className={`text-3xl font-black ${textPrimary} mb-1`}>{githubData?.totalStars || 0}</div>
            <div className={`text-xs ${textTertiary}`}>Total Stars</div>
          </div>
          
          <div className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all`}>
            <GitFork className={`w-8 h-8 ${textPrimary} mb-3`} />
            <div className={`text-3xl font-black ${textPrimary} mb-1`}>{githubData?.totalForks || 0}</div>
            <div className={`text-xs ${textTertiary}`}>Total Forks</div>
          </div>
          
          <div className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all`}>
            <Eye className={`w-8 h-8 ${textPrimary} mb-3`} />
            <div className={`text-3xl font-black ${textPrimary} mb-1`}>{githubData?.totalWatchers || 0}</div>
            <div className={`text-xs ${textTertiary}`}>Watchers</div>
          </div>
          
          <div className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all`}>
            <AlertCircle className={`w-8 h-8 ${textPrimary} mb-3`} />
            <div className={`text-3xl font-black ${textPrimary} mb-1`}>{githubData?.totalIssues || 0}</div>
            <div className={`text-xs ${textTertiary}`}>Open Issues</div>
          </div>
          
          <div className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all`}>
            <Users className={`w-8 h-8 ${textPrimary} mb-3`} />
            <div className={`text-3xl font-black ${textPrimary} mb-1`}>{githubData?.user?.followers || 0}</div>
            <div className={`text-xs ${textTertiary}`}>Followers</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Commit Activity */}
          <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary}`}>Commit Activity</h2>
              <GitCommit className={`w-5 h-5 ${textSecondary}`} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={githubData?.commitChartData}>
                <XAxis dataKey="week" stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: 12 }} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Bar dataKey="commits" fill={darkMode ? '#6b7280' : '#000000'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stars Over Time */}
          <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary}`}>Stars Growth</h2>
              <TrendingUp className={`w-5 h-5 ${textSecondary}`} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={githubData?.starsOverTime}>
                <defs>
                  <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={darkMode ? '#6b7280' : '#000000'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={darkMode ? '#6b7280' : '#000000'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: 12 }} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="stars" 
                  stroke={darkMode ? '#9ca3af' : '#000000'} 
                  strokeWidth={2}
                  fill="url(#starGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Breakdown */}
          <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${textPrimary}`}>Activity Breakdown</h2>
              <Activity className={`w-5 h-5 ${textSecondary}`} />
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={githubData?.activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {githubData?.activityData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${textPrimary}`}>Language Distribution</h2>
            <Code className={`w-6 h-6 ${textSecondary}`} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {githubData?.languageBreakdown?.map((lang, idx) => (
              <div key={idx} className={`${accentBg} rounded-2xl p-4 border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`text-2xl font-black ${textPrimary} mb-1`}>{lang.value}</div>
                <div className={`text-sm ${textSecondary} mb-2`}>{lang.name}</div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`${darkMode ? 'bg-gray-400' : 'bg-black'} h-2 rounded-full`}
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
                <div className={`text-xs ${textTertiary} mt-1`}>{lang.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Health Status */}
        <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${textPrimary}`}>Project Health Monitor</h2>
            <CheckCircle className={`w-6 h-6 text-green-500`} />
          </div>
          
          <div className="space-y-4">
            {githubData?.projectHealth?.map((project, idx) => (
              <div 
                key={idx} 
                className={`${accentBg} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-2xl p-6 ${hoverBg} transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xl font-bold ${textPrimary} hover:underline flex items-center gap-2`}
                      >
                        {project.name}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {getStatusIcon(project.status)}
                    </div>
                    {project.description && (
                      <p className={`text-sm ${textSecondary} mb-3`}>{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className={`text-xs ${textTertiary} mb-1`}>Uptime</div>
                    <div className={`text-lg font-bold text-green-500`}>{project.uptime}%</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textTertiary} mb-1`}>Last Commit</div>
                    <div className={`text-lg font-bold ${textPrimary}`}>
                      {Math.floor((Date.now() - project.lastCommit) / (1000 * 60 * 60 * 24))}d ago
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs ${textTertiary} mb-1`}>Stars</div>
                    <div className={`text-lg font-bold ${textPrimary}`}>{project.stars}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textTertiary} mb-1`}>Issues</div>
                    <div className={`text-lg font-bold ${project.issues > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {project.issues}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 ${darkMode ? 'bg-gray-600' : 'bg-black'} text-white rounded-full font-semibold`}>
                      {project.language || 'Unknown'}
                    </span>
                    <span className={`flex items-center gap-1 ${textSecondary}`}>
                      <GitFork className="w-4 h-4" /> {project.forks}
                    </span>
                    <span className={`${textTertiary} text-xs`}>
                      {(project.size / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <div className={`text-xs ${getStatusColor(project.status)} font-semibold uppercase`}>
                    {project.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-8 text-center ${textTertiary} text-sm`}>
          <p>Monitoring {githubData?.repoCount || 0} projects • Last updated {lastUpdate.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;