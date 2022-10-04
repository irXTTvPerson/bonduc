import { Injectable } from "@nestjs/common";
import { Config } from "../config";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

@Injectable()
export class EmailService {
  async send(to: string, subject: string, body: string): Promise<{ error: any }> {
    let ses: SESClient = null;
    let error: any = null;

    try {
      ses = new SESClient({
        region: Config.aws.region,
        credentials: {
          accessKeyId: Config.aws.accessKeyId,
          secretAccessKey: Config.aws.secretAccessKey
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
          Source: Config.aws.confirmationEmailFrom
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
  }
}
