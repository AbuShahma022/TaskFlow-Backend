import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";

const validateZodSchema =
	(zodSchema: ZodObject) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			// Handle multipart/form-data JSON string
			if (req.body?.data) {
				req.body = JSON.parse(req.body.data);
			}

			// Validate
			const parsed = await zodSchema.parseAsync({
				body: req.body,
				cookies: req.cookies,
				params: req.params,
				query: req.query,
			});

			// ✅ Flatten back to Express shape
			if (parsed.body) req.body = parsed.body;
			if (parsed.cookies) req.cookies = parsed.cookies;
			

			next();
		} catch (error) {
			next(error);
		}
	};

export default validateZodSchema;
