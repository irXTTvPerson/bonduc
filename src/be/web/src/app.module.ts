import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Config } from "./config";
import { PodResolver } from "./pod/pod.resolver";
import { AccountResolver } from "./account/account.resolver";
import { FollowRequestResolver } from "./follow/followRequest.resolver";
import { NotificationResolver } from "./notification/notification.resolver";
import { FollowResolver } from "./follow/follow.resolver";
import { FavoriteResolver } from "./favorite/favorite.resolver";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: Config.isLocalEnv ? true : false,
      playground: Config.isLocalEnv ? true : false,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      cors: {
        origin: Config.corsOrigin,
        credentials: true
      }
    })
  ],
  providers: [
    PodResolver,
    AccountResolver,
    FollowRequestResolver,
    FollowResolver,
    NotificationResolver,
    FavoriteResolver
  ]
})
export class AppModule {}
