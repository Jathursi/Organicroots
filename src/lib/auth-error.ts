export function mapAuthServerError(error: unknown): { status: number; message: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("Environment variable not found") || errorMessage.includes("DATABASE_URL")) {
    return { status: 500, message: "Server config error: database environment variable is missing." };
  }

  if (errorMessage.includes("Can't reach database server") || errorMessage.includes("P1001")) {
    return { status: 503, message: "Database is unreachable from server environment." };
  }

  if (errorMessage.includes("does not exist") || errorMessage.includes("column") || errorMessage.includes("relation")) {
    return { status: 500, message: "Database schema is out of sync. Run prisma db push on production DB." };
  }

  return { status: 500, message: "Unexpected server error." };
}
