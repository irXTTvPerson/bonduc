import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const sendEmail = async (
  to: string,
  subject: string,
  body: string
): Promise<{ error: any }> => {
  let ses: SESClient = null;
  let error: any = null;

  try {
    ses = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    await ses.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: body
            }
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject
          }
        },
        Source: process.env.AWS_CONFIRMATION_EMAIL_FROM
      })
    );
  } catch (e) {
    error = e;
  } finally {
    ses?.destroy();
  }

  return {
    error: error
  };
};
