import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PodModule } from "./pod/pod.module";
import { AuthModule } from "./auth/auth.module";
import { ATLModule } from "./atl/atl.module";
@Module({
  imports: [AuthModule, PodModule, ConfigModule.forRoot(), ATLModule],
  providers: []
})
export class AppModule {}
