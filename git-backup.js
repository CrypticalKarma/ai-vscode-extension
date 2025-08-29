const { execSync } = require('child_process');

try {
  // Stage all changes
  execSync('git add .', { stdio: 'inherit' });

  // Commit with a default message
  execSync('git commit -m "Backup"', { stdio: 'inherit' });

  // Push to the remote
  execSync('git push', { stdio: 'inherit' });

  console.log('\n✅ Project backed up successfully!');
} catch (error) {
  console.error('\n⚠️ Git backup failed:', error.message);
}
