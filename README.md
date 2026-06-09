# YouthConnect

## Table of Contents
1. [Team Members](#team-members)
2. [Introduction](#introduction)
3. [Technology Choices](#technology-choices)
4. [Architecture](#architecture)
5. [Setup Instructions](#setup-instructions)
6. [Challenges](#challenges)
7. [Conclusion](#conclusion)

---

## Team Members

| Name | Role |
|------|------|
| Massine | Backend (Spring Boot, MySQL, Docker) |
| Ayoub | Frontend (HTML, CSS, JavaScript) |

---

## Introduction

YouthConnect is a social platform designed for young people to discover, create, join and share activities and events in their community. Users can publish activities, join others, and interact to build a community around shared interests.

The platform allows users to:
- Register and login securely
- Browse and search activities by category
- Create new activities with details like date, location and max participants
- Join or leave activities
- View their personal activity history on their profile

---

## Technology Choices

### Backend
- **Spring Boot (Java)** — chosen for its rapid development capabilities, built-in dependency injection, and seamless integration with JPA and Spring Security
- **Spring Data JPA / Hibernate** — simplifies database operations by mapping Java objects to database tables without writing raw SQL
- **Spring Security + BCrypt** — handles authentication and password encryption

### Frontend
- **HTML, CSS, JavaScript** — standard web technologies for building the user interface
- **Fetch API** — used for asynchronous communication with the backend REST API

### Database
- **MySQL** — relational database chosen for its reliability and compatibility with Spring Boot

### DevOps
- **Docker** — containerises the Spring Boot application for consistent deployment across any machine
- **Docker Compose** — orchestrates the backend and database containers together

---

## Architecture

### Overview
The application follows a classic 3-tier architecture:

### Backend Layered Architecture

### Database Schema

| Table | Description |
|-------|-------------|
| users | Stores user accounts with encrypted passwords and roles |
| categories | Activity categories (Sports, Music, Art, Tech, Outdoor, Other) |
| activities | Activities created by users, linked to a category and creator |
| participations | Records which users joined which activities |

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login |
| GET | /api/activities | Get all activities |
| POST | /api/activities | Create an activity |
| DELETE | /api/activities/{id} | Delete an activity |
| POST | /api/activities/{id}/join | Join an activity |
| DELETE | /api/activities/{id}/leave | Leave an activity |
| GET | /api/activities/created?email= | Get activities created by user |
| GET | /api/activities/joined?email= | Get activities joined by user |
| GET | /api/activities/{id}/count | Get participant count |
| GET | /api/categories | Get all categories |

### Port Management

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5500 | Python HTTP server serving HTML files |
| Spring Boot Backend | 8080 | REST API server |
| Local MySQL | 3306 | Local development database |
| Docker MySQL | 3307 | Containerised database (mapped to avoid conflict) |

### DevOps Architecture

**Containerisation** — The Spring Boot application is containerised using Docker. The Dockerfile packages the compiled JAR file into a Docker image based on Java 17.

**Orchestration** — Docker Compose orchestrates two services: the Spring Boot backend container and the MySQL database container. The backend depends on MySQL and they communicate through Docker's internal network.

**Infrastructure as Code** — The docker-compose.yml file defines the entire infrastructure including services, ports, environment variables, volumes and startup order. The init.sql file automatically seeds the database with categories on first startup.

---

## Setup Instructions

### Option 1 — Run with Docker (Recommended)

Requirements: Docker Desktop installed

```bash
# Clone the repository
git clone https://github.com/ENSIAS-MEH/development-platform-massine_ayoub.git

# Navigate to project folder
cd development-platform-massine_ayoub

# Build and start all containers
docker-compose up --build
```

The backend will be available at `http://localhost:8080`

To serve the frontend:
```bash
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500/login.html` in your browser.

### Option 2 — Run Locally

Requirements: Java 17, MySQL 8.0, Python

1. Create a MySQL database called `youthconnect`
2. Run `schema.sql` to create the tables
3. Insert categories:
```sql
INSERT INTO categories (id, name) VALUES
(1,'Sports'),(2,'Music'),(3,'Art'),(4,'Tech'),(5,'Outdoor'),(6,'Other');
```
4. Configure `application.properties` with your MySQL credentials
5. Run the Spring Boot application in Eclipse
6. Serve the frontend with `python -m http.server 5500`
7. Open `http://localhost:5500/login.html`

---

## Challenges

### 1. BCrypt Password Encryption
Configuring Spring Security with BCrypt required careful setup of the SecurityConfig class. We had to ensure passwords were encoded before saving and correctly compared during login using `passwordEncoder.matches()`.

### 2. ENUM Case Sensitivity
MySQL stored role values as lowercase (`user`, `admin`) while our Java enum expected uppercase (`USER`, `ADMIN`). This caused login failures until we fixed the ENUM definition in the database.

### 3. Docker Port Conflicts
Running MySQL locally on port 3306 conflicted with the Docker MySQL container. We resolved this by mapping the Docker container to port 3307 in docker-compose.yml.

### 4. Foreign Key Constraints
Deleting activities that had participations failed due to foreign key constraints. We resolved this by deleting all participations first before deleting the activity in the service layer.

### 5. CORS Configuration
The frontend on port 5500 was blocked from calling the backend on port 8080 due to browser CORS policy. We resolved this by adding `@CrossOrigin(origins = "*")` to all controllers.

---

## Conclusion

YouthConnect successfully demonstrates a complete full-stack web application with a clean separation between frontend and backend. The REST API architecture allows the frontend and backend to work independently, communicating only through well-defined endpoints.

The DevOps implementation using Docker and Docker Compose ensures the application is portable and can be deployed on any machine with a single command, following modern software development practices.

The project covers key concepts including layered architecture, RESTful API design, relational database design with foreign keys, password security with BCrypt, and containerisation with Docker.
