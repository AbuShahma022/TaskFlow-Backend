import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import httpStatus from "http-status";
import config from "./config";
import router from "./routes";
import globalErrorHandler from "./middleware/globalErrorHandlers";

const app = express();
app.use(helmet());

app.use(
	cors({
		origin: config.appUrl,
		credentials: true,
	}),
);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 Minutes
	max: 100,
	message: "Too many requests. Please try again later.",
});

app.use(limiter);
//here payment gateway

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
	res.status(200).send({
		success: true,
		version: "1.0.0",
		message: "Welcome to the TaskFlow Backend Server!",
		timestamp: new Date().toISOString(),
		uptime: `${process.uptime().toFixed(2)} seconds`,
	});
});

app.use("/api/v1", router);
app.use((req, res) => {
	res.status(httpStatus.NOT_FOUND).json({
		success: false,
		message: "Route Not Found",
	});
});

app.use(globalErrorHandler);

export default app;
