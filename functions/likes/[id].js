

// export interface Env {
//   // If you set another name in wrangler.toml as the value for 'binding',
//   // replace "DB" with the variable name you defined.
//   DB: D1Database;
// }


const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
}

export const onRequest = async (context) => {
    const id = context.params.id
    const q = "UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?"
    const result  = await context.env.DB.prepare(q)
        .bind(id)
        .run()

    return new Response(JSON.stringify(result), {
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        }
    })
}