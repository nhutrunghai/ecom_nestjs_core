const RoleName = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  SELLER: 'SELLER',
} as const;

type RoleNameType = (typeof RoleName)[keyof typeof RoleName];

export { RoleName };
export type { RoleNameType };
