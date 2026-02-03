export type ChannelProject = {
  title: string;
  url: string;
  /** Optional image for future screen display */
  image?: string;
};

export const TV_CHANNELS: ChannelProject[] = [
  { title: "TutorFlow", url: "https://www.tutorflow.co.za" },
  { title: "EthixFlow", url: "https://gregarious-ganache-64ee20.netlify.app/" },
  { title: "Channel closed", url: "" },
];
