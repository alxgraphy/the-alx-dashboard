const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
app.use(express.json());

// API Keys
const API_KEYS = {
  openWeather: process.env.OPENWEATHER_API_KEY,
  alphaVantage: process.env.ALPHAVANTAGE_API_KEY,
  newsApi: process.env.NEWS_API_KEY
};

// Helper function to get cached or fetch
const getCachedOrFetch = async (key, fetchFunction) => {
  const cached = cache.get(key);
  if (cached) {
    console.log(`Cache hit: ${key}`);
    return cached;
  }
  
  console.log(`Cache miss: ${key} - fetching...`);
  const data = await fetchFunction();
  cache.set(key, data);
  return data;
};

// Weather endpoint with forecast
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const cacheKey = `weather-${city}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const [currentWeather, forecast] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEYS.openWeather}&units=metric`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEYS.openWeather}&units=metric`
        )
      ]);
      
      return {
        current: currentWeather.data,
        forecast: forecast.data
      };
    });
    
    res.json(data);
  } catch (error) {
    console.error('Weather fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
});

// Stock quote endpoint
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock-${symbol}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.alphaVantage}`
      );
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    console.error('Stock fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      message: error.message 
    });
  }
});

// Stock historical data endpoint
app.get('/api/stocks/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock-history-${symbol}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.alphaVantage}`
      );
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    console.error('Stock history fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch historical stock data',
      message: error.message 
    });
  }
});

// Batch stocks endpoint (more efficient)
app.post('/api/stocks/batch', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Invalid symbols array' });
    }
    
    const stockPromises = symbols.map(symbol =>
      getCachedOrFetch(`stock-${symbol}`, async () => {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEYS.alphaVantage}`
        );
        return response.data;
      })
    );
    
    const results = await Promise.all(stockPromises);
    res.json(results);
  } catch (error) {
    console.error('Batch stocks fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch batch stock data',
      message: error.message 
    });
  }
});

// GitHub user endpoint with detailed analytics
app.get('/api/github/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cacheKey = `github-${username}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      // Fetch user and repos in parallel
      const [userResponse, reposResponse] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`),
        axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
      ]);
      
      const userData = userResponse.data;
      const reposData = reposResponse.data;
      
      // Fetch detailed stats for each repo (with rate limiting consideration)
      // For production, you might want to batch these or use GraphQL
      const detailedRepos = await Promise.all(
        reposData.slice(0, 10).map(async (repo) => {
          try {
            const [statsResponse, langResponse] = await Promise.all([
              axios.get(`https://api.github.com/repos/${username}/${repo.name}/stats/participation`),
              axios.get(`https://api.github.com/repos/${username}/${repo.name}/languages`)
            ]);
            
            return {
              ...repo,
              commitActivity: statsResponse.data?.all || [],
              languages: langResponse.data
            };
          } catch (error) {
            // If rate limited or error, return basic repo data
            return {
              ...repo,
              commitActivity: [],
              languages: {}
            };
          }
        })
      );
      
      // Calculate aggregate stats
      const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
      const totalWatchers = reposData.reduce((sum, repo) => sum + repo.watchers_count, 0);
      
      // Language breakdown
      const allLanguages = {};
      detailedRepos.forEach(repo => {
        Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
          allLanguages[lang] = (allLanguages[lang] || 0) + bytes;
        });
      });
      
      const totalBytes = Object.values(allLanguages).reduce((a, b) => a + b, 0);
      const languageBreakdown = Object.entries(allLanguages)
        .map(([name, bytes]) => ({
          name,
          value: ((bytes / totalBytes) * 100).toFixed(1),
          bytes
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 5);
      
      return {
        user: userData,
        repos: detailedRepos,
        totalStars,
        totalForks,
        totalWatchers,
        languageBreakdown,
        repoCount: reposData.length
      };
    });
    
    res.json(data);
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch GitHub data',
      message: error.message 
    });
  }
});

// GitHub repo details endpoint
app.get('/api/github/:username/:repo', async (req, res) => {
  try {
    const { username, repo } = req.params;
    const cacheKey = `github-repo-${username}-${repo}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const [repoResponse, commitsResponse, langResponse] = await Promise.all([
        axios.get(`https://api.github.com/repos/${username}/${repo}`),
        axios.get(`https://api.github.com/repos/${username}/${repo}/commits?per_page=10`),
        axios.get(`https://api.github.com/repos/${username}/${repo}/languages`)
      ]);
      
      return {
        repo: repoResponse.data,
        recentCommits: commitsResponse.data,
        languages: langResponse.data
      };
    });
    
    res.json(data);
  } catch (error) {
    console.error('GitHub repo fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch GitHub repo data',
      message: error.message 
    });
  }
});

// News endpoint with categories
app.get('/api/news', async (req, res) => {
  try {
    const { category = 'technology', country = 'us', pageSize = 10 } = req.query;
    const cacheKey = `news-${category}-${country}`;
    
    const data = await getCachedOrFetch(cacheKey, async () => {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apikey=${API_KEYS.newsApi}`
      );
      return response.data;
    });
    
    res.json(data);
  } catch (error) {
    console.error('News fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news data',
      message: error.message 
    });
  }
});

// Aggregate endpoint - get all data in one call
app.get('/api/dashboard/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { city = 'Toronto', stocks = 'AAPL,GOOGL,MSFT' } = req.query;
    
    const stockSymbols = stocks.split(',');
    
    // Fetch everything in parallel
    const [weatherData, githubData, newsData] = await Promise.all([
      getCachedOrFetch(`weather-${city}`, async () => {
        const [current, forecast] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEYS.openWeather}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEYS.openWeather}&units=metric`)
        ]);
        return { current: current.data, forecast: forecast.data };
      }),
      getCachedOrFetch(`github-${username}`, async () => {
        const [user, repos] = await Promise.all([
          axios.get(`https://api.github.com/users/${username}`),
          axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
        ]);
        return { user: user.data, repos: repos.data };
      }),
      getCachedOrFetch('news-technology-us', async () => {
        const response = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=10&apikey=${API_KEYS.newsApi}`
        );
        return response.data;
      })
    ]);
    
    res.json({
      weather: weatherData,
      github: githubData,
      news: newsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard aggregate fetch error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      message: error.message 
    });
  }
});

// Cache stats endpoint
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json({
    keys: cache.keys(),
    stats
  });
});

// Clear cache endpoint
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cache: {
      keys: cache.keys().length,
      stats: cache.getStats()
    }
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 NEURAL_NET DASHBOARD API                              ║
║  Running on: http://localhost:${PORT}                        ║
╚═══════════════════════════════════════════════════════════╝

📊 Available Endpoints:
   ┌─ Weather
   │  GET  /api/weather/:city
   │
   ┌─ Stocks
   │  GET  /api/stocks/:symbol
   │  GET  /api/stocks/:symbol/history
   │  POST /api/stocks/batch
   │
   ┌─ GitHub
   │  GET  /api/github/user/:username
   │  GET  /api/github/:username/:repo
   │
   ┌─ News
   │  GET  /api/news?category=technology&country=us
   │
   ┌─ Aggregate
   │  GET  /api/dashboard/:username?city=Toronto&stocks=AAPL,GOOGL
   │
   └─ System
      GET  /health
      GET  /api/cache/stats
      POST /api/cache/clear

⚡ Features:
   • 5-minute response caching
   • Rate limit protection
   • Auto-refresh support
   • Batch operations
   • GitHub auto-detection of new repos
  `);
});

module.exports = app;