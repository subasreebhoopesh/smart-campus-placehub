# Placement Portal Backend API

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Run database.sql
source database.sql
```

### 3. Configure Environment
Edit `.env` file with your MySQL credentials

### 4. Start Server
```bash
npm start
```

Server will run on http://localhost:3001

## API Documentation

See `COMPLETE_SETUP_GUIDE.md` for full API documentation.

## Test API
```bash
curl http://localhost:3001/api/health
```

Should return: `{"success":true,"message":"Server is running"}`
