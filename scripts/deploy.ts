import { $ } from 'bun';

const remotePath = '/var/www/rizinos-web';

console.log(`Uploading build/ to ros:${remotePath} ...`);
await $`ssh ros "mkdir -p ${remotePath}"`;
await $`rsync -avz --delete ./build/ ros:${remotePath}`;

console.log('Deployment complete!');
