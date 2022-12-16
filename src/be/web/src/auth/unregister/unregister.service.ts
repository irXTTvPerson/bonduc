import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { hash } from "../../lib/hash";
import { DBService } from "../../db/db.service";

export type DeleteRequest = {
  email: string;
  password: string;
  identifier_name: string;
};

export const isValidPost = (body: any): body is DeleteRequest =>
  "email" in body && "password" in body && "identifier_name" in body;

@Injectable()
export class UnregisterService {
  private readonly logger = new Logger("UnegisterService");

  constructor(private readonly dbService: DBService) {}

  async unregister(args: DeleteRequest) {
    args.password = hash(args.password);
    try {
      const account = await this.dbService.prisma.account.findUnique({
        where: { identifier_name: args.identifier_name }
      });
      if (!account) {
        this.logger.warn(`Unregister: account ${args.identifier_name} not found`);
        return 404;
      }
      if (account.password !== args.password) {
        this.logger.warn(`invalid password: db, ${account.password} vs input, ${args.password}`);
        return 400;
      }
      await this.dbService.prisma.account.delete({
        where: { identifier_name: args.identifier_name }
      });
    } catch (e) {
      this.logger.error(`Unregister: failed due to ${e}`);
      return 500;
    }
    this.logger.log(`account ${args.identifier_name} successfully deleted.`);
    return 204;
  }
}
