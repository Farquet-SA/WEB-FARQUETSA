import { describe, it, expect, beforeEach } from "vitest";
import { isTokenValid, isAuthed, getRole } from "./auth";
import { ACCESS_KEY, ADMIN_FLAG_KEY, ROLE_KEY } from "./tokens";

function makeToken(expOffsetSeconds) {
  const payload = { exp: Math.floor(Date.now() / 1000) + expOffsetSeconds };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.sig`;
}

beforeEach(() => {
  localStorage.clear();
});

describe("isTokenValid", () => {
  it("returns false when no token", () => {
    expect(isTokenValid()).toBe(false);
  });

  it("returns true for a valid (not expired) token", () => {
    localStorage.setItem(ACCESS_KEY, makeToken(60));
    expect(isTokenValid()).toBe(true);
  });

  it("returns false for an expired token", () => {
    localStorage.setItem(ACCESS_KEY, makeToken(-60));
    expect(isTokenValid()).toBe(false);
  });
});

describe("isAuthed", () => {
  it("returns false without token", () => {
    expect(isAuthed()).toBe(false);
  });

  it("returns false with valid token but no is_admin flag", () => {
    localStorage.setItem(ACCESS_KEY, makeToken(60));
    expect(isAuthed()).toBe(false);
  });

  it("returns true with valid token and is_admin flag", () => {
    localStorage.setItem(ACCESS_KEY, makeToken(60));
    localStorage.setItem(ADMIN_FLAG_KEY, "1");
    expect(isAuthed()).toBe(true);
  });
});

describe("getRole", () => {
  it("returns null when not set", () => {
    expect(getRole()).toBeNull();
  });

  it("returns stored role", () => {
    localStorage.setItem(ROLE_KEY, "superadmin");
    expect(getRole()).toBe("superadmin");
  });
});
