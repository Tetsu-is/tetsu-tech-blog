export function onRequest(context) {
    try {
        id = context.params.id;
        return new Response(`Liked blog with id: ${id}`);
    }
    catch (e) {
        currentParams = context.params;
        return new Response("Invalid request this is params: " + JSON.stringify(currentParams));
    }
}