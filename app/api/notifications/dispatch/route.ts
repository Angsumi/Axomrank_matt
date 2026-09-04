import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore, getAdminMessaging } from "@/lib/firebase/admin";
import { extractJobMetadata, evaluateJobFit } from "@/lib/assam-job-classifier";
import type { AspirantProfile } from "@/lib/firebase/firestore-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const db = getAdminFirestore();
    const messaging = getAdminMessaging();

    if (!db || !messaging) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured on the server. Set FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_KEY." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { title, summary, url } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required for notification dispatch." },
        { status: 400 }
      );
    }

    const jobMeta = extractJobMetadata(title, summary || "");
    if (!jobMeta.isRecruitment) {
      return NextResponse.json({ sent: 0, message: "Not a recruitment vacancy." });
    }

    const usersSnapshot = await db.collection("users").get();
    const targetTokens: string[] = [];
    const notificationPayload = {
      title: `🎯 ${jobMeta.department || "Assam Govt"} Vacancy Match!`,
      body: `${title.slice(0, 100)}... Check your eligibility & apply now.`,
      url: url || "https://axomrank.onrender.com",
    };

    for (const userDoc of usersSnapshot.docs) {
      const data = userDoc.data();
      const profile = (data.profile as AspirantProfile) || undefined;

      if (!profile || profile.notificationsEnabled === false) continue;

      // Evaluate personalized fit for this student
      const fit = evaluateJobFit(jobMeta, profile);
      const minThreshold = profile.minFitScoreAlert || 80;

      if (fit.score >= minThreshold && fit.dealBreakers.length === 0) {
        // Collect user's FCM tokens
        const tokensSnapshot = await userDoc.ref.collection("fcm_tokens").get();
        for (const tokenDoc of tokensSnapshot.docs) {
          const tokenData = tokenDoc.data();
          if (tokenData.token) {
            targetTokens.push(tokenData.token);
          }
        }
      }
    }

    if (targetTokens.length === 0) {
      return NextResponse.json({
        sent: 0,
        message: "No matching registered tokens for this eligibility criteria.",
      });
    }

    const response = await messaging.sendEachForMulticast({
      tokens: targetTokens,
      notification: {
        title: notificationPayload.title,
        body: notificationPayload.body,
      },
      data: {
        url: notificationPayload.url,
      },
    });

    return NextResponse.json({
      sent: response.successCount,
      failed: response.failureCount,
      totalTargets: targetTokens.length,
    });
  } catch (error) {
    console.error("Notification dispatch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to dispatch notifications." },
      { status: 500 }
    );
  }
}
