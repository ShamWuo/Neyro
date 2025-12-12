import { auth } from "@/auth";
import { MAX_ACTIVE_PROJECTS, projectHealth } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

const REVIEW_LOOKBACK_DAYS = 12;

export default function IntegrityPage() {
  redirect("/home");
}
