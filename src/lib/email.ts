// Email automation utilities
// Configure with your email provider (Resend, Postmark, SendGrid, etc.)

import { logger } from "./logger";

export type EmailTemplate =
  | "welcome"
  | "first-capture"
  | "first-project"
  | "first-area"
  | "weekly-review-reminder"
  | "upgrade-prompt"
  | "referral-thank-you"
  | "trial-ending"
  | "subscription-activated"
  | "subscription-canceled";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Placeholder email sending function
// Replace with your email provider's SDK
export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Integrate with email provider (Resend, Postmark, SendGrid)
  // Example with Resend:
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ ...options });

  logger.info("Email would be sent", {
    to: options.to,
    subject: options.subject,
    // Don't log full HTML in production
  });

  // In development, just log
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Email:", options.subject, "→", options.to);
  }
}

export async function sendWelcomeEmail(userEmail: string, userName?: string | null) {
  await sendEmail({
    to: userEmail,
    subject: "Welcome to Neyro! Let's get you organized",
    html: `
      <h1>Welcome to Neyro${userName ? `, ${userName}` : ""}!</h1>
      <p>You're all set up. Here's how to get started:</p>
      <ol>
        <li><strong>Capture your first item</strong> - Go to your inbox and add something</li>
        <li><strong>Create your first project</strong> - Organize items by outcome</li>
        <li><strong>Set up your first area</strong> - Track what matters long-term</li>
        <li><strong>Schedule your weekly review</strong> - Close the loop every week</li>
      </ol>
      <p><a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/inbox">Get started →</a></p>
    `,
  });
}

export async function sendWeeklyReviewReminder(userEmail: string, userName?: string | null) {
  await sendEmail({
    to: userEmail,
    subject: "Time for your weekly review",
    html: `
      <h1>Weekly Review Reminder</h1>
      <p>Hi${userName ? ` ${userName}` : ""},</p>
      <p>It's time for your weekly review. This is where the magic happens—where you close the loop and keep your PARA system current.</p>
      <p><a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/review">Start your review →</a></p>
    `,
  });
}

export async function sendUpgradePrompt(
  userEmail: string,
  reason: "projects" | "ai-credits" | "exports" | "templates"
) {
  const reasons = {
    projects: "You've hit the 3-project limit. Upgrade to unlock 7 active projects.",
    "ai-credits": "You've used all your AI credits. Upgrade for unlimited AI assistance.",
    exports: "Exports are available with Focus plan. Upgrade to unlock this feature.",
    templates: "Templates are available with Focus plan. Upgrade to unlock this feature.",
  };

  await sendEmail({
    to: userEmail,
    subject: "Unlock more with Focus",
    html: `
      <h1>Ready for more?</h1>
      <p>${reasons[reason]}</p>
      <p><a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/pricing">Upgrade to Focus →</a></p>
    `,
  });
}

export async function sendReferralThankYou(userEmail: string, referralCount: number) {
  await sendEmail({
    to: userEmail,
    subject: "Thanks for referring! You've earned a free month",
    html: `
      <h1>You've earned a free month!</h1>
      <p>Thanks for referring ${referralCount} ${referralCount === 1 ? "friend" : "friends"}. You've both earned 1 month free on Focus.</p>
      <p><a href="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/settings/billing">View your subscription →</a></p>
    `,
  });
}
