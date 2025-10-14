# Chatify - Real-Time Chatting Application

A modern, full-stack chatting application that enables real-time messaging, media sharing, and interactive features like stories. Built with Node.js, Express, Socket.IO, and MongoDB for a seamless communication experience.

## Features

- **Real-Time Messaging**: Instant chat functionality powered by Socket.IO with support for multi-device connections.
- **User Authentication**: Secure login and registration using JWT and bcrypt for password hashing.
- **Media Sharing**: Upload and share images/videos via Cloudinary integration with Multer for file handling.
- **Stories**: Share temporary stories with media uploads and viewer tracking.
- **Online Status**: Real-time user presence indicators and online/offline status.
- **Typing Indicators**: Live typing notifications for active conversations.
- **Read Receipts**: Mark messages as read with delivery confirmations.
- **Email Notifications**: Automated email sending via Nodemailer and Resend for account-related updates.
- **Security**: Protected routes with CORS, input validation, and rate limiting via Arcjet.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.IO (server and client)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **File Uploads**: Multer, Cloudinary
- **Email Services**: Nodemailer, Resend
- **Security**: Arcjet for rate limiting and inspection
- **Utilities**: Cookie-parser, CORS, Validator, Express-async-handler

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd chatting-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RESEND_API_KEY=your_resend_api_key
   ARCJET_KEY=your_arcjet_key
   PORT=5000  # Optional, defaults to 5000
   ```

4. **Run the Application**:
   ```bash
   npm run dev  # Starts the server with nodemon for development
   ```

   The server will run on `http://localhost:5000`.

## Usage

- **API Endpoints**: Access chat routes at `/api/chat`, user routes at `/api/user`, story routes at `/api/story`, etc.
- **Socket.IO**: Connect via Socket.IO client for real-time events like messaging, typing indicators, and status updates.
- **File Uploads**: Use multipart/form-data for media uploads in stories and messages.

For detailed API documentation, refer to the inline comments in the source code or integrate tools like Swagger for interactive docs.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Contact

For questions or support, please reach out via [email] or create an issue in the repository.
