import { SetMetadata } from '@nestjs/common';

export const CHECK_PERMISSION_KEY = 'check_permission';

export const CheckPermission = () => SetMetadata(CHECK_PERMISSION_KEY, true);
