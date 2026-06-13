import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "New User";

    await prisma.user.create({
      data: {
        clerkId: id,
        email: email || `${id}@placeholder.com`,
        name,
        profileImage: image_url,
        role: "SALES", // Default role
        status: "ACTIVE",
      },
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ");

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: id },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          ...(email && { email }),
          ...(name && { name }),
          ...(image_url && { profileImage: image_url }),
        },
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
      });
      if (existingUser) {
        await prisma.user.update({
          where: { clerkId: id },
          data: { status: "INACTIVE" },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
