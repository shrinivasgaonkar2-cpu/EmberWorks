const MAX_BODY_LENGTH = 10_000;
const MAX_NAME_LENGTH = 120;
const MAX_CITY_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  },
  body: JSON.stringify(body)
});

const readField = (value, maxLength) => (
  typeof value === "string" && value.trim().length <= maxLength
    ? value.trim()
    : null
);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { message: "Use POST to send the collaboration form." });
  }

  if (!event.body || event.body.length > MAX_BODY_LENGTH) {
    return jsonResponse(413, { message: "The form submission is too large." });
  }

  let submission;
  try {
    submission = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, { message: "The form submission is not valid JSON." });
  }

  if (!submission || typeof submission !== "object" || Array.isArray(submission)) {
    return jsonResponse(400, { message: "The form submission is invalid." });
  }

  const name = readField(submission.name, MAX_NAME_LENGTH);
  const city = readField(submission.city, MAX_CITY_LENGTH);
  const email = readField(submission.email, 254);
  const phone = readField(submission.phone ?? "", MAX_PHONE_LENGTH);

  if (
    !name ||
    !city ||
    !email ||
    phone === null ||
    !EMAIL_PATTERN.test(email) ||
    !Object.keys(submission).every((field) => ["name", "city", "email", "phone"].includes(field))
  ) {
    return jsonResponse(400, { message: "Please check the form details and try again." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  const recipient = process.env.COLLABORATION_RECIPIENT;

  if (!apiKey || !sender || !recipient) {
    console.error("Collaboration email settings are missing.");
    return jsonResponse(503, { message: "The form is not configured yet. Please try again later." });
  }

  const message = [
    "A new collaboration inquiry was submitted on EmberWorks.",
    "",
    `Name: ${name}`,
    `City: ${city}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`
  ].join("\n");

  let emailResponse;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: "New EmberWorks collaboration inquiry",
        text: message
      })
    });
  } catch (error) {
    console.error("Collaboration email provider request failed.", error);
    return jsonResponse(502, { message: "Email delivery is temporarily unavailable. Please try again later." });
  }

  if (!emailResponse.ok) {
    console.error(`Collaboration email provider returned HTTP ${emailResponse.status}.`);
    return jsonResponse(502, { message: "Email delivery failed. Please try again later." });
  }

  return jsonResponse(200, { message: "Thanks for reaching out. Your details have been sent successfully." });
};
