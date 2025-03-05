"use client";

import { env } from "@/env";
import { useEffect, useState } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendPushNotification,
} from "@/server/notifications/actions";
import { type PushSubscription as WebPushSubscription } from "web-push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      void registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      ),
    });
    setSubscription(sub);
    const result = await subscribeUser(
      JSON.parse(JSON.stringify(sub.toJSON())) as WebPushSubscription,
    );

    if (result.subscriptionId) {
      localStorage.setItem("subscriptionId", result.subscriptionId.toString());
    }
  }
  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    const subId = parseInt(localStorage.getItem("subscriptionId") ?? "");
    if (isNaN(subId)) return;
    await unsubscribeUser(subId);
  }

  async function sendTestNotification() {
    if (subscription) {
      const result = await sendPushNotification(message);
      console.log(result);
      setMessage("");
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className="rounded-lg bg-gray-100 p-4 shadow-md">
      <h3 className="mb-2 text-lg font-semibold">Push Notifications</h3>
      {subscription ? (
        <>
          <p className="mb-2 text-green-600">
            You are subscribed to push notifications.
          </p>
          <button
            onClick={unsubscribeFromPush}
            className="mb-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Unsubscribe
          </button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-2 w-full rounded border border-gray-300 p-2"
          />
          <button
            onClick={sendTestNotification}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Send Test
          </button>
        </>
      ) : (
        <>
          <p className="mb-2 text-red-600">
            You are not subscribed to push notifications.
          </p>
          <button
            onClick={subscribeToPush}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          and then Add to Home Screen
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}
