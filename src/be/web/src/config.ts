export const Config = {
  isLocalEnv: process.env.BONDUC_ENV === "local",
  isDevEnv: process.env.BONDUC_ENV === "dev",
  isStageEnv: process.env.BONDUC_ENV === "stage",
  isProdEnv: process.env.BONDUC_ENV === "prod",

  feEndpoint: process.env.NEXT_PUBLIC_FE_WEB_URL,
  corsOrigin: process.env.CORS_ORIGIN,

  aws: {
    region: process.env.AWS_REGION,
    confirmationEmailFrom: process.env.AWS_CONFIRMATION_EMAIL_FROM,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },

  crypto: {
    hashAlgo: "sha3-512",
    encoding: "hex"
  },

  cookie: {
    secret: process.env.COOKIE_SECRET_TOKEN,
    expireDate: 7,

    settings: {
      httpOnly: true,
      secure: true,
      signed: true
    }
  },

  limit: {
    pods: {
      find_at_once: 100
    },
    notification: {
      find_at_once: 100
    }
  },

  redis: {
    url: process.env.REDIS_SESSION_URL,
    expire: 60 * 60 * 24 * 7 // 7 days in [sec]
  }
};
