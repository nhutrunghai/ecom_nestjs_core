export type JwtRegisteredPayload = {
  iat?: number;
  exp?: number;
  jti?: string;
};

export type AccessTokenPayload = JwtRegisteredPayload & {
  sub: number;
  roleId: number;
  deviceId: number;
};

export type RefreshTokenPayload = JwtRegisteredPayload & {
  sub: number;
};

export type RequestUser = AccessTokenPayload;
