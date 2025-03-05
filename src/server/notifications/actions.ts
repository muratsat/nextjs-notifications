"use server";

import { env } from "@/env";
import { db } from "@/server/db";
import { pushSubscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  setVapidDetails,
  sendNotification,
  type PushSubscription as WebPushSubscription,
} from "web-push";

setVapidDetails(
  "mailto:2esengulov1@gmail.com",
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export async function subscribeUser(sub: WebPushSubscription) {
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  const [subRecord] = await db
    .insert(pushSubscriptions)
    .values({
      subscriptionJson: JSON.stringify(sub),
    })
    .returning();

  return subRecord
    ? { success: true, subscriptionId: subRecord.id }
    : { success: false, error: "Failed to subscribe user" };
}

export async function unsubscribeUser(subscriptionId: number) {
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.id, subscriptionId));

  return { success: true };
}

export async function sendPushNotification(message: string) {
  const allSubscriptions = await db.select().from(pushSubscriptions);

  try {
    await Promise.allSettled(
      allSubscriptions.map(async (sub) => {
        const subscription = JSON.parse(
          JSON.stringify(sub.subscriptionJson),
        ) as WebPushSubscription;
        await sendNotification(
          subscription,
          JSON.stringify({
            title: "Test Notification",
            body: message,
            icon: "/icon.png",
          }),
        );
      }),
    );

    // await sendNotification(
    //   subscription,
    //   JSON.stringify({
    //     title: "Test Notification",
    //     body: message,
    //     icon: "/icon.png",
    //   }),
    // );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
