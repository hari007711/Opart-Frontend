// import { betterAuth } from "better-auth";
// import { Pool } from "pg";

// export const auth = betterAuth({
//   database: new Pool({
//     connectionString: process.env.DATABASE_URL,
//   }),
//   emailAndPassword: {
//     enabled: true,
//   },
// });

import { betterAuth } from "better-auth";
import { Pool } from "pg";

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log(
  "BETTER_AUTH_SECRET:",
  process.env.BETTER_AUTH_SECRET ? "SET" : "NOT SET"
);

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
});

// import { betterAuth } from "better-auth";
// import { Pool } from "pg";

// console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
// console.log(
//   "BETTER_AUTH_SECRET:",
//   process.env.BETTER_AUTH_SECRET ? "SET" : "NOT SET"
// );

// export const auth = betterAuth({
//   database: new Pool({
//     connectionString:
//       process.env.DATABASE_URL ||
//       "postgresql://neondb_owner:npg_HYxzT1yeKAW4@ep-winter-brook-adbessme-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
//     ssl:
//       process.env.NODE_ENV === "production"
//         ? { rejectUnauthorized: false }
//         : false,
//   }),
//   emailAndPassword: {
//     enabled: true,
//   },
//   secret: process.env.BETTER_AUTH_SECRET || "buGTgzPmKiQReFL5oWIgdFIBmOiuEVYI",
// });
