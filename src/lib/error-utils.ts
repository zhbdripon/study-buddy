import { auth } from "@/lib/auth";
import { User } from "better-auth";
import { DrizzleError } from "drizzle-orm";
import { headers } from "next/headers";

export type AuthError = {
  type: "no-user";
};

export type PermissionError = {
  type: "no-permission";
};

export type DBError = {
  type: "orm-error";
  error: DrizzleError;
};

export type UnknownError = {
  type: "unknown-error";
  error: unknown;
};

export type GenericError = AuthError | PermissionError | DBError | UnknownError;

export type DataAccessError =
  | AuthError
  | PermissionError
  | DBError
  | UnknownError;

export type GenericSuccess<T> = {
  success: true;
  data: T;
};

export type GenericFailed = {
  success: false;
  error: GenericError;
};

export type GenericResult<T> = GenericSuccess<T> | GenericFailed;

export class ThrowableDataAccessLayerError extends Error {
  dalError: DataAccessError;
  constructor(error: DataAccessError) {
    super("Data access layer error");
    this.dalError = error;
  }
}

export function createErrorReturn(e: DataAccessError): GenericFailed {
  return {
    success: false,
    error: e,
  };
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
): Promise<GenericResult<T>> {
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
  operation: (user: User) => Promise<GenericResult<T>>,
): Promise<GenericResult<T>> {
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

function getErrorMessage(error: GenericError): string {
  if (error.type === "no-user") {
    return "User not found";
  }

  if (error.type === "no-permission") {
    return "No permission";
  }

  if (error.type === "orm-error") {
    return "Data access error";
  }

  console.error("Unknown error", error.error);
  return "Something went wrong";
}

export function getDataOrThrow<T>(result: GenericResult<T>): T | never {
  if (result.success) return result.data as T;

  throw new Error(getErrorMessage(result.error));
}
