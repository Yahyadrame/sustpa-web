import { type NextRequest } from "next/server";
import { proxyRequest } from "@/app/proxy";

/**
 * Catch-all route handler — intercepte toutes les requêtes /api/*
 * et les délègue au proxy NestJS.
 */
export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}
