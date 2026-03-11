/**
 * Configuração do Elastic APM para a API Express.
 * Variáveis de ambiente têm precedência.
 * @see https://www.elastic.co/guide/en/apm/agent/nodejs/current/configuring-the-agent.html
 */
module.exports = {
    serviceName: process.env.ELASTIC_APM_SERVICE_NAME || 'api-pv',
    serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    apiKey: process.env.ELASTIC_APM_API_KEY,
    environment: process.env.NODE_ENV || 'development',
    active: process.env.ELASTIC_APM_ACTIVE !== 'false',
    captureBody: 'off',
    transactionSampleRate: 1.0,
    centralConfig: false,
};
