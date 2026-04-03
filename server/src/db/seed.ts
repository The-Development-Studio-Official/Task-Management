import { db } from './db.js';
import { users } from './schema.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
  const username = 'superadmin@123';
  const email = 'superadmin@123';
  const plainPassword = 'admin@123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const [existingUser] = await db.select().from(users).where(eq(users.email, email));
  
  if (existingUser) {
    console.log('User already exists, updating password just in case...');
    await db.update(users).set({ passwordHash, role: 'superadmin' }).where(eq(users.id, existingUser.id));
  } else {
    console.log('Inserting user...');
    await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: 'superadmin'
    });
  }
  
  console.log('Seed completed!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
