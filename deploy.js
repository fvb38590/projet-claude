const FtpDeploy = require('ftp-deploy');
const https = require('https');
const http = require('http');

const config = {
    host: 'ftp.cluster121.hosting.ovh.net',
    port: 21,
    user: 'vazboll',
    password: 'Raquelisa38!!',
    localRoot: __dirname + '/',
    remoteRoot: 'www/',
    include: ['index.html', 'public/audits/*'],
    exclude: ['.git', 'node_modules', '*.md', 'blueprints/**', '*.json', '*.py', '*.sh'],
    deleteRemoteAll: false,
    forcePasv: false,
    retries: 2,
    timeout: 30000
};

const deploy = new FtpDeploy();

deploy.on('uploading', function(data) {
    console.log('Upload:', data.filename);
});

deploy.on('uploaded', function(data) {
    console.log('Uploaded:', data.filename);
});

deploy.on('done', function() {
    console.log('Transfert termine.');
    
    const url = 'https://vazbolotaconsulting.fr';
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log('Succes ! Ta page est en ligne sur', url);
        } else {
            console.log('Erreur HTTP:', res.statusCode);
        }
        process.exit(0);
    }).on('error', (err) => {
        console.log('Erreur de connexion:', err.message);
        process.exit(1);
    });
});

deploy.on('error', function(err) {
    console.log('Erreur FTP:', err);
    process.exit(1);
});

console.log('Deploiement vers OVH...');
deploy.deploy(config).catch(err => {
    console.log('Erreur:', err);
    process.exit(1);
});
