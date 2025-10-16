import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsService } from '../utils/utils.services';

const databaseConfig = UtilsService.getDBConfig();

const SECTIONS = new Set(['master', 'profile', 'language', 'survey']);
const mongoImports = [];

for (const type of Object.keys(databaseConfig)) {
  if (!SECTIONS.has(type)) continue; 

  const list = databaseConfig[type];
  if (!Array.isArray(list)) continue;

  list.forEach((entry: any, index: number) => {
    const connName = `${type}_${index}`;
    const uri = entry?.mongoUrl;
    if (typeof uri !== 'string' || !uri) {
      throw new Error(`Missing mongoUrl for connection "${connName}"`);
    }

    mongoImports.push(
      MongooseModule.forRootAsync({
        connectionName: connName,
        useFactory: async () => ({
          uri,
          // optional mongoose opts:
          serverSelectionTimeoutMS: 10_000,
        }),
      }),
    );
  });
}

@Module({
  imports: mongoImports,
  exports: mongoImports,
})
export class UserRatingModule {}
