export type ChannelProject = {
  title: string;
  url: string;
  /** Path to pre-captured 1024×768 screenshot; empty = static/Channel closed */
  screenshot?: string;
  /** Vertical shift of screenshot crop (0–1). Positive = shift content down on TV. */
  screenshotOffsetY?: number;
  /** Extra shift down via draw position (0–1, proportion of canvas height). Use when offsetY is at limit. */
  screenshotDrawOffsetY?: number;
};

export const TV_CHANNELS: ChannelProject[] = [
  {
    title: "TutorFlow",
    url: "https://www.tutorflow.co.za",
    screenshot: "/images/projects/tutorflow.png",
    screenshotOffsetY: 0.08,
    screenshotDrawOffsetY: 0.06,
  },
  {
    title: "EthixFlow",
    url: "https://gregarious-ganache-64ee20.netlify.app/",
    screenshot: "/images/projects/ethixflow.png",
  },
  { title: "Channel closed", url: "" },
];
