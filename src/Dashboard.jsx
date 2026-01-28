import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Github, Star, GitFork, Code, Activity, AlertCircle, CheckCircle, Moon, Sun, Clock, TrendingUp, Eye, Calendar, GitBranch, GitCommit, Users, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const Dashboard = ({ username = 'alxgraphy' }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [expandedProject, setExpandedProject] = useState(null);

  const githubToken = process.env.REACT_APP_GITHUB_TOKEN;

  const fetchGithubData = useCallback(async () => {
    try {
      setError(null);
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      if (githubToken) { headers['Authorization'] = `Bearer ${githubToken}`; }
      
      const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers }
      );
      if (!reposResponse.ok) throw new Error('Failed to fetch repos');
      const reposData = await reposResponse.json();
      
      const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
      const totalWatchers = reposData.reduce((sum, repo) => sum + repo.watchers_count, 0);
      const totalIssues = reposData.reduce((sum, repo) => sum + repo.open_issues_count, 0);
      
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
      
      // REAL DATA: Mapping repo sizes for the bar chart instead of random commit numbers
      const commitChartData = reposData.slice(0, 10).map(repo => ({
        week: repo.name.substring(0, 8),
        commits: repo.size // Using size as a real metric since commits require a separate API call per repo
      }));
      
      // REAL DATA: Mapping actual stars per repo
      const starsOverTime = reposData.slice(0, 8).map(repo => ({
        month: repo.name.substring(0, 8),
        stars: repo.stargazers_count
      }));
      
      // REAL DATA: Activity based on real totals
      const activityData = [
        { name: 'Public Repos', value: userData.public_repos },
        { name: 'Total Stars', value: totalStars },
        { name: 'Forks', value: totalForks },
        { name: 'Watchers', value: totalWatchers }
      ];
      
      const projectHealth = reposData.slice(0, 10).map(repo => ({
        id: repo.id,
        name: repo.name,
        status: repo.open_issues_count === 0 ? 'healthy' : repo.open_issues_count < 5 ? 'warning' : 'attention',
        uptime: "100", 
        lastCommit: new Date(repo.updated_at),
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        size: repo.size,
        language: repo.language,
        description: repo.description,
        url: repo.html_url,
        created: repo.created_at,
        branch: repo.default_branch
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
      setLoading(false);
    }
  }, [username, githubToken]);

  useEffect(() => { fetchGithubData(); }, [fetchGithubData]);

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

  const toggleExpand = (idx) => {
    setExpandedProject(expandedProject === idx ? null : idx);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center transition-colors duration-300`}>
        <Activity className="w-6 h-6 animate-spin text-gray-500" />
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
              <h1 className="text-4xl md:text-5xl font-black mb-2">The Alx Dashboard</h1>
              <p className="text-gray-300 text-sm">Real-time Project Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'} p-3 rounded-2xl shadow-lg`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: <Code />, val: githubData?.repoCount, label: 'Projects' },
            { icon: <Star />, val: githubData?.totalStars, label: 'Stars' },
            { icon: <GitFork />, val: githubData?.totalForks, label: 'Forks' },
            { icon: <Eye />, val: githubData?.totalWatchers, label: 'Watchers' },
            { icon: <AlertCircle />, val: githubData?.totalIssues, label: 'Issues' },
            { icon: <Users />, val: githubData?.user?.followers, label: 'Followers' },
          ].map((stat, i) => (
            <div key={i} className={`${cardBg} border-2 rounded-2xl p-6 shadow-lg`}>
              <div className={`${textPrimary} mb-3`}>{stat.icon}</div>
              <div className={`text-3xl font-black ${textPrimary} mb-1`}>{stat.val || 0}</div>
              <div className={`text-xs ${textTertiary}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
            <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>Repository Size (KB)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={githubData?.commitChartData}>
                <XAxis dataKey="week" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#000' }} />
                <Bar dataKey="commits" fill={darkMode ? '#9ca3af' : '#000'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
            <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>Star Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={githubData?.starsOverTime}>
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="stars" stroke={darkMode ? '#fff' : '#000'} fill={darkMode ? '#4b5563' : '#e5e5e5'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
            <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>User Activity</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={githubData?.activityData} innerRadius={50} outerRadius={80} dataKey="value">
                  {githubData?.activityData?.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Health Status */}
        <div className={`${cardBg} border-2 rounded-3xl p-6 shadow-xl`}>
          <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>Project Health Monitor (Click for Info)</h2>
          <div className="space-y-4">
            {githubData?.projectHealth?.map((project, idx) => (
              <div 
                key={idx} 
                onClick={() => toggleExpand(idx)}
                className={`${accentBg} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-2xl p-6 ${hoverBg} transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xl font-bold ${textPrimary}`}>{project.name}</span>
                      {getStatusIcon(project.status)}
                    </div>
                    {project.description && <p className={`text-sm ${textSecondary} mb-3`}>{project.description}</p>}
                  </div>
                  {expandedProject === idx ? <ChevronUp className={textTertiary} /> : <ChevronDown className={textTertiary} />}
                </div>

                {/* MORE INFO TOGGLE SECTION */}
                {expandedProject === idx && (
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300`}>
                    <div className={`text-sm ${textSecondary}`}>
                      <p><strong>Repo ID:</strong> {project.id}</p>
                      <p><strong>Default Branch:</strong> {project.branch}</p>
                    </div>
                    <div className={`text-sm ${textSecondary}`}>
                      <p><strong>Created:</strong> {new Date(project.created).toLocaleDateString()}</p>
                      <p><a href={project.url} target="_blank" rel="noreferrer" className="text-blue-500 flex items-center gap-1 mt-1">View on GitHub <ExternalLink className="w-3 h-3" /></a></p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className={`text-xs ${textTertiary}`}>Last Commit</div>
                    <div className={`font-bold ${textPrimary}`}>{Math.floor((Date.now() - project.lastCommit) / (1000 * 60 * 60 * 24))}d ago</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textTertiary}`}>Language</div>
                    <div className={`font-bold ${textPrimary}`}>{project.language || 'N/A'}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textTertiary}`}>Stars</div>
                    <div className={`font-bold ${textPrimary}`}>{project.stars}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textTertiary}`}>Size</div>
                    <div className={`font-bold ${textPrimary}`}>{(project.size / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-8 text-center ${textTertiary} text-sm pb-8`}>
          <p>Monitoring {githubData?.repoCount || 0} real projects • Last updated {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
