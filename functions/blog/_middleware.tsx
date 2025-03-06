import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";

interface Props {
  ogTitle: string;
}

export const onRequest = vercelOGPagesPlugin<Props>({
  imagePathSuffix: "og-image.png",
  component: ({ ogTitle, pathname }) => {
    const paths = pathname.split("/");
    console.log(paths);
    const slug = paths[paths.length - 1];
    console.log(slug);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundImage:
            'url("https://tetsu-tech-blog.pages.dev/og/template.png")',
        }}
      >
        <h1>{ogTitle}</h1>
      </div>
    );
  },
  extractors: {
    on: {
      'meta[property="og:title"]': (props) => ({
        element(element: any) {
          props.ogTitle = element.getAttribute("content");
        },
      }),
    },
  },
  autoInject: {
    openGraph: true,
  },
});
