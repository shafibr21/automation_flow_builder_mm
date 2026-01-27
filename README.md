# Automation Flow Builder

A production-ready web application for creating and managing email automation flows visually using a drag-and-drop interface.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- React Flow (visual flow editor)
- TypeScript
- Tailwind CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Nodemailer (email sending)

## 📋 Features

### Core Features
- ✅ Visual flow editor with drag-and-drop
- ✅ CRUD operations for automations
- ✅ Unique automation names (enforced at DB level)
- ✅ Test execution with email input
- ✅ Background execution (continues after browser close)
- ✅ Server restart resilience (resumes pending executions)

### Node Types
1. **Start Node** - Entry point (fixed, single)
2. **End Node** - Exit point (fixed, single)
3. **Action Node** - Send email with custom message
4. **Delay Node** - Wait before continuing
   - Absolute mode: Wait until specific date/time
   - Relative mode: Wait for duration (minutes/hours/days)
5. **Condition Node** - Branch based on email rules (BONUS)
   - Operators: equals, not equals, includes, starts with, ends with
   - AND/OR logic for multiple rules
   - TRUE/FALSE paths

### Validation
- Frontend: Real-time validation with visual feedback
- Backend: Authoritative validation before save/execute
- Flow structure validation (connectivity, node configuration)
- Unique name constraint at database level

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
cd automation_flow_builder_mm
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Backend Environment**
```bash
cd ../backend
# Copy .env.example to .env and configure
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/automation_flow
PORT=5000
NODE_ENV=development
```

5. **Start MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env to your MongoDB connection string
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## 📖 Usage Guide

### Creating an Automation

1. Click "New Automation" on the home page
2. Enter a unique name
3. You'll be taken to the flow editor with Start and End nodes connected

### Building a Flow

1. **Add Nodes:**
   - Click buttons in the left toolbar to add Action, Delay, or Condition nodes
   - Drag nodes to position them

2. **Configure Nodes:**
   - Click a node to open the configuration panel on the right
   - Fill in required fields:
     - **Action**: Email message text
     - **Delay**: Choose absolute or relative mode, set time/duration
     - **Condition**: Add rules with operators and values

3. **Connect Nodes:**
   - Drag from a node's bottom handle to another node's top handle
   - Flow must go from Start → steps → End
   - Condition nodes have two outputs (TRUE/FALSE)

4. **Save:**
   - Click "Save Flow" button (bottom right)

### Testing an Automation

1. Go to home page
2. Click "Test" on an automation
3. Enter test email address
4. Click "Start Test"
5. Execution runs in background on server
6. Check email for messages (or server console for Ethereal preview URLs)

### Editing/Deleting

- **Edit**: Click "Edit" to modify the flow
- **Delete**: Click "Delete" and confirm

## 🔧 API Endpoints

### Automations
- `GET /api/automations` - List all automations
- `GET /api/automations/:id` - Get single automation
- `POST /api/automations` - Create automation
- `PUT /api/automations/:id` - Update automation
- `DELETE /api/automations/:id` - Delete automation

### Test Execution
- `POST /api/automations/:id/test` - Start test execution
  - Body: `{ "email": "test@example.com" }`
- `GET /api/executions/:id` - Get execution status and logs
- `GET /api/executions` - List all executions (debugging)

### Health Check
- `GET /api/health` - Server health status

## 🧪 Testing

### Manual Testing Scenarios

**1. Simple Flow**
```
Start → Action (email message) → End
```
- Create flow, save, test with email
- Verify email received

**2. Flow with Delay**
```
Start → Delay (1 minute) → Action → End
```
- Create flow with 1-minute delay
- Start test, close browser
- Wait 1 minute, verify email received

**3. Flow with Condition**
```
Start → Condition (email includes "test") → TRUE: Action1 / FALSE: Action2 → End
```
- Create flow with condition
- Test with email containing "test" → verify Action1 executed
- Test with different email → verify Action2 executed

**4. Validation Testing**
- Try creating automation with duplicate name → should fail
- Try saving flow without Action message → should fail
- Try saving flow with past absolute time → should fail

**5. Server Restart Test**
- Start test with delay
- Restart backend server during delay
- Verify execution resumes after restart

## 📁 Project Structure

```
automation_flow_builder_mm/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Automation.js       # Automation schema
│   │   │   └── TestExecution.js    # Execution tracking schema
│   │   ├── routes/
│   │   │   ├── automations.js      # CRUD routes
│   │   │   └── test.js             # Test execution routes
│   │   ├── services/
│   │   │   ├── executionEngine.js  # Flow execution logic
│   │   │   ├── emailService.js     # Email sending
│   │   │   └── validationService.js # Flow validation
│   │   └── server.js               # Express app entry
│   ├── package.json
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── automations/[id]/
│   │   │   └── page.tsx            # Editor page
│   │   ├── layout.tsx
│   │   └── page.tsx                # Home page (list)
│   ├── components/
│   │   ├── nodes/
│   │   │   └── CustomNodes.tsx     # React Flow nodes
│   │   ├── panels/
│   │   │   └── ConfigPanels.tsx    # Node config panels
│   │   └── FlowEditor.tsx          # Main editor component
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   └── types.ts                # TypeScript types
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🔐 Data Models

### Automation
```typescript
{
  _id: ObjectId,
  name: string (unique),
  nodes: [
    {
      id: string,
      type: "start" | "end" | "action" | "delay" | "condition",
      position: { x: number, y: number },
      data: { /* node-specific config */ }
    }
  ],
  edges: [
    {
      id: string,
      source: string,
      target: string,
      sourceHandle?: string
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### TestExecution
```typescript
{
  _id: ObjectId,
  automationId: ObjectId,
  email: string,
  status: "pending" | "running" | "completed" | "failed",
  currentNodeId?: string,
  executionLog: [
    {
      nodeId: string,
      nodeType: string,
      timestamp: Date,
      status: "success" | "failed",
      message?: string
    }
  ],
  scheduledFor?: Date,
  createdAt: Date,
  completedAt?: Date
}
```

## 🎯 Key Implementation Details

### Execution Engine
- Runs asynchronously on backend
- Persists state to MongoDB
- Uses setTimeout for delays with DB persistence
- Resumes pending executions on server restart
- Continues execution independent of client connection

### Email Sending
- Uses Nodemailer with Ethereal (test) or real SMTP
- Development mode auto-creates Ethereal account
- Preview URLs logged to console in development
- Production uses configured SMTP credentials

### Validation
- Multi-layer: Frontend (UX) + Backend (authoritative)
- Flow structure: connectivity, node configs, cycles
- Database constraints: unique name index
- Runtime validation before execution

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod` or check your service
- Verify MONGODB_URI in backend/.env

**Port Already in Use:**
- Backend: Change PORT in backend/.env
- Frontend: Next.js will auto-increment port

**Email Not Received:**
- Check backend console for Ethereal preview URLs
- Verify SMTP configuration if using real email
- Check execution logs via API: GET /api/executions/:id

**Flow Not Saving:**
- Check browser console for errors
- Verify all nodes are configured (no empty required fields)
- Ensure flow is valid (Start → End connectivity)

## 📝 Notes

- This is a technical assessment implementation
- Focus is on architecture, validation, and execution reliability
- Email service uses Ethereal for testing (check console for preview URLs)
- All executions are logged and can be inspected via API

## 🔮 Future Enhancements

- User authentication
- Scheduled automations (cron-like)
- More action types (SMS, webhooks, etc.)
- Analytics and execution history UI
- Flow templates
- Collaborative editing
- Export/import flows

## 📄 License

MIT
