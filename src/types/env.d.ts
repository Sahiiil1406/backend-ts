declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    BASE_BACKEND_URL?: string;
    NODE_ENV?: "development" | "production" | "test";
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    JWT_REFRESH_SECRET?: string;
    ACCESS_TOKEN_EXPIRY?: string;
    NODEMAILER_EMAIL?: string;
    NODEMAILER_PASSWORD?: string;
    ENABLE_REQUEST_LOG?: "true" | "false";
    CLI_VERSION?: string;
  }
}
