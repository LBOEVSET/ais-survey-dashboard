const scanner = require('sonarqube-scanner');

scanner(
{
    serverUrl: 'http://localhost:9000',
    token: 'c439b7b2853d7fa580ed774acfc6479a20f095b7',
    options: {
        'sonar.projectName': 'phantomlancer',
        'sonar.projectDescription': 'branch expansion system',
        'sonar.sources': 'src'
    }
},
    () => process.exit()
)
