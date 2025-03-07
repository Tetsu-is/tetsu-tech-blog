import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

// cors
app.use(
	"*",
	cors({
		origin: ["http://localhost:4321"],
		allowMethods: ["POST", "GET", "OPTIONS"],
	}),
);

app.post("/likes/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const q = "UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?";
		const result = await c.env.DB.prepare(q).bind(id).run();

		if (!result.success) {
			return c.json(
				{
					success: false,
					errors: {
						issues: [
							{
								code: "database_error",
								message: "Failed to update likes count.",
							},
						],
						name: "DatabaseError",
					},
				},
				400,
			);
		}

		return c.json({ success: true, id, result });
	} catch (error) {
		return c.json(
			{
				success: false,
				errors: {
					issues: [
						{
							code: "database_error",
							message: "Failed to process the request.",
						},
					],
					name: "DatabaseError",
				},
			},
			400,
		);
	}
});

app.get("/likes/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const q = "SELECT likes_count FROM blogs WHERE id = ?";
		const result = await c.env.DB.prepare(q).bind(id).first();

		if (!result) {
			return c.json(
				{
					success: false,
					errors: {
						issues: [
							{
								code: "not_found",
								message: "Blog post not found.",
							},
						],
						name: "NotFound",
					},
				},
				404,
			);
		}

		return c.json({ success: true, id, result });
	} catch (error) {
		return c.json(
			{
				success: false,
				errors: {
					issues: [
						{
							code: "database_error",
							message: "Failed to fetch likes count.",
						},
					],
					name: "DatabaseError",
				},
			},
			400,
		);
	}
});

/**
 * Not found handler
 */
app.get("*", (c) => {
	return c.json(
		{
			success: false,
			errors: {
				issues: [
					{
						code: "not_found",
						message: "The requested resource was not found.",
					},
				],
				name: "NotFound",
			},
		},
		404,
	);
});

/**
 * Error handler
 */
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		// Get the custom response
		return err.getResponse();
	}
	console.error(err);
	return c.json(
		{
			success: false,
			errors: {
				issues: [
					{
						code: "internal_server_error",
						message: "An internal server error occurred.",
					},
				],
				name: "InternalServerError",
			},
		},
		500,
	);
});

export default app;
