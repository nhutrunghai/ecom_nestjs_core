import { SetMetadata } from '@nestjs/common';
import type { RoleNameType } from '../constants/role.constants';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleNameType[]) =>
  SetMetadata(ROLES_KEY, roles);
