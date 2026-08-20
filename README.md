# Resume Analyzer          
[![Live App](https://img.shields.io/badge/Live-App-brightgreen)](https://resume-analyser-kp0f.onrender.com/)




## Description

Resume Analyzer is a full-stack web application that analyzes resumes using Artificial Intelligence and provides meaningful insights such as skill extraction, resume evaluation, and improvement suggestions.

This project integrates **Google Gemini AI** for resume analysis and includes secure authentication features like email verification and password reset using **Brevo** and job suggestions using **Adzuna API**.



## Tech Stack
- Frontend: HTML, CSS, React.js  
- Backend: Spring Boot  
- Database: MySQL  




## Frontend & Backend Integration Notes

- The frontend UI is developed using **React**
- For deployment, the React application is **built and served by the Spring Boot backend** as static files
- The React production build files are placed inside the backend’s **static** directory

### Static & Template Files
- The `static` folder contains the **React production build files**
- The `templates` folder inside `static` is used to store **email templates**
  - Used for **email verification** and **password reset**




## Important Notes (Must Read)

- Only **Gemini AI** is configured in this project.  
To use another AI provider, update AI-related code in `appservice.java`.

- Email functionality works **only with Brevo API**.  
To use another mail provider, update mail-related code in `mailservice.java`.

- AI models evolve quickly.  
If the configured Gemini model is removed or replaced, update the model in `appservice.java`.




## Disclaimer
- This project is developed for learning and demonstration purposes
- AI analysis results may vary and should not be considered professional career advice
