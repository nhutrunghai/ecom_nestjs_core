import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { RoleName } from "src/shared/constants/role.constants";

@Injectable()
export class RoleService {
    private ClientRoleId : number | null = null;
    constructor(private readonly prismaService: PrismaService) {}
    async getClientId(): Promise<number> {
        if (this.ClientRoleId) {
            return this.ClientRoleId;
        }
        const client = await this.prismaService.role.findUniqueOrThrow({
            where: { name: RoleName.USER },
        });
        this.ClientRoleId = client.id;
        return this.ClientRoleId;
    }
}