import { PermissionLevel } from './permission.enum';

declare global {
    namespace Express {
        export interface Request {
            user?: {
                id: number;
                name: string;
                email: string;
                permission: PermissionLevel;
            };
        }
    }
}