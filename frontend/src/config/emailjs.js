// EmailJS Configuration
// -----------------------------------------------------
// STEPS TO SETUP:
// 1. Go to https://www.emailjs.com/ and create a FREE account
// 2. Go to "Email Services" → Add New Service → Choose Gmail
//    → Connect your btechnote1234@gmail.com account
//    → Copy the "Service ID" and paste below as VITE_EMAILJS_SERVICE_ID
// 3. Go to "Email Templates" → Create New Template
//    Template 1 (Application Notification):
//      Subject: New Internship Application - {{student_name}}
//      Body:
//        New Application Received!
//        Student Name: {{student_name}}
//        Student Email: {{student_email}}
//        Internship: {{internship_title}}
//        Domain: {{internship_domain}}
//        Applied On: {{applied_date}}
//    → Save → Copy Template ID → paste as VITE_EMAILJS_TEMPLATE_APPLY
//
//    Template 2 (Final Submit Notification):
//      Subject: Final Submission + Payment - {{student_name}}
//      Body:
//        Final Submission Received!
//        Student Name: {{student_name}}
//        Student Email: {{student_email}}
//        Internship: {{internship_title}}
//        Domain: {{internship_domain}}
//        Applied On: {{applied_date}}
//        Submitted On: {{submitted_date}}
//        Payment Note: {{payment_note}}
//    → Save → Copy Template ID → paste as VITE_EMAILJS_TEMPLATE_SUBMIT
//
// 4. Go to "Account" → Copy "Public Key" → paste as VITE_EMAILJS_PUBLIC_KEY
// -----------------------------------------------------

export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  TEMPLATE_APPLY: import.meta.env.VITE_EMAILJS_TEMPLATE_APPLY || 'YOUR_TEMPLATE_APPLY_ID',
  TEMPLATE_SUBMIT: import.meta.env.VITE_EMAILJS_TEMPLATE_SUBMIT || 'YOUR_TEMPLATE_SUBMIT_ID',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  ADMIN_EMAIL: 'btechnote1234@gmail.com'
};
