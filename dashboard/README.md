# NeerSetu Dashboard

Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India.

## Overview

The NeerSetu Dashboard is a comprehensive web application that provides real-time monitoring, analytics, and management capabilities for health surveillance and water quality monitoring across rural communities in Northeast India.

## Features

### 🏠 Dashboard Overview
- Real-time statistics and key metrics
- Risk index monitoring with visual indicators
- Recent activity tracking
- High-risk village alerts
- Interactive charts and graphs

### 🗺️ Map View
- Interactive map with village locations
- Color-coded risk levels
- Real-time risk circles
- Village details and statistics
- Risk legend and filtering

### 📊 Analytics
- Comprehensive data analysis
- Trend visualization
- Symptoms distribution
- Water quality trends
- Risk distribution analysis
- Monthly and yearly trends

### 🧪 Outbreak Simulator
- Interactive parameter adjustment
- Real-time risk calculation
- Scenario testing
- Map visualization of results
- Prediction history tracking

### 🚨 Alerts Management
- Real-time alert monitoring
- Alert acknowledgment and resolution
- Filtering and search capabilities
- Alert statistics and summaries
- Escalation tracking

### 📋 Reports
- Report generation and management
- Multiple report types
- Download capabilities
- Report statistics
- Historical report access

## Technology Stack

- **Frontend**: React 18, React Router
- **Styling**: Tailwind CSS, Custom CSS
- **Charts**: Chart.js, React Chart.js 2
- **Maps**: Leaflet, React Leaflet
- **Icons**: Heroicons
- **State Management**: React Hooks
- **HTTP Client**: Axios (for API calls)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Top navigation bar
│   ├── Sidebar.js      # Side navigation
│   ├── StatsCard.js    # Statistics display cards
│   ├── RiskIndexCard.js # Risk index visualization
│   ├── Chart.js        # Chart wrapper component
│   └── AlertCard.js    # Alert display component
├── pages/              # Main application pages
│   ├── Login.js        # Authentication page
│   ├── Dashboard.js    # Main dashboard
│   ├── MapView.js      # Interactive map
│   ├── Analytics.js    # Data analytics
│   ├── Simulator.js    # Outbreak simulator
│   ├── Alerts.js       # Alerts management
│   └── Reports.js      # Reports management
├── App.js              # Main application component
├── App.css             # Custom styles
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Key Components

### Dashboard
- Overview statistics
- Risk index monitoring
- Recent activity feed
- High-risk village alerts
- Interactive charts

### Map View
- Leaflet-based interactive map
- Village markers with risk indicators
- Risk circles visualization
- Village details panel
- Risk legend

### Analytics
- Multiple chart types (line, bar, doughnut)
- Data filtering and date range selection
- Trend analysis
- Symptoms and water quality analysis
- Risk distribution visualization

### Simulator
- Real-time parameter adjustment
- Environmental and water quality factors
- Risk calculation algorithm
- Map visualization of results
- Prediction history tracking

### Alerts
- Real-time alert monitoring
- Status management (sent, acknowledged, resolved)
- Priority-based filtering
- Alert statistics
- Escalation tracking

### Reports
- Report generation interface
- Multiple report types
- Download functionality
- Report history
- Statistics and summaries

## API Integration

The dashboard integrates with the NeerSetu backend API for:
- User authentication
- Data fetching and updates
- Real-time monitoring
- Report generation
- Alert management

## Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes

## Customization

### Themes
- Water-themed color scheme
- Custom CSS variables
- Responsive design patterns
- Accessibility considerations

### Styling
- Tailwind CSS for utility classes
- Custom CSS for specific components
- Responsive breakpoints
- Print-friendly styles

## Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Structure
- Component-based architecture
- Custom hooks for state management
- Responsive design patterns
- Accessibility considerations

## Deployment

The dashboard can be deployed to:
- Static hosting services (Netlify, Vercel)
- Cloud platforms (AWS, Azure, GCP)
- Traditional web servers
- CDN distribution

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Optimized bundle size
- Lazy loading for components
- Efficient state management
- Responsive image handling
- Caching strategies

## Security

- Input validation
- XSS protection
- CSRF protection
- Secure API communication
- Authentication handling

## License

MIT License - See LICENSE file for details.

## Support

For support and questions, contact the NeerSetu development team.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] Real-time data updates
- [ ] Advanced analytics features
- [ ] Mobile app integration
- [ ] Offline capabilities
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] User management
- [ ] Notification system
