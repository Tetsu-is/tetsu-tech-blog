import { onRequest as __likes__id__ts_onRequest } from "/Users/tetsuro/dev/techblog/tetsu-tech-blog/functions/likes/[id].ts"

export const routes = [
    {
      routePath: "/likes/:id",
      mountPath: "/likes",
      method: "",
      middlewares: [],
      modules: [__likes__id__ts_onRequest],
    },
  ]