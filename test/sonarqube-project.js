const mod = require('sonarqube-scanner');
const sonarqubeScanner = mod.default || mod.scan || mod.scanner;

sonarqubeScanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN || "sqp_7c28c4ff682549e907d278614a54753c207dc737",
    options: {
        'sonar.projectKey': 'ais-survey-dashboard',
        'sonar.projectName': 'ais-survey-dashboard',
        'sonar.sources': 'src',
        'sonar.tests': 'src',
        'sonar.test.inclusions': '**/*.spec.ts,**/*.test.ts',
        'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
        'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',

        // Exclude files from coverage calc (adjust to taste)
        'sonar.coverage.exclusions': [
            '**/*.spec.ts',
            '**/*.test.ts',
            '**/*.module.ts',
            '**/main.ts',
            '**/*.dto.ts',
            '**/*.type.ts',
            '**/*.interface.ts',
            '**/index.ts',
            'src/common/**',
            'src/loggers/**',
            'src/prometheus/**',
            'src/utils/**',
            'src/database/**',
        ].join(','),
    },
  },
  () => process.exit()
);

