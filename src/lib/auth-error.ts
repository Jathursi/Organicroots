export function mapAuthServerError(error: unknown): { status: number; message: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code;

  if (errorCode === "P1001" || errorMessage.includes("Can't reach database server")) {
    return { status: 503, message: "Database is unreachable. Check your network or Supabase status." };
  }

  if (errorCode === "P1008" || errorMessage.includes("timeout")) {
    return { status: 504, message: "Database connection timed out." };
  }

  if (
    errorCode === "P6001" ||
    errorMessage.includes("prisma://") ||
    errorMessage.includes("prisma+postgres://") ||
    errorMessage.includes("Error validating datasource")
  ) {
    return {
      status: 500,
      message: "Invalid datasource URL for current Prisma mode. In Vercel, set DIRECT_URL/DATABASE_URL to valid PostgreSQL URLs.",
    };
  }

  if (
    errorCode === "P2021" ||
    errorCode === "P2022" ||
    errorMessage.includes("does not exist") ||
    errorMessage.includes("column") ||
    errorMessage.includes("relation") ||
    errorMessage.includes("table")
  ) {
    return { status: 500, message: "Database schema mismatch. Run 'npx prisma db push' to sync your database." };
  }

  if (errorMessage.includes("PrismaClientInitializationError") || errorMessage.includes("Invalid datasource")) {
    return { status: 500, message: "Prisma failed to initialize. Check if DATABASE_URL is correctly set in Vercel." };
  }

  if (errorMessage.includes("Environment variable not found") || errorMessage.includes("DATABASE_URL")) {
    return { status: 500, message: "Server config error: missing DATABASE_URL." };
  }

  if (errorMessage.includes("MaxClientsInSession") || errorMessage.includes("FATAL: remaining connection slots")) {
    return { status: 503, message: "Database connection limit reached. Please use the Supabase Transaction Pooler (port 6543) in your Vercel settings." };
  }

  if (errorMessage.includes("prepared statement") || errorMessage.includes("connection")) {
    return { status: 503, message: "Database connection failed. Verify your connection strings in Vercel settings." };
  }

  console.error("[CRITICAL: Unmapped Error]", error);
  return {
    status: 500,
    message: `Internal server error: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? "..." : ""}`
  };
}
