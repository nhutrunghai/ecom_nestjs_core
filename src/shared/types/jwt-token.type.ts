export type JwtRegisteredPayload = {
  iat?: number;
  exp?: number;
  jti?: string;
};

export type TokenPayload = JwtRegisteredPayload & {
  sub: number;
};

export type RequestUser = TokenPayload;
