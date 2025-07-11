import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials : true
}));

app.use(express.json({
        limit: "16kb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

app.use(express.static("public"));

app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'



// routes declaration
// app.get not worked here because : app and controller in same file here router and controller in different files so, we need to use middleware
app.use("/api/v1/users", userRouter);  // here after if URL contains `/api/v1/users` then route goes to user.routes and here we have different route based on that we redirect the user like if after `/api/v1/users/regiter` we run regiter controller


export {app};