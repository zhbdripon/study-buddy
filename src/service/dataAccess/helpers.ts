import { auth } from "@/lib/auth";
import { User } from "better-auth";
import { DrizzleError } from "drizzle-orm";
import { headers } from "next/headers";

export type DataAccessResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: DataAccessError;
    };

export type DataAccessError =
  | {
      type: "no-user";
    }
  | {
      type: "no-permission";
    }
  | {
      type: "orm-error";
      error: DrizzleError;
    }
  | {
      type: "unknown-error";
      error: unknown;
    };

export class ThrowableDataAccessLayerError extends Error {
  dalError: DataAccessError;
  constructor(error: DataAccessError) {
    super("Data access layer error");
    this.dalError = error;
  }
}

export function createErrorReturn(e: DataAccessError): DataAccessResult<never> {
  return {
    success: false,
    error: e,
  };
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
): Promise<DataAccessResult<T>> {
  try {
    const res = await operation();
    return {
      success: true,
      data: res,
    };
  } catch (e) {
    if (e instanceof ThrowableDataAccessLayerError) {
      return createErrorReturn(e.dalError);
    }

    if (e instanceof DrizzleError) {
      return createErrorReturn({
        type: "orm-error",
        error: e,
      });
    }

    return createErrorReturn({
      type: "unknown-error",
      error: e,
    });
  }
}

export async function withAuth<T>(
  operation: (user: User) => Promise<DataAccessResult<T>>,
): Promise<DataAccessResult<T>> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    return {
      success: false,
      error: {
        type: "no-user",
      },
    };
  }

  return await operation(session.user);
}

function getErrorMessage(error: DataAccessError): string {
  if (error.type === "no-user") {
    return "User not found";
  }

  if (error.type === "no-permission") {
    return "No permission";
  }

  if (error.type === "orm-error") {
    return "Data access error";
  }
  return "Something went wrong";
}

export function throwError<T>(result: DataAccessResult<T>): T | never {
  if (result.success) return result.data;

  throw new Error(getErrorMessage(result.error));
}
