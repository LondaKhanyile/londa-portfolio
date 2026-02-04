export type ChannelProject = {
  title: string;
  url: string;
  /** Path to pre-captured 1024×768 screenshot; empty = static/Channel closed */
  screenshot?: string;
};

export const TV_CHANNELS: ChannelProject[] = [
  {
    title: "TutorFlow",
    url: "https://www.tutorflow.co.za",
    screenshot: "/images/projects/tutorflow.png",
  },
  {
    title: "EthixFlow",
    url: "https://gregarious-ganache-64ee20.netlify.app/",
    screenshot: "/images/projects/ethixflow.png",
  },
  { title: "Channel closed", url: "" },
];
