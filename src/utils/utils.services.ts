import { join } from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { ConfigModule } from '@nestjs/config';
import { ApplicationConfig } from '../../assets/config/configuration';

export class UtilsService {
    
    constructor() { }
    
    static getDBConfig() {
        let databaseConfig = ApplicationConfig.databaseConfig;
        
        return databaseConfig;
    }

    static getAppConfig() {
        let config = yaml.load(
                readFileSync(
                    join(process.cwd(), 'assets', 'config', `${ApplicationConfig.environment.zone}.config.yaml`),
                    'utf8',
                ),
            ) as Record<string, any>;

        return config.app;
    }
}
