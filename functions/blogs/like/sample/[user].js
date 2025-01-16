export function onRequest(context) {
  user = context.params.user;
  return new Response(`Liked blog with user: ${user}`);
}