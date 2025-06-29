const config = {
  schema: "./src/lib/db/schema/**/*.{ts,js}",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./sqlite.db",
  },
};

export default config as any; 