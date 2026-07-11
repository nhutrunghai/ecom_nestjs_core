export const PrismaErrorCode = {
UniqueConstraintFailed: 'P2002',
RecordNotFound: 'P2025',
ForeignKeyConstraintFailed: 'P2003',
} as const;
export type PrismaErrorCode = (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];

export function isPrismaErrorCode( error: unknown, code: PrismaErrorCode): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === code
    );
}