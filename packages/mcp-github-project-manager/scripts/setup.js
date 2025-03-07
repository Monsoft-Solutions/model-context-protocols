#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log('GitHub Project Manager Setup');
console.log('============================');
console.log(
    'This script will help you set up your GitHub token for the GitHub Project Manager.',
);
console.log(
    'You can create a personal access token at https://github.com/settings/tokens',
);
console.log('The token needs the following scopes: repo, admin:org, project');
console.log('');

rl.question('Enter your GitHub token: ', (token) => {
    if (!token) {
        console.error('Error: GitHub token is required.');
        rl.close();
        process.exit(1);
    }

    // Create .env file with the token
    const envContent = `GITHUB_TOKEN=${token}\n`;
    fs.writeFileSync(envPath, envContent);

    console.log('\nGitHub token saved to .env file.');
    console.log('You can also set the token as an environment variable:');
    console.log(`export GITHUB_TOKEN=${token}`);
    console.log('\nSetup complete!');

    rl.close();
});
