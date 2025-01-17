import { type D1Database, type PagesFunction } from "@cloudflare/workers-types";

export interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "DB" with the variable name you defined.
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const id = context.params.id
    const q = "UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?"
    const result  = await context.env.DB.prepare(q)
        .bind(id)
        .run()

    return Response.json(result)
}