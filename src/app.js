import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// routes declaration
// app.get not worked here because : app and controller in same file here router and controller in different files so, we need to use middleware
app.use("/api/v1/users", userRouter); // here after if URL contains `/api/v1/users` then route goes to user.routes and here we have different route based on that we redirect the user like if after `/api/v1/users/regiter` we run regiter controller
app.use("/api/v1/videos", videoRouter); // Assuming you have a videoRouter for video-related routes
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
export { app };
