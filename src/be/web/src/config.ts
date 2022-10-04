export const Config = {
  isLocalEnv: process.env.BONDUC_ENV === "local",
  isDevEnv: process.env.BONDUC_ENV === "dev",
  isStageEnv: process.env.BONDUC_ENV === "stage",
  isProdEnv: process.env.BONDUC_ENV === "prod",

  feEndpoint: process.env.FE_WEB_URL,

  aws: {
    region: process.env.AWS_REGION,
    confirmationEmailFrom: process.env.AWS_CONFIRMATION_EMAIL_FROM,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};
