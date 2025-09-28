import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ayudantechunimet@gmail.com",
        pass: "njqt qwri bscl hqja",
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: "ayudantechunimet@gmail.com",
      to: to,
      subject: subject,
      html: html,
    })

    console.log("Email sent: ", info.messageId)
    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
