import { Logger, Injectable } from "@nestjs/common";
import { validate, deleteUnrevealedBody } from "../lib/validate";
import { DBService } from "../db/db.service";
import { PostPodDto } from "./pod.dto";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { hash } from "../lib/hash";

@Injectable()
export class PodService {
  private readonly logger = new Logger("PodService");

  constructor(private readonly dbService: DBService) { }

  private async validatePostPod(data: PostPodDto) {
    if (data.pod_type !== "duplicate" && !data.body.body) {
      throw new Error("body.body not found");
    }

    const bodyJson: any = { body: data.body.body, media: data.body.media };
    if (data.read_more) {
      if (!data.body.additional_body) {
        throw new Error("additional body not found");
      }
      bodyJson["additional_body"] = data.body.additional_body;
    }

    switch (data.pod_type) {
      default: // pod
        break;

      case "quote":
        if (!(await this.dbService.prisma.pod.findUnique({ where: { id: data.body.quote_id } }))) {
          throw new Error("invalid quote id");
        }
        bodyJson["quote_id"] = data.body.quote_id;
        break;

      case "duplicate":
        if (
          !(await this.dbService.prisma.pod.findUnique({ where: { id: data.body.duplicate_id } }))
        ) {
          throw new Error("invalid duplicate id");
        }
        bodyJson["duplicate_id"] = data.body.duplicate_id;
        break;

      case "reply":
        if (!(await this.dbService.prisma.pod.findUnique({ where: { id: data.body.reply_id } }))) {
          throw new Error("invalid reply id");
        }
        bodyJson["reply_id"] = data.body.reply_id;
        break;

      case "encrypted": {
        if (!data.body.password) throw new Error("encrypted pod needs password");

        const algo = "aes-256-ccm";
        const key = Buffer.from(process.env.POD_CIPHER_KEY, "hex");

        const encrypt = (body: string) => {
          const iv = randomBytes(12);
          const cipher = createCipheriv(algo, key, iv, { authTagLength: 16 });

          let encrypted_body = cipher.update(body, "utf8", "hex");
          encrypted_body += cipher.final("hex");

          const authTag = cipher.getAuthTag().toString("hex");
          const password_info: any = {
            algo: algo,
            authTag: authTag,
            iv: iv.toString("hex"),
            password: hash(data.body.password)
          };
          return [encrypted_body, password_info];
        };

        [bodyJson.body, bodyJson["password_info"]] = encrypt(data.body.body);

        if (data.read_more) {
          if (!data.body.additional_body) {
            throw new Error("additional body not found");
          }
          [bodyJson.additional_body, bodyJson["additional_password_info"]] = encrypt(data.body.additional_body);
        }
        break;
      }

      case "partial":
        if (!data.body.unprintable_body) {
          throw new Error("unprintable body not found");
        }
        bodyJson["unprintable_body"] = data.body.unprintable_body;
        if (data.read_more) {
          if (!data.body.additional_body) {
            throw new Error("additional body not found");
          }
          bodyJson["unprintable_additional_body"] = data.body.unprintable_additional_body;
        }
        if (!data.body.show_partial_for) {
          throw new Error("show_partial for not found");
        }
        bodyJson["show_partial_for"] = data.body.show_partial_for;
        break;
    }
    return bodyJson;
  }

  async get(req: any, id: string) {
    let pod = null;
    try {
      pod = await this.dbService.prisma.pod.findUnique({
        where: { id: id },
        include: {
          account: {
            select: {
              identifier_name: true,
              screen_name: true,
              icon_uri: true,
              header_uri: true
            }
          }, media: true
        }
      });
      if (!pod) throw new Error("pod not found");
      if (pod.visibility !== "anyone") {
        await validate(req, this.dbService);
      }
      // TODO
      // フォロワーだったら第二引数をtrue
      pod = deleteUnrevealedBody(pod, false);
    } catch (e) {
      this.logger.error(e);
      return null;
    }
    return pod;
  }

  async decrypt(req: any, id: string, password: string) {
    let need_validate = false;
    let ret = null;
    try {
      const pod = await this.dbService.prisma.pod.findUnique({ where: { id: id } });
      if (!pod) {
        throw new Error("pod not found");
      }

      if (pod.visibility !== "anyone") {
        need_validate = true;
      }

      let body, additional_body;
      const json: any = pod.body;

      const decrypt = (password_info: any, body: any) => {
        if (hash(password) !== password_info.password) throw new Error("password unmatch");

        const iv = Buffer.from(password_info.iv, "hex");
        const key = Buffer.from(process.env.POD_CIPHER_KEY, "hex");
        const authTag = Buffer.from(password_info.authTag, "hex");

        const cipher = createDecipheriv(password_info.algo, key, iv, { authTagLength: 16 });
        cipher.setAuthTag(authTag);
        let decrypted_body = cipher.update(body, "hex", "utf8");
        decrypted_body += cipher.final("utf8");
        return decrypted_body;
      };

      body = decrypt(json.password_info, json.body);
      ret = { body: body };

      if (pod.read_more) {
        additional_body = decrypt(json.additional_password_info, json.additional_body);
        ret = { body: body, additional_body: additional_body };
      }
    } catch (e) {
      this.logger.error(e);
      return null;
    }

    if (need_validate) {
      await validate(req, this.dbService);
    }
    return ret;
  }

  async post(req: any, data: PostPodDto) {
    const account = await validate(req, this.dbService);
    try {
      const bodyJson = await this.validatePostPod(data);
      const create = async () => {
        const pod = await this.dbService.prisma.pod.create({
          data: {
            expire_at: data.expire_at,
            reveal_at: data.reveal_at,
            account_id: account.id,
            body: bodyJson,
            has_media: data.body.media ? data.body.media.length > 0 : false,
            nsfw: data.nsfw,
            read_more: data.read_more,
            root_thread_id: data.root_thread_id,
            visibility: data.visibility,
            timeline_type: data.timeline_type,
            pod_type: data.pod_type
          }
        });

        if (data.expire_at) {
          const expire = new Date(data.expire_at);
          const now = new Date();
          const timeout = expire.valueOf() - now.valueOf();
          setTimeout(async () => await this.dbService.prisma.pod.delete({ where: { id: pod.id } }), timeout);
        }
        return pod;
      }
      if (data.reveal_at) {
        const reveal = new Date(data.reveal_at);
        const now = new Date();
        const timeout = reveal.valueOf() - now.valueOf();
        setTimeout(async () => await create(), timeout);
        return {
          message: `create pod after ${timeout} msec`
        }
      }
      else {
        return await create();
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
