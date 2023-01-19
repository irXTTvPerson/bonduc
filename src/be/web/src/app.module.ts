import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { PodResolver } from "./pod/pod.resolver";
import { AccountResolver } from "./account/account.resolver";
import { FollowRequestResolver } from "./follow/followRequest.resolver";
import { NotificationResolver } from "./notification/notification.resolver";
import { FollowResolver } from "./follow/follow.resolver";
import { FavoriteResolver } from "./favorite/favorite.resolver";
import { HTLResolver } from "./timeline/htl.resolver";
import { DpResolver } from "./pod/dp.resolver";
import { QpResolver } from "./pod/qp.resolver";
import { ReplyResolver } from "./pod/reply.resolver";
import { PodCommonResolver } from "./pod/common.resolver";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: process.env.BONDUC_ENV === "local" ? true : false,
      playground: process.env.BONDUC_ENV === "local" ? true : false,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
      }
    })
  ],
  providers: [
    PodResolver,
    DpResolver,
    QpResolver,
    ReplyResolver,
    AccountResolver,
    FollowRequestResolver,
    FollowResolver,
    NotificationResolver,
    FavoriteResolver,
    HTLResolver,
    PodCommonResolver
  ]
})
export class AppModule {}
