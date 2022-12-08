export const Config = {

  crypto: {
    hashAlgo: "sha3-512",
    encoding: "hex"
  },

  cookie: {
    expireDate: 7,

    settings: {
      httpOnly: true,
      secure: true,
      signed: true
    }
  },

  limit: {
    pods: {
      find_at_once: 20
    },
    notification: {
      find_at_once: 20
    },
    follow: {
      find_at_once: 20
    }
  },

  gql: {
    logging: true
  },

  redis: {
    expire: 60 * 60 * 24 * 7 // 7 days in [sec]
  },

  prisma: {
    pool: 4
  }
};
