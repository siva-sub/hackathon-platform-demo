
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Icons } from '../constants';
import Input from '../components/ui/Input'; 
import Modal from '../components/ui/Modal'; 

const HomePage: React.FC = () => {
  const { currentUser, setCurrentUser, adminUsers, judges } = useAppContext();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDemoCredentialsModal, setShowDemoCredentialsModal] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');
  const [selectedRoleForEmail, setSelectedRoleForEmail] = useState<UserRole>(null);
  const [emailError, setEmailError] = useState('');

  if (currentUser?.role) {
    const targetPath = `/${currentUser.role}`;
    return <Navigate to={targetPath} replace />;
  }

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'participant' || role === 'judge' || role === 'admin') { 
      setSelectedRoleForEmail(role);
      setShowEmailModal(true);
      setParticipantEmail(''); 
      setEmailError('');
    } else if (role === 'superadmin') {
      setCurrentUser(role, 'superadmin@example.com');
    } else if (role) {
      setCurrentUser(role); // Should not happen with current roles
    }
  };

  const handleEmailSubmit = () => {
    if (!participantEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (selectedRoleForEmail) {
      // Check if email exists for admin/judge roles for demo purposes
      if (selectedRoleForEmail === 'admin' && !adminUsers.find(au => au.email.toLowerCase() === participantEmail.toLowerCase())) {
        setEmailError(`Admin email ${participantEmail} not found. Use a pre-configured admin email (see Demo Credentials).`);
        return;
      }
      if (selectedRoleForEmail === 'judge' && !judges.find(j => j.email.toLowerCase() === participantEmail.toLowerCase())) {
        setEmailError(`Judge email ${participantEmail} not found. Use a pre-configured judge email (see Demo Credentials).`);
        return;
      }
      setCurrentUser(selectedRoleForEmail, participantEmail);
      setShowEmailModal(false);
      setParticipantEmail('');
      setSelectedRoleForEmail(null);
    }
  };
  
  const demoParticipantEmails = ["alice@example.com", "bob@example.com", "charlie@example.com", "dave@example.com", "eve@example.com", "fiona@example.com", "george@example.com", "hannah@example.com", "ian@example.com", "julia@example.com"];


  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
        <Card title="Welcome to the Hackathon Platform!" className="max-w-lg w-full text-center shadow-2xl">
          <div className="mx-auto text-primary-600 dark:text-primary-400 w-16 h-16">
              <Icons.Trophy />
          </div>
          <p className="text-neutral-600 dark:text-neutral-200 my-6">
            Manage your hackathon event seamlessly, from participant submissions to multi-round judging across dynamic stages.
            Select your role to get started or view demo credentials:
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => handleRoleSelect('superadmin')} 
              variant="primary" 
              size="lg" 
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              leftIcon={<Icons.ShieldCheck />}
            >
              I am a Super Administrator
            </Button>
            <Button 
              onClick={() => handleRoleSelect('admin')} 
              variant="primary" 
              size="lg" 
              className="w-full"
              leftIcon={<Icons.Cog />}
            >
              I am an Administrator
            </Button>
            <Button 
              onClick={() => handleRoleSelect('participant')} 
              variant="secondary" 
              size="lg" 
              className="w-full"
              leftIcon={<Icons.UserGroup />}
            >
              I am a Participant
            </Button>
            <Button 
              onClick={() => handleRoleSelect('judge')} 
              variant="ghost" 
              size="lg" 
              className="w-full border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-200 dark:hover:bg-purple-800 dark:hover:text-purple-100"
              leftIcon={<Icons.AcademicCap />}
            >
              I am a Judge
            </Button>
            <Button 
              onClick={() => setShowDemoCredentialsModal(true)} 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-sm"
              leftIcon={<Icons.LightBulb />}
            >
              View Demo Credentials
            </Button>
          </div>
        </Card>
      </div>

      {/* Email Input Modal */}
      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title={`Enter Email as ${selectedRoleForEmail}`}>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
            Please enter your email to proceed as a {selectedRoleForEmail}.
            { (selectedRoleForEmail === 'admin' || selectedRoleForEmail === 'judge') && <span> This email must match a pre-configured {selectedRoleForEmail}. (See "Demo Credentials")</span>}
            { selectedRoleForEmail === 'participant' && <span> You can use any valid email format or one from the "Demo Credentials" list.</span>}
        </p>
        <Input 
            label="Your Email Address"
            type="email"
            value={participantEmail}
            onChange={(e) => { setParticipantEmail(e.target.value); setEmailError(''); }}
            placeholder="you@example.com"
            error={emailError}
            required
            containerClassName="mb-1"
        />
        <div className="mt-4 flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEmailSubmit}>Proceed</Button>
        </div>
      </Modal>

      {/* Demo Credentials Modal */}
      <Modal isOpen={showDemoCredentialsModal} onClose={() => setShowDemoCredentialsModal(false)} title="Demo Credentials">
        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
            <p>Use these email addresses to explore different roles in the demo:</p>
            <div>
                <strong className="font-semibold">Super Administrator:</strong>
                <ul className="list-disc pl-5"><li><code>superadmin@example.com</code> (select role directly, no email input)</li></ul>
            </div>
            <div>
                <strong className="font-semibold">Administrators:</strong>
                <ul className="list-disc pl-5">
                    {adminUsers.filter(u => u.email !== 'superadmin@example.com').map(admin => <li key={admin.id}><code>{admin.email}</code></li>)}
                     <li>You can add more admins via the Super Admin panel.</li>
                </ul>
            </div>
            <div>
                <strong className="font-semibold">Judges:</strong>
                <ul className="list-disc pl-5">
                    {judges.map(judge => <li key={judge.id}><code>{judge.email}</code></li>)}
                    <li>You can add more judges via the Super Admin panel.</li>
                </ul>
            </div>
            <div>
                <strong className="font-semibold">Participants:</strong>
                <ul className="list-disc pl-5">
                    {demoParticipantEmails.map(email => <li key={email}><code>{email}</code> (or any valid email format)</li>)}
                </ul>
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">For Admin, Judge, and Participant roles, you'll be prompted to enter one of these emails after selecting the role.</p>
        </div>
         <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setShowDemoCredentialsModal(false)}>Got it!</Button>
        </div>
      </Modal>
    </>
  );
};

export default HomePage;
