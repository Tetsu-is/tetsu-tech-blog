export function onRequest(context) {
    id = context.params.id;
    return new Response(`Liked blog with id: ${id}`);
}