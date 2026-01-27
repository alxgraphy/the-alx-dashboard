# The Alx Dashboard

A beautiful, real-time GitHub analytics dashboard built with React. Track your repositories, monitor project health, and visualize your development activity all in one place.

![Dashboard Preview](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 📊 **Real-time Stats** - Live repository metrics and analytics
- 🎨 **Dark/Light Mode** - Toggle between themes with smooth transitions
- 📈 **Interactive Charts** - Visualize commits, stars, and activity breakdown
- 🔄 **Auto-refresh** - Updates every 5 minutes automatically
- 🎯 **Project Health Monitor** - Track the status of all your repositories
- 💻 **Language Distribution** - See your most-used programming languages
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- A GitHub account
- A GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alxgraphy/the-alx-dashboard.git
   cd the-alx-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your GitHub token:
   ```
   REACT_APP_GITHUB_TOKEN=your_github_token_here
   ```

4. **Run the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Getting Your GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Dashboard Access"
4. Select scope: `public_repo` (or `repo` for private repos)
5. Click "Generate token" and copy it
6. Add it to your `.env` file

**Important:** Never commit your `.env` file or share your token publicly!

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variable:
   - **Name:** `REACT_APP_GITHUB_TOKEN`
   - **Value:** Your GitHub token
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and import your repository
3. Go to Site Settings → Environment Variables
4. Add `REACT_APP_GITHUB_TOKEN` with your token
5. Redeploy your site

## 🛠️ Tech Stack

- **React** - UI framework
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons
- **Tailwind CSS** - Styling
- **GitHub API** - Data source

## 📊 Dashboard Features

### Stats Overview
- Total Projects
- Total Stars
- Total Forks
- Watchers
- Open Issues
- Followers

### Charts & Visualizations
- **Commit Activity** - Weekly commit trends
- **Stars Growth** - Star history over time
- **Activity Breakdown** - Pie chart of contributions
- **Language Distribution** - Programming languages used

### Project Health Monitor
- Repository status indicators
- Last commit timestamps
- Issue tracking
- Uptime monitoring

## 🎨 Customization

You can customize the username by passing it as a prop:

```jsx
<Dashboard username="your-github-username" />
```

Or modify the default in `Dashboard.jsx`:

```javascript
const Dashboard = ({ username = 'your-username' }) => {
  // ...
}
```

## 📝 Project Structure

```
the-alx-dashboard/
├── public/
├── src/
│   ├── Dashboard.jsx      # Main dashboard component
│   ├── App.js             # App entry point
│   └── index.js
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── package.json
└── README.md
```

## 🔒 Security

- Never commit your `.env` file
- Never share your GitHub token
- The `.gitignore` file is configured to protect your secrets
- Tokens are only stored in environment variables
- Use read-only tokens when possible

## 🐛 Troubleshooting

### API Rate Limit
- **Without token:** 60 requests/hour
- **With token:** 5,000 requests/hour
- Solution: Add your GitHub token to `.env`

### Dashboard shows "Offline"
- Check your internet connection
- Verify your GitHub token is valid
- Check if you've hit the API rate limit

### Data not updating
- The dashboard auto-refreshes every 5 minutes
- You can manually refresh the page
- Check browser console for errors

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Alexander Wondwossen** - [@alxgraphy](https://github.com/alxgraphy)

## 🙏 Acknowledgments

- GitHub API for providing the data
- Recharts for the beautiful charts
- The React community for amazing tools

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

---

⭐ Star this repo if you find it useful!
