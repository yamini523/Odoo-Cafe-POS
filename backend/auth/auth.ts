import { Header, Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import jwt from "jsonwebtoken";

const jwtSecret = secret("JWTSecret");

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
  name: string;
}

export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const token = params.authorization?.replace("Bearer ", "");
  if (!token) throw APIError.unauthenticated("missing token");

  try {
    const payload = jwt.verify(token, jwtSecret()) as any;
    return {
      userID: String(payload.id),
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    throw APIError.unauthenticated("invalid token");
  }
});

export const gw = new Gateway({ authHandler: auth });
