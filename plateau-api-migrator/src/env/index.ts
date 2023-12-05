import { config } from "dotenv";

config();

export type Environment = NodeJS.ProcessEnv & {
  PLATEAI_SIDEBAR_API: string;
  PLATEAI_SIDEBAR_API_TOKEN: string;
  PLATEAU_DATACATALOG_API_VIEW2: string;
  PLATEAU_API_PROJECT_NAME_VIEW2: string;
  PLATEAU_API_PROJECT_NAME_VIEW3: string;
};

export const env = (): Environment => {
  return process.env as Environment;
};
