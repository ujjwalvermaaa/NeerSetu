# NeerSetu - Quick Reference Guide

## 🚀 **One-Command Start**

### **Linux/macOS**
```bash
./start-all.sh
```

### **Windows**
```cmd
start-all.bat
```

---

## 🌐 **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Admin Dashboard** | http://localhost:3000 | Web interface for administrators |
| **Progressive Web App** | http://localhost:3001 | Mobile-friendly web app |
| **Mobile App (Web)** | http://localhost:19006 | React Native web version |
| **Backend API** | http://localhost:3000/api | REST API endpoints |
| **ML Service** | http://localhost:8001 | Machine learning service |

---

## 📱 **Mobile App Setup**

### **Quick Start**
1. Install **Expo Go** app on your phone
2. Run: `cd mobile-app && npm start`
3. Scan QR code with Expo Go
4. App loads on your device

### **Web Version**
- Open: http://localhost:19006
- Works in any browser
- Full functionality available

---

## 🔧 **Manual Service Start**

### **Backend API**
```bash
cd backend
npm install
npm start
```

### **ML Service**
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

### **IoT Simulator**
```bash
cd iot-simulator
pip install -r requirements.txt
python enhanced_iot_simulator.py
```

### **Dashboard**
```bash
cd dashboard
npm install
npm start
```

### **Web App**
```bash
cd neersetu-web
npm install
PORT=3001 npm start
```

### **Mobile App**
```bash
cd mobile-app
npm install
npm start
```

---

## 🎯 **Key Features**

### **Real-time Monitoring**
- Live sensor data from 100+ villages
- Instant alerts for anomalies
- Automatic dashboard updates

### **Machine Learning**
- 3 trained ML models
- 155 predictive features
- Disease outbreak prediction
- 100% data quality score

### **Cross-platform**
- Web dashboard
- Mobile app (iOS/Android)
- Progressive Web App
- Offline support

---

## 📊 **Demo Script for Judges**

### **1. Show ML Service**
```bash
cd ml-service
python test_ml_service.py
```
**Highlight**: 2,500+ records, 155 features, 100% quality

### **2. Show IoT Simulator**
```bash
cd iot-simulator
python enhanced_iot_simulator.py
```
**Highlight**: Real-time data, 100+ villages, alerts

### **3. Show Dashboard**
Open: http://localhost:3000
**Highlight**: Live data, interactive maps, charts

### **4. Show Mobile App**
Open: http://localhost:19006
**Highlight**: Cross-platform, offline support, user-friendly

---

## 🛠️ **Troubleshooting**

### **Port Conflicts**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:8001 | xargs kill -9
lsof -ti:19006 | xargs kill -9
```

### **Dependencies Issues**
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

### **Python Issues**
```bash
# Use Python 3 explicitly
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8001
```

---

## 📈 **Performance Metrics**

- **2,500+ health records** processed
- **155 predictive features** generated
- **100% data quality** score
- **100+ villages** monitored
- **25+ API endpoints** available
- **3 ML models** trained

---

## 🎉 **Success Indicators**

✅ **ML Service**: Configuration valid, models trained
✅ **IoT Simulator**: Data generation active
✅ **Backend API**: Server running, database connected
✅ **Dashboard**: Web interface accessible
✅ **Mobile App**: App loads, features working

---

**NeerSetu - Complete Full-Stack Solution Ready!** 🚀

