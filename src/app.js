// Import required dependencies
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create Express application instance
const app = express();

// Configure CORS (Cross-Origin Resource Sharing) middleware
// Allows frontend applications to make requests to this API
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from specified origin only
    credentials: true, // Enable cookies and authentication headers
  })
);

// Configure JSON parsing middleware
// Parses incoming JSON requests with a size limit of 16kb
app.use(
  express.json({
    limit: "16kb",
  })
);

// Configure URL-encoded data parsing middleware
// Parses form data from HTML forms and URL-encoded requests
app.use(
  express.urlencoded({
    extended: true, // Allow parsing of nested objects
    limit: "16kb", // Limit request size to 16kb
  })
);

// Serve static files from the 'public' directory
// Files in 'public' folder will be accessible via direct URLs
app.use(express.static("public"));

// Parse cookies from incoming requests
// Makes cookies available in req.cookies object
app.use(cookieParser());

// ========================================
// ROUTE IMPORTS
// ========================================
// Import all route modules for different API endpoints
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

// ========================================
// API ROUTE DECLARATIONS
// ========================================
// Mount routers on specific URL patterns
// Note: Using app.use() with middleware pattern because controllers are in separate files
// When a request matches the base path, it gets forwarded to the respective router

// User management routes (authentication, profile, etc.)
app.use("/api/v1/users", userRouter);

// Video management routes (upload, view, delete, etc.)
app.use("/api/v1/videos", videoRouter);

// Subscription management routes (subscribe, unsubscribe, get subscribers)
app.use("/api/v1/subscriptions", subscriptionRouter);

// Tweet/Post management routes (create, update, delete tweets)
app.use("/api/v1/tweets", tweetRouter);

// Comment management routes (add, edit, delete comments)
app.use("/api/v1/comments", commentRouter);

// Like/Dislike management routes (like videos, comments, tweets)
app.use("/api/v1/likes", likeRouter);

// Dashboard and analytics routes (user stats, content metrics)
app.use("/api/v1/dashboard", dashboardRouter);

// Health check and system status routes
app.use("/api/v1/healthcheck", healthcheckRouter);

// Playlist management routes (create, manage playlists)
app.use("/api/v1/playlist", playlistRouter);

// Export the configured Express application
export { app };
