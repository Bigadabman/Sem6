import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AuthorizationError, getBearerToken, requireUserRole } from "../src/auth.js";

describe("auth helpers", () => {
  it("extracts token from Bearer authorization header", () => {
    const token = getBearerToken({ authorization: "Bearer jwt-token" });

    assert.equal(token, "jwt-token");
  });

  it("returns null when authorization header is absent", () => {
    const token = getBearerToken({});

    assert.equal(token, null);
  });

  it("allows user with required role", () => {
    assert.equal(requireUserRole({ role: "admin" }, ["admin"]), true);
  });

  it("throws AuthorizationError when user role is not allowed", () => {
    assert.throws(
      () => requireUserRole({ role: "client" }, ["admin"]),
      (error) => error instanceof AuthorizationError && error.status === 403
    );
  });
});


