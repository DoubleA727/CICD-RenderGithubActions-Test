const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Setting environment to test');

  console.log('Resetting test DB...');
  execSync('dotenv -e .env.test -- npx prisma migrate reset --force', { stdio: 'inherit' });

  console.log('Seeding test DB...');
  execSync('npm run init', { stdio: 'inherit' });
};
