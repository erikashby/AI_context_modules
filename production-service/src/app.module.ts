import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
import { McpModule } from './mcp/mcp.module';
import { FilesModule } from './files/files.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '.env.local'],
    }),
    // Database module commented out for deployment testing without PostgreSQL
    // DatabaseModule,
    AuthModule,
    // UsersModule commented out for now since it depends on database
    // UsersModule,
    McpModule, // Add MCP module for Work Item 2 testing
    FilesModule, // Add Files module for Work Item 3 - File storage
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
