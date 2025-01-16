export function onRequest(context) {
    // check which number of the blog is being liked
    const id = context.params.id
    return new Response("Like!: " + id)
}