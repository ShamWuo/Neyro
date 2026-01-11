import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const startTime = Date.now();

        // 1. Check Env Var
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({
                status: "error",
                message: "DATABASE_URL environment variable is MISSING"
            }, { status: 500 });
        }

        // 2. Test Connection
        await prisma.$connect();

        // 3. Test Simple Query
        const userCount = await prisma.user.count();

        const duration = Date.now() - startTime;

        return NextResponse.json({
            status: "success",
            message: "Database connection successful",
            data: {
                userCount,
                duration: `${duration}ms`,
                databaseUrlConfigured: true
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("DB Connection Test Failed:", error);
        return NextResponse.json({
            status: "error",
            message: error.message || "Unknown Database Error",
            stack: error.stack,
            name: error.name,
            code: error.code, // Prisma error code
            meta: error.meta // Prisma error metadata
        }, { status: 500 });
    }
}
