# Smart Task Management System (MERN) 🚀🎯

An intelligent, interactive, and gamified task management web application built using the MERN stack (MongoDB, Express.js, React, Node.js). Featuring natural language AI processing via **Groq SDK (Llama 3.3)**, interactive analytics dashboards, daily streaks, customizable quests/achievements, multi-language localization, database backup/restore portability, and a built-in admin control panel.

---

## 🌟 Key Features

### 📋 1. Core Task Workspace
*   **Comprehensive CRUD**: Create, read, update, delete, and duplicate tasks.
*   **Detailed Task Meta**: Define titles, descriptions, categories (e.g., Personal, Work, Education, Health), projects (e.g., General, specific project names), tags, dependencies, and checklist subtasks.
*   **Flexible Scheduling**: Set start, end, and due dates with integrated timezone conversions. Supports task recurrence (Daily, Weekly, Monthly).
*   **Archive System**: Keep your active workspace clean by archiving completed/old tasks with the ability to restore them later.

### 🤖 2. SmartTask AI Assistant
*   **Groq LLM Power**: Integrates the **Llama 3.3 70B** model to provide responsive, smart assistance.
*   **Natural Language Actions**: Chat to create, update, search, or delete tasks directly (e.g., *"Schedule homework tomorrow at 6 PM"* or *"Mark React project as completed"*).
*   **Smart Scheduling & Breakdowns**: Ask the AI to break down a large task into checklist subtasks, estimate duration, recommend priorities, or compile daily/weekly agenda planners.
*   **Persistent Context**: Remembers conversation history (saved in MongoDB) and resolves relative coreferences (e.g., *"Delete that task"* or *"Mark it as high priority"*).

### 🎮 3. Gamification & Streak Mechanics
*   **Experience & Level Up**: Earn XP by creating and completing tasks (higher priority yields more XP!). XP is automatically penalized upon task deletion or status rollback.
*   **Streak Tracking**: Built-in consecutive login streak tracker with daily XP multipliers.
*   **Quest Board**: Unlock specialized badges and achievements (e.g., *First Step*, *Task Master*, *Productivity Legend*, *High Stakes*, *Streak Starter*).
*   **Leaderboard**: View friendly competition featuring other platform users and simulated productivity bots (*CodeNinja*, *TaskMasterPro*, *FocusBeast*, etc.).

### 📊 4. Productivity Analytics
*   **Interactive Charts**: Beautiful charts powered by `recharts` mapping productivity scores, task status ratios, project/category weightings, and timeline progression.
*   **Productivity Metrics**: Tracks overall productivity rating, average estimated task times vs. actual hours, and highlights the *Most Important Task* based on deadline and priority weight.

### 📁 5. Portability & Custom Preferences
*   **PDF Exporting**: Export task tables to high-quality PDF files with customizable columns using `jsPDF` and `jspdf-autotable`.
*   **JSON Backups**: Download your entire task list as a JSON backup file and restore it instantly on another machine/profile by uploading it.
*   **Preferences & Theme**: Toggle between Light/Dark mode. Choose from multiple languages (English, Spanish, Hindi) with instant, reactive translation.

### 🛡️ 6. User Security & Administration
*   **Google Sign-In**: Login securely using standard credentials or Google OAuth 2.0.
*   **Secure Authentication**: Password hashing (bcryptjs) and JWT-based authentication.
*   **Verification Flows**: Full email verification code flow and secure password reset mechanisms (Nodemailer ready).
*   **Admin Panel**: Admin users can manage registered users (promote/demote roles, delete accounts), view global app statistics, and run global backups/restores.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React (v18), React Bootstrap, Bootstrap 5, Recharts, React Icons, Axios, React Router DOM (v6) |
| **Backend** | Node.js, Express.js, JWT, BcryptJS, Nodemailer, Multer (File Handling) |
| **Database** | MongoDB + Mongoose (ODM) |
| **AI Integration** | Groq SDK (`llama-3.3-70b-versatile`) |
| **Reporting & Backup** | jsPDF, jsPDF-AutoTable, JSON-based backup streams |

---

## 📂 Project Directory Structure

```text
smart-task-management/
├── backend/
│   ├── config/             # Database connection & Groq API client config
│   │   ├── db.js
│   │   └── grok.js
│   ├── controllers/        # Express handlers (Auth, Tasks, Admin, Chat, Gamification)
│   ├── middleware/         # JWT Authentication & authorization guards
│   ├── models/             # Mongoose schemas (User, Task, ChatHistory)
│   ├── routes/             # API Router mappings
│   ├── services/           # AI (Intent Detection, LLM calls) & Core Task Business Logic
│   │   ├── aiService.js
│   │   ├── intentService.js
│   │   └── taskService.js
│   ├── uploads/            # Temporary storage for backups
│   ├── .env                # Backend environmental variables
│   ├── server.js           # Express main server entrypoint
│   └── seed_dummy_tasks.js # DB seed script for testing dashboard metrics
│
├── frontend/
│   ├── public/             # React static assets
│   ├── src/
│   │   ├── api/            # Pre-configured Axios instance with interceptors
│   │   │   └── axiosInstance.js
│   │   ├── components/     # UI Components (TaskForm, TaskCard, Sidebar, Navbar, Chatbot, ExportPDFModal)
│   │   ├── context/        # React Global States (Auth Context)
│   │   ├── pages/          # Full Page layouts (Dashboard, Login, Register, VerifyEmail, ForgotPassword)
│   │   ├── App.css         # Styling system (variables, custom dark mode, layouts)
│   │   ├── App.jsx         # App router setup & auth-guarded routing
│   │   └── index.js        # React DOM render root
│   ├── .env                # Frontend environmental variables
│   └── package.json
└── README.md
```

---

## 🗄️ Database Schemas (Mongoose)

### 👤 `User` Model
*   **Profile**: `name`, `email`, `password`, `role` (`["User", "Admin"]`), `googleId`, `isVerified`
*   **Gamification**: `xp` (Experience points), `level`, `badges` (array of string IDs), `dailyStreak`, `lastActiveDate`
*   **Preferences**: `settings` object containing `theme` (`"Light"/"Dark"`), `language` (`"English"/"Spanish"/"Hindi"`), `timeZone`, `emailNotifications`, `browserNotifications`, `privacyPublic`
*   **Achievements**: Track progress (`progress`, `maxProgress`, `completed`) for custom quests.

### 📝 `Task` Model
*   **Ownership**: `user` (ref: `User`)
*   **Content**: `title`, `description`, `category` (default: `"Personal"`), `project` (default: `"General"`), `tags`
*   **Schedules**: `startDate`, `endDate`, `dueDate`, `recurrence` (`["None", "Daily", "Weekly", "Monthly"]`)
*   **State & Tracking**: `priority` (`["Low", "Medium", "High", "Critical"]`), `status` (`["Todo", "In Progress", "Review", "Completed", "Overdue"]`), `archived` (Boolean)
*   **Sub-structures**: `checklists` (text, done boolean), `subtasks` (title, status), `dependencies` (array of Task refs), `estimatedTime`, `actualTime` (in hours)

### 💬 `ChatHistory` Model
*   **Ownership**: `user` (ref: `User`)
*   **Message Details**: `role` (`["user", "assistant"]`), `message` content, and automatic timestamp references.

---

## 📡 API Endpoints

### 🔑 Authentication (`/api/auth`)
*   `POST /api/auth/register` - Create a new account.
*   `POST /api/auth/login` - Local authentication.
*   `POST /api/auth/verify` - Verify email using the code sent on sign up.
*   `POST /api/auth/resend-verification` - Dispatch verification code again.
*   `POST /api/auth/forgot-password` - Trigger reset password flow.
*   `POST /api/auth/reset-password` - Apply new password via token.
*   `POST /api/auth/google` - Secure OAuth authentication via Google client payload.
*   `PUT /api/auth/profile` - Update user settings and info (Protected).
*   `PUT /api/auth/change-password` - Change account password (Protected).
*   `DELETE /api/auth/delete-account` - Wipe user data from database (Protected).

### 📋 Task Management (`/api/tasks`)
*   `GET /api/tasks` - List user tasks (supports filters & search).
*   `POST /api/tasks` - Create a new task.
*   `PUT /api/tasks/:id` - Update details/status of a task.
*   `DELETE /api/tasks/:id` - Delete task.
*   `POST /api/tasks/:id/duplicate` - Copy task configurations.
*   `PUT /api/tasks/:id/archive` - Send task to Archive.
*   `PUT /api/tasks/:id/restore` - Bring task back from Archive.

### 🤖 AI Agent (`/api/chat`)
*   `POST /api/chat` - Chat endpoint. Automatically detects intent, runs database operations, and returns natural language responses.
*   `GET /api/chat/history` - Retrieve persistent user-bot chat logs.
*   `DELETE /api/chat/history` - Clear conversation history.

### 🎮 Gamification (`/api/gamification`)
*   `GET /api/gamification/status` - Sync experience, levels, daily login streaks, and check achievement completions.
*   `GET /api/gamification/leaderboard` - Fetch regional leaderboard rankings containing other users and active AI bots.

### 🛠️ Administration Panel (`/api/admin`)
*   `GET /api/admin/users` - Fetch lists of registered users.
*   `PUT /api/admin/users/:id/role` - Toggle user role between `User` and `Admin`.
*   `DELETE /api/admin/users/:id` - Delete user account (Admin only).
*   `GET /api/admin/stats` - Fetch global database usage metrics.
*   `GET /api/admin/backup` - Generate systemic task databases dump.
*   `POST /api/admin/restore` - Batch restore database states.

---

## 🚀 Installation & Local Setup

### Prerequisites
1.  **Node.js** (v16.x or higher)
2.  **MongoDB** (Local instance running on `mongodb://localhost:27017` or a MongoDB Atlas connection URI)
3.  **Groq API Key** (Obtain from [Groq Console](https://console.groq.com/))
4.  **Google Client ID** (Optional, for Google Auth setup)

### 1. Set Up the Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file inside the `backend` directory based on the variables below:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
    JWT_SECRET=your_jwt_secret_key_here
    GROQ_API_KEY=gsk_your_groq_api_key_here
    
    # Optional settings
    GOOGLE_CLIENT_ID=your_google_client_id_here
    # EMAIL_SERVICE=gmail
    # EMAIL_USER=your_email@gmail.com
    # EMAIL_PASS=your_email_app_password
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will start running at `http://localhost:5000`.

5.  *(Optional)* Seed dummy tasks to inspect full stats, level progression, and Recharts graph visualization in the dashboard:
    ```bash
    node seed_dummy_tasks.js
    ```
    *Note: Run this script after registering a user to populate that user's profile with historical task data.*

### 2. Set Up the Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory:
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
    ```
4.  Start the React application:
    ```bash
    npm start
    ```
    The application will open automatically in your browser at `http://localhost:3000`.

---

## 💬 Interaction Guide: SmartTask AI

The built-in chatbot parses your message context and translates instructions into MongoDB database queries. Here are example messages you can run:

*   **Create Task**: *"Create a task called Finish homework due tomorrow at 5 PM with High priority"*
*   **Update Task**: *"Mark the homework task as completed"* or *"Reschedule React task to Friday"*
*   **Search**: *"Do I have any pending tasks under the category Education?"*
*   **Delete Task**: *"Remove the database task"*
*   **Daily Planner**: *"Can you plan my day?"* or *"Plan my week"*
*   **Task Breakdown**: *"Break down the task Build REST API into smaller subtasks"*
*   **Estimate Duration**: *"How long will it take to build the CSS frontend page?"*
*   **Stats & Score**: *"What is my current productivity score and level?"*

---

## 🔒 License
This project is licensed under the MIT License.
