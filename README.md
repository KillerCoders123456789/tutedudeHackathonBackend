# TuteDude Hackathon Backend

This repository contains the backend codebase developed for the **TuteDude Hackathon**. It includes essential server-side logic, routing, and APIs required to support the associated frontend application.

---

## 🚀 Features

* User registration and authentication
* Course management and content APIs
* Enrollment and progress tracking
* Secure and structured API endpoints
* MongoDB-based data persistence
* RESTful API design

---

## 🛠 Tech Stack

* **Node.js** with **Express.js**
* **MongoDB** with **Mongoose**
* **JWT** for authentication
* **bcryptjs** for password hashing
* **dotenv** for environment configuration

---

## 📦 Installation

1. **Clone the repo**

```bash
git clone https://github.com/KillerCoders123456789/tutedudeHackathonBackend.git
cd tutedudeHackathonBackend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**
   Create a `.env` file and add:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. **Run the server**

```bash
npm start
```

---

## 📬 API Overview

Endpoints include:

* `POST /api/users/register` — Register new users
* `POST /api/users/login` — Authenticate user
* `GET /api/courses` — Fetch all courses
* `POST /api/courses/enroll` — Enroll a student

Use tools like **Postman** or **Insomnia** to test APIs.

---

## 🙏 Acknowledgements

This backend was developed as part of a team project during the TuteDude Hackathon 2025.

---

> Maintained by Team KillerCoders — All rights reserved.
