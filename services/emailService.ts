
export interface EmailParams {
  to: string;
  subject: string;
  body: string; // HTML or plain text
}

// This is a mock service. In a real application, this would integrate
// with an actual email sending service (e.g., SendGrid, Mailgun, AWS SES).
export const sendEmail = async (params: EmailParams): Promise<{ success: boolean; message: string }> => {
  console.log("Attempting to send email (mock):", params);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate success/failure
  if (!params.to || !params.subject || !params.body) {
    const errorMsg = "Email sending failed: Missing required parameters.";
    console.error(errorMsg);
    alert(errorMsg); // For user feedback in this mock setup
    return { success: false, message: errorMsg };
  }

  if (!params.to.includes('@')) {
    const errorMsg = `Email sending failed: Invalid recipient email: ${params.to}`;
    console.error(errorMsg);
    alert(errorMsg);
    return { success: false, message: errorMsg };
  }
  
  const successMsg = `Mock email successfully "sent" to ${params.to} with subject "${params.subject}".`;
  console.log(successMsg);
  alert(successMsg); // For user feedback in this mock setup
  return { success: true, message: successMsg };
};
