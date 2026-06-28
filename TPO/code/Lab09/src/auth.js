export class AuthorizationError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export function getBearerToken(headers = {}) {
  const header = headers.authorization || headers.Authorization;

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

export function requireUserRole(user, allowedRoles) {
  if (!allowedRoles.includes(user?.role)) {
    throw new AuthorizationError(403, "Forbidden");
  }

  return true;
}
