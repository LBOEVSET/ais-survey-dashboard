import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import * as yaml from 'js-yaml';
import { ApplicationConfig } from '../../assets/config/configuration';

export class UtilsService {

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
