import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { sendFinalSubmitEmail, sendQuizCompletionEmail } from '../utils/emailService';
import SEO from '../components/SEO';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, processFinalSubmit, processQuizPayment, appliedInternships } = useContext(AuthContext);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const pending = localStorage.getItem('pendingPayment');
        if (pending) {
          const data = JSON.parse(pending);
          
          if (data.type === 'internship') {
            const success = await processFinalSubmit(data.appId, {
              method: 'Razorpay',
              status: 'Paid',
              submittedOn: new Date().toISOString()
            }, data.verificationData);

            if (success) {
              await sendFinalSubmitEmail({
                studentName: data.studentName || user?.name || 'N/A',
                studentEmail: data.studentEmail || user?.email || 'N/A',
                internshipTitle: data.internshipTitle || 'N/A',
                internshipDomain: data.internshipDomain || 'N/A',
                appliedDate: data.appliedDate || 'N/A',
                transactionId: data.verificationData?.razorpay_payment_id || 'Razorpay',
                paymentDate: new Date().toISOString().split("T")[0],
                paymentScreenshotBase64: null 
              });
              localStorage.removeItem('pendingPayment');
            } else {
              alert("Payment verification failed. Please contact admin.");
            }
          } else if (data.type === 'quiz') {
            const success = await processQuizPayment(data.quizId, {
              method: 'Razorpay',
              paymentDate: new Date().toISOString().split('T')[0],
              status: 'Paid'
            }, data.verificationData);
            
            if (success) {
              await sendQuizCompletionEmail({
                studentName: data.studentName || user?.name || 'N/A',
                studentEmail: data.studentEmail || user?.email || 'N/A',
                quizTitle: data.quizTitle || 'N/A',
                score: 'See Dashboard',
                submittedDate: new Date().toLocaleDateString('en-IN')
              });
              localStorage.removeItem('pendingPayment');
            } else {
              alert("Payment verification failed. Please contact admin.");
            }
          }
        }
      } catch (error) {
        console.error("Error processing pending payment:", error);
      } finally {
        setVerifying(false);
      }
    };

    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (verifying) {
    return (
      <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <Loader size={48} className="spin" color="var(--primary)" style={{ marginBottom: '24px' }} />
        <h2 style={{ fontSize: '1.8rem' }}>Verifying your payment...</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please wait, do not close this page.</p>
      </div>
    );
  }

  return (
    <>
      <SEO noindex={true} title="Payment Success | Skillzeno" />
      <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <CheckCircle size={80} color="var(--accent-success)" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Payment Successful!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6', marginBottom: '32px' }}>
          You will receive an email with your certificate within 24 hours, and you can also download it directly from the website once verified.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
          Return to Dashboard
        </button>
      </div>
    </>
  );
}
