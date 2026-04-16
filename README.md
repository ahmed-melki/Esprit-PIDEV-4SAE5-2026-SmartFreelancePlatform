# SmartFreelance Platform

## Project Presentation
SmartFreelance Platform is a student project developed at **Esprit School of Engineering** as part of the **PIDEV 4SAE5 2025-2026** academic year.

The idea behind the project is simple: create one digital space where **clients** can publish opportunities and manage applicants, while **freelancers** can discover work, build their profile, improve their skills, and earn recognition through training and certification.

This project was designed not only as a classic freelance platform, but also as a more complete learning and engagement experience. Instead of stopping at job posting and applications, the platform also includes training, certifications, reviews, achievement titles, communication tools, and supporting modules for marketing and events.

## What The Platform Lets Users Do

### For clients
- Publish jobs and projects
- Review applicants
- Create quizzes linked to offers
- Manage dashboard information

### For freelancers
- Explore jobs and projects
- Apply to opportunities
- Take quizzes
- Access training and certification features
- Collect titles and visible achievements

### For the overall platform
- Provide blog, events, communication, FAQ, and moderation spaces
- Offer a more interactive and complete user experience than a basic freelance marketplace

## What I Implemented
One of the main parts I focused on is the **Training & Certification** area of the platform.

I implemented and organized:
- Training management
- Certification management
- Review management for trainings
- Title and reward management linked to completed learning progress
- Frontend pages for trainings, certifications, and titles
- Backend APIs to support these features
- Unit tests on important frontend behaviors

## Microservice Upgrade
To improve the architecture and make the project more scalable, I separated the **Training & Certification** module into its own microservice.

This means the project now includes:
- `discovery-service` for service registration
- `api-gateway` for centralized access
- `Back` for the remaining backend features
- `training-certification-service` dedicated only to the learning module

This change makes the project cleaner and better structured for a microservice-based architecture, while keeping the user experience the same from the frontend side.

## Learning Module Highlights
The learning module now allows the platform to support:
- Creating and managing trainings
- Managing certifications linked to trainings
- Reviewing trainings
- Unlocking titles based on user progress
- Showing visible progression and achievement for users

In other words, the platform does not only connect people to freelance work. It also encourages growth, progression, and user motivation.

## Why This Project Stands Out
What makes this project more interesting than a standard student CRUD application is that it combines several ideas in one platform:
- freelancing
- learning
- recognition
- communication
- engagement

The goal was to create something that feels closer to a real digital platform, where users are not only performing tasks, but also evolving inside the system.

## Project Structure
- `Front` : Angular frontend
- `Back` : main backend service
- `training-certification-service` : dedicated microservice for training, certification, reviews, and titles
- `api-gateway` : gateway used by the frontend to access backend services
- `discovery-service` : Eureka service registry

## How To Run The Project
Start the services in this order:

1. `discovery-service`
2. `api-gateway`
3. `Back`
4. `training-certification-service`
5. `Front`

## Academic Context
- School: **Esprit School of Engineering**
- Program: **PIDEV - 4SAE5**
- Academic Year: **2025-2026**

## Author Note
This repository represents the latest version of my project work, including the microservice separation of the Training & Certification module and the improvements made around that learning experience.
