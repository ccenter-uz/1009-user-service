import { seedRolePermissions } from './role-permissions.seed';

async function main() {
  seedRolePermissions();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding complete!');
  });
