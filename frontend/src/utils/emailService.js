const WEB3FORMS_ACCESS_KEY = 'a6ccbe68-6389-4793-96cb-6bf2fc103c49';

/**
 * Sends an email notification when a student applies for an internship.
 */
export async function sendApplicationEmail({ studentName, studentEmail, internshipTitle, internshipDomain, appliedDate }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `🎓 New Internship Application - ${studentName}`,
        from_name: 'Skillzeno Portal',
        'Student Name': studentName,
        'Student Email': studentEmail,
        'Internship': internshipTitle,
        'Domain': internshipDomain || 'N/A',
        'Applied On': appliedDate,
        botcheck: ''
      })
    });
    const data = await res.json();
    console.log('[Web3Forms Apply Response]', data);
  } catch (err) {
    console.error('[Web3Forms] Failed to send application email:', err);
  }
}

/**
 * Sends an email notification when a student does Final Submit with payment info.
 */
export async function sendFinalSubmitEmail({ studentName, studentEmail, internshipTitle, internshipDomain, appliedDate, transactionId, paymentDate, paymentScreenshotBase64 }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `✅ Final Submission + Payment - ${studentName}`,
        from_name: 'Skillzeno Portal',
        'Student Name': studentName,
        'Student Email': studentEmail,
        'Internship': internshipTitle,
        'Domain': internshipDomain || 'N/A',
        'Applied On': appliedDate,
        'Transaction ID': transactionId || 'N/A',
        'Payment Date': paymentDate || 'N/A',
        'Payment Screenshot': paymentScreenshotBase64 ? 'Screenshot uploaded by student (see attachment)' : 'Not uploaded',
        'Submitted On': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
        botcheck: ''
      })
    });
    const data = await res.json();
    console.log('[Web3Forms Final Submit Response]', data);
  } catch (err) {
    console.error('[Web3Forms] Failed to send final submit email:', err);
  }
}

export async function sendPasswordResetEmail({ userEmail, requestDate }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `🔒 Password Reset Request - ${userEmail}`,
        from_name: 'Skillzeno Portal',
        'User Email': userEmail,
        'Requested On': requestDate,
        'Message': 'A user has requested a password reset. Please log in to the admin dashboard to set a new password for this user.',
        botcheck: ''
      })
    });
    const data = await res.json();
    console.log('[Web3Forms Password Reset]', data);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
}

export async function sendQuizCompletionEmail({ studentName, studentEmail, quizTitle, score, submittedDate }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `🏆 Quiz Final Submission - ${studentName}`,
        from_name: 'Skillzeno Portal',
        'Student Name': studentName,
        'Student Email': studentEmail,
        'Quiz Title': quizTitle,
        'Score': score,
        'Submitted On': submittedDate,
        'Message': 'A student has submitted payment/final completion details for a quiz. Please verify from the dashboard.',
        botcheck: ''
      })
    });
    const data = await res.json();
    console.log('[Web3Forms Quiz Completion]', data);
  } catch (err) {
    console.error('Failed to send quiz completion email:', err);
  }
}

export async function sendContactEmail({ name, email, message }) {
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `📩 New Contact Form Message - ${name}`,
        from_name: 'Skillzeno Portal',
        'Visitor Name': name,
        'Visitor Email': email,
        'Message': message,
        botcheck: ''
      })
    });
    const data = await res.json();
    console.log('[Web3Forms Contact Response]', data);
  } catch (err) {
    console.error('Failed to send contact email:', err);
  }
}
