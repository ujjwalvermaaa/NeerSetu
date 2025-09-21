# NeerSetu Backend API

Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India.

## Overview

The Backend API is the central hub of the NeerSetu ecosystem, providing secure APIs for data collection, processing, and integration with ML services and alert systems.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 📊 **Health Reports**: Collect and manage health symptom reports
- 💧 **Water Quality**: Process water quality data from IoT sensors
- 🤖 **ML Integration**: Connect with ML service for outbreak predictions
- 📱 **File Uploads**: Handle voice reports, images, and documents
- 📈 **Analytics**: Comprehensive analytics and reporting
- 🚨 **Alert Integration**: Trigger alerts based on risk levels
- 🔒 **Security**: Rate limiting, input validation, and error handling

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Health Reports
- `POST /api/health-reports` - Submit health report
- `GET /api/health-reports` - Get health reports
- `GET /api/health-reports/:id` - Get specific health report
- `PUT /api/health-reports/:id` - Update health report
- `DELETE /api/health-reports/:id` - Delete health report

### Water Reports
- `POST /api/water-reports` - Submit water quality report
- `GET /api/water-reports` - Get water quality reports
- `GET /api/water-reports/:id` - Get specific water report
- `GET /api/water-reports/village/:village` - Get reports by village

### Predictions
- `POST /api/predictions` - Get ML prediction
- `GET /api/predictions` - Get prediction history
- `GET /api/predictions/village/:village` - Get predictions by village

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/village/:village` - Get village analytics
- `GET /api/analytics/report` - Generate custom report
- `GET /api/analytics/risk-distribution` - Get risk distribution
- `GET /api/analytics/monthly-trends` - Get monthly trends

### IoT Integration
- `POST /api/iot/water` - Process IoT water data
- `GET /api/iot/water/history/:village` - Get water quality history
- `GET /api/iot/water/stats/:village` - Get water quality statistics

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/picture` - Upload profile picture
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/neersetu

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# External Services
ML_SERVICE_URL=http://localhost:8000
ALERTS_SERVICE_URL=http://localhost:3004
ALERTS_SERVICE_TOKEN=your_alerts_service_token

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:19006

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Database Models

### User
- Basic user information with role-based access
- Profile pictures and contact details
- Village, state, and district information

### HealthReport
- Symptom reports from villagers
- Voice and image attachments
- Location and severity data

### WaterReport
- Water quality measurements
- IoT sensor data integration
- Contamination level assessment

### Prediction
- ML model predictions
- Risk index calculations
- Contributing factors analysis

### Alert
- Alert management and tracking
- Escalation levels
- Acknowledgment and resolution

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different access levels for different user roles
- **Rate Limiting**: Prevent API abuse with configurable limits
- **Input Validation**: Comprehensive validation using Joi
- **File Upload Security**: Type and size restrictions
- **CORS Protection**: Configurable cross-origin resource sharing
- **Error Handling**: Secure error responses without sensitive data

## File Upload

The API supports file uploads for:
- Profile pictures (images)
- Voice reports (audio files)
- Image reports (photos)
- Water test images (test strips)

Files are stored in organized directories and served statically.

## Integration

The Backend API integrates with:
- **ML Service**: For outbreak predictions
- **Alerts Service**: For notification delivery
- **Mobile App**: For data collection
- **Dashboard**: For analytics and monitoring
- **IoT Simulator**: For water quality data

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Watching Logs
```bash
npm run logs
```

## API Documentation

The API follows RESTful conventions and returns JSON responses with consistent structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## License

MIT License - See LICENSE file for details.

## Support

For support and questions, contact the NeerSetu development team.
