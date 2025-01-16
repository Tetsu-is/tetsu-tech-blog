export function onRequest(context) {
    try {
        id = context.pathParameters.id;
        return new Response(`Liked blog with id: ${id}`);
    }
    catch (e) {
        return new Response("Invalid request");
    }
}