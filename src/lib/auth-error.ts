export function mapAuthServerError(error: unknown): { status: number; message: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("Environment variable not found") || errorMessage.includes("DATABASE_URL")) {
    return { status: 500, message: "Server config error: database environment variable is missing." };
  }

  if (errorMessage.includes("Can't reach database server") || errorMessage.includes("P1001")) {
    return { status: 503, message: "Database is unreachable from server environment." };
  }

  if (
    errorMessage.includes("P2021") ||
    errorMessage.includes("P2022") ||
    errorMessage.includes("does not exist") ||
    errorMessage.includes("column") ||
    errorMessage.includes("relation") ||
    errorMessage.includes("table")
  ) {
    return { status: 500, message: "Database schema is out of sync. Run prisma db push on production DB." };
  }

  if (errorMessage.includes("prepared statement") || errorMessage.includes("connection")) {
    return { status: 503, message: "Database connection issue on server. Verify DIRECT_URL and DATABASE_URL in Vercel." };
  }

  return { status: 500, message: "Unexpected server error." };
}
