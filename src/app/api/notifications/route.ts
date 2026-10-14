import { NextResponse } from "next/server";

/**
 * Mocked notification endpoint.
 * In production, integrate with Twilio (SMS) or Resend (Email).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, to, ticketId, message } = body;

    // Mock: Log the notification
    console.log(`[Notification] Type: ${type}, To: ${to}, Ticket: ${ticketId}`);
    console.log(`[Notification] Message: ${message}`);

    // TODO: Integrate with real providers
    // if (type === 'sms') {
    //   await twilioClient.messages.create({
    //     body: message,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: to,
    //   });
    // } else if (type === 'email') {
    //   await resend.emails.send({
    //     from: 'FlowQ <noreply@flowq.app>',
    //     to: to,
    //     subject: 'Your Queue Update',
    //     text: message,
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: "Notification sent (mocked)",
      data: { type, to, ticketId },
    });
  } catch (error) {
    console.error("[notifications] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
