# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017

## Installation (5 minutes)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

If not running, start it according to your installation method.

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📧 Using Ethereal test email account
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

### 4. Open the App

Navigate to: http://localhost:3000

## First Automation (2 minutes)

1. Click **"+ New Automation"**
2. Enter name: "My First Flow"
3. Click **"Create"**

You'll see the flow editor with Start and End nodes connected.

4. Click **"📧 Email Action"** in the left toolbar
5. Drag the new Action node between Start and End
6. Click the Action node to configure it
7. Enter message: "Hello from my automation!"
8. Click **"Save"**
9. Delete the old Start→End edge by selecting it and pressing Delete
10. Connect: Start → Action → End (drag from handles)
11. Click **"Save Flow"** (bottom right)

## Test Your Automation (1 minute)

1. Click **"← Back to Automations"**
2. Click **"Test"** on your automation
3. Enter email: "test@example.com"
4. Click **"Start Test"**

Check the **backend terminal** for the email preview URL:
```
📧 Email preview URL: https://ethereal.email/message/xxxxx
```

Click the URL to see your email!

## Next Steps

### Try a Delay

1. Edit your automation
2. Add a **"⏰ Delay"** node
3. Configure it for "1 minute"
4. Insert it: Start → Delay → Action → End
5. Save and test
6. **Close your browser**
7. Wait 1 minute
8. Check the preview URL - email arrives even with browser closed!

### Try a Condition

1. Edit your automation
2. Add a **"🔀 Condition"** node
3. Configure:
   - Rule: Email **includes** "test"
   - Logic: AND
4. Add two Action nodes:
   - Action 1: "You're a test user!"
   - Action 2: "Welcome, regular user!"
5. Connect:
   - Start → Condition
   - Condition (TRUE) → Action 1 → End
   - Condition (FALSE) → Action 2 → End
6. Save and test with different emails

## Troubleshooting

**MongoDB not running?**
```bash
# Windows (if installed as service)
net start MongoDB

# Mac (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Port 5000 already in use?**
Edit `backend/.env`:
```env
PORT=5001
```

**Port 3000 already in use?**
Next.js will auto-suggest port 3001

**Can't see emails?**
Check the backend console for Ethereal preview URLs. They look like:
```
📧 Email preview URL: https://ethereal.email/message/xxxxx
```

## API Testing (Optional)

Test the API directly:

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**List Automations:**
```bash
curl http://localhost:5000/api/automations
```

**Start Test:**
```bash
curl -X POST http://localhost:5000/api/automations/{id}/test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## What's Next?

- Read [README.md](../README.md) for full documentation
- Check [walkthrough.md](walkthrough.md) for implementation details
- Explore the code in `backend/src/` and `frontend/`
- Try building complex flows with multiple conditions and delays

Enjoy building automation flows! 🚀
