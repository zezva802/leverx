# Node.js Homework 1 – Zezva Kobaidze

## Description

This is my Node.js Homework 1 project for the Node.js Course 2025 Georgia.  
The application is a simple HTTP server with a health check endpoint, logging, environment variable configuration, and code quality setup using ESLint and Prettier.

---

## Features

- HTTP server implemented without frameworks
- `GET /health` endpoint returning project version
- Response headers include:
    - `Content-Type: application/json`
    - `X-Powered-By: Node.js`
    - `Cache-Control: no-store`
    - `Connection: keep-alive`
    - `Date: <current date/time>`
- Logging of requests and errors using Winston
- Environment configuration with `.env` file
- Code linting and formatting with ESLint and Prettier
- Pre-commit hook to enforce linting before commits using Husky

---

## Installation

1. Clone the repository:

git clone https://nodejs-course-2025-gitlab.codelx.dev/nodejs-courses-2025-georgia/zezva-kobaidze.git

2. Navigate to the project folder:

cd node-js

3. Install dependencies:

npm install

4. Create a .env file and set your PORT:

PORT=3000
