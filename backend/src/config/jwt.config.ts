export const jwtConfig = {
  secret: process.env.JWT_SECRET || "replace_this_secret",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

