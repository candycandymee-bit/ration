# Ration Track - Digital Ration Distribution System

A complete full-stack application for digitalizing the ration distribution system in India, built with PostgreSQL, Prisma, Express.js, and React.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js + Prisma ORM + PostgreSQL
- **Frontend**: React + Vite + React Router + TailwindCSS
- **Database**: PostgreSQL with UUID-based primary keys
- **Authentication**: JWT with http-only cookies
- **Email**: Nodemailer with SMTP configuration
- **Cron Jobs**: Monthly quota reset using node-cron
- **Charts**: Recharts for quota visualization

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL database
- SMTP email account (Gmail recommended)

### Installation

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd ration-track
npm run install-all
```

2. **Setup environment variables:**

**Server (.env in /server):**
```bash
cd server
cp .env.example .env
# Edit .env with your database and email configuration
```

**Client (.env in /client):**
```bash
cd ../client
cp .env.example .env
# Edit .env with your API URL
```

3. **Setup database:**
```bash
cd ../server
npm run db:setup
```

4. **Start development servers:**
```bash
# From root directory - starts both client and server
npm run dev

# Or separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client  
cd client && npm run dev
```

## 🔐 Demo Login Credentials

### Admin Users
- **Username**: `admin1` / **Password**: `Admin@123` (Sector 15, Chandigarh)
- **Username**: `admin2` / **Password**: `Admin@123` (Model Town, Delhi)

### Ration Card Users
- `RC001`, `RC002`, `RC003`, `RC004` (Shop 1 users)
- `RC101`, `RC102`, `RC103`, `RC104`, `RC105` (Shop 2 users)

## 📊 Features

### Admin Portal
- **Stock Management**: Add supplies, track inventory, low stock alerts
- **Ration Distribution**: Search users, validate quotas, distribute rations
- **Transaction History**: View and filter all distributions
- **User Management**: Add, edit, delete ration card holders
- **Dashboard Analytics**: Stock summary, today's transactions, user count

### User Portal  
- **Quota Tracking**: Visual charts showing monthly consumption
- **Shop Stock**: Real-time availability of items at assigned shop
- **Transaction History**: Personal distribution history
- **Dashboard Overview**: Consumption statistics and utilization rates

### System Features
- **Monthly Reset**: Automated cron job resets consumption on 1st of each month
- **Email Notifications**: SMTP-based notifications for important events
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization across admin operations

## 🛠️ Database Schema

### Core Models
- **Shop**: Ration shops with location details
- **Admin**: Shop administrators with login credentials
- **User**: Ration card holders with quotas and consumption tracking
- **Stock**: Shop inventory for Rice, Wheat, Sugar, Kerosene
- **Transaction**: Distribution records with full audit trail

### Key Features
- UUID-based primary keys for all models
- Row Level Security (RLS) for data isolation
- Automated monthly consumption reset
- Comprehensive transaction logging
- Stock validation before distribution

## 🔄 Monthly Reset System

The system automatically resets user consumption on the 1st of every month:

- **Automatic**: Runs via cron job at `0 0 1 * *` (1st day, 00:00)
- **Manual Trigger**: `POST /api/system/monthly-reset` (requires system key)
- **Safe**: Updates all users in a single transaction
- **Logged**: Tracks reset date and affected user count

## 📧 Email Configuration

Configure SMTP settings in server/.env:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your@gmail.com" 
SMTP_PASS="your_gmail_app_password"
MAIL_FROM="Ration Track <your@gmail.com>"
```

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

## 🎨 Design System

### Color Palette
- **Primary**: `#2b6777` (Deep Blue)
- **Secondary**: `#c8d8e4` (Light Blue-Gray)  
- **Accent**: `#52ab98` (Teal Green)
- **Background**: `#ffffff`, `#f2f2f2`

### Components
- Card-based layouts with subtle shadows
- Responsive grid systems
- Interactive charts with hover states
- Modal dialogs for form interactions
- Toast notifications for user feedback

## 🔧 Development

### Database Operations

**Reset Database:**
```bash
cd server
npm run db:reset
```

**Run Migrations:**
```bash
npx prisma migrate deploy
```

**Generate Types:**
```bash
npx prisma generate
```

**Database Studio:**
```bash
npx prisma studio
```

### Adding New Features

1. **Database Changes**: Create migration in `server/prisma/migrations/`
2. **API Routes**: Add endpoints in `server/src/routes/`  
3. **Frontend Components**: Create in `client/src/components/`
4. **Update Seeding**: Modify `server/prisma/seed.js`

## 🚀 Deployment

### Render/Heroku Deployment

1. **Environment Variables**: Set all required env vars
2. **Database**: Provision PostgreSQL addon
3. **Build Commands**:
   - Server: `npm install && npm run db:setup`
   - Client: `npm install && npm run build`
4. **Start Command**: `npm start`

### Docker Deployment

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine AS production  
# ... production setup
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Admin login with demo credentials
- [ ] User login with ration card numbers
- [ ] Stock management (add supplies)
- [ ] Ration distribution with quota validation
- [ ] Monthly reset functionality
- [ ] Responsive design on mobile
- [ ] Email notifications (if configured)

### Data Validation

```bash
# Validate Prisma schema
npx prisma validate

# Check database setup
npm run db:setup
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Follow the established code structure
4. Test thoroughly with seed data
5. Submit pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Support**: For issues or questions, please check the GitHub issues or create a new one with detailed information about the problem.