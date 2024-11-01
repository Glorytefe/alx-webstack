# Blog API Platform

## Overview
The Blog API Platform is a RESTful API designed for managing blog posts, comments, and users. It allows users to create, read, update, and delete blog posts and comments, providing a flexible and scalable solution for blogging applications.

## Features
- **User Authentication**: Secure user registration and login with JSON Web Tokens (JWT).
- **Post Management**: Create, read, update, and delete blog posts.
- **Comment Management**: Add, read, and delete comments on blog posts.
- **Unique Email Validation**: Ensure user emails are unique to avoid duplicates.
- **Robust Error Handling**: Comprehensive error messages for different scenarios.
- **Environment Configuration**: Configurable environment settings using `.env` files.

## Technologies Used
- **Node.js**: JavaScript runtime for building the API.
- **Express**: Web framework for building the API server.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT**: Token-based authentication.
- **Jest**: Testing framework for unit and integration testing.
- **Supertest**: HTTP assertion library for testing API endpoints.

## Getting Started
### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (either locally or via a cloud provider)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/your-username/blog-api-platform.git
   cd blog-api-platform
   ```
2. Install Dependencies:
    ```
       npm install
    ```
3. Create your own env from .env.example
    ```
      cp .env.example .env
    ```
4. Run application:
    ```
      npm run dev
    ```


### Documentation can be found at:

```{PORT}/api-docs/```

### Contributing

