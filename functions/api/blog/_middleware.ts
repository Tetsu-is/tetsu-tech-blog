import React from "react";
import vercelOGPagesPlugin from "@cloudflare/pages-plugin-vercel-og";

interface Props {
  ogTitle: string;
}

export const onRequest = vercelOGPagesPlugin<Props>({
  imagePathSuffix: "/og-template.png",
  component: ({
    ogTitle,
    pathname,
  }: {
    ogTitle: string;
    pathname: string;
  }): React.ReactNode => {
    return React.createElement("div", null, ogTitle);
  },
  extractors: {
    on: {
      'meta[property="og:title"]': (props) => ({
        element(element: any) {
          // TODO: use type
          props.ogTitle = element.getAttribute("content");
        },
      }),
    },
  },
  autoInject: {
    openGraph: true,
  },
});
