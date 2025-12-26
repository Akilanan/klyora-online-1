import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      const user = {
        name: mode === 'login' ? 'Klyora Client' : `${formData.firstName} ${formData.lastName} `,
        email: formData.email,
        phone: formData.phone,
        tier: 'Gold'
      };

      localStorage.setItem('klyora_user', JSON.stringify(user));
      // Force refresh to update header
      window.location.reload();
    }, 1500);
  };

  const handleSocialLogin = (provider: 'Apple' | 'Facebook') => {
    setIsLoading(true);
    // Simulate OAuth Window/Redirect
    setTimeout(() => {
      setIsLoading(false);
      const user = {
        name: `${provider} User`,
        email: `user @${provider.toLowerCase()}.com`,
        tier: 'Silver'
      };
      localStorage.setItem('klyora_user', JSON.stringify(user));
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md p-14 shadow-2xl animate-fade-scale overflow-hidden">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif italic mb-4">{mode === 'login' ? 'Welcome Back' : 'Join the Atelier'}</h2>
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            {mode === 'login' ? 'Access your curated wardrobe' : 'Begin your journey with Maison Klyora'}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4 mb-10">
          <button
            onClick={() => handleSocialLogin('Apple')}
            className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 hover:bg-zinc-800 transition-all group"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.65-.95.53.03 2.53.25 3.68 1.95-.94.57-2.3 2.1-1.99 4.3.33 2.37 3.02 3.48 3.08 3.51-2.9 5.86-5.8 4.29-3.5 3.42zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.33-2.15 4.34-3.74 4.25z" /></svg>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Continue with Apple</span>
          </button>

          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-4 hover:bg-[#166fe5] transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Continue with Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <span className="relative bg-white px-4 text-[8px] uppercase tracking-widest text-zinc-400">Or continue with email</span>
        </div>

        {/* Regular Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest font-bold text-zinc-500">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full border-b border-black/10 py-2 outline-none focus:border-black text-sm transition-colors uppercase"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest font-bold text-zinc-500">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full border-b border-black/10 py-2 outline-none focus:border-black text-sm transition-colors uppercase"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              {/* Phone Input */}
              <div className="space-y-2 col-span-2">
                <label className="text-[8px] uppercase tracking-widest font-bold text-zinc-500">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full border-b border-black/10 py-2 outline-none focus:border-black text-sm transition-colors uppercase placeholder:text-zinc-300 font-sans"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-widest font-bold text-zinc-500">Email Address</label>
            <input
              type="email"
              required
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black text-sm transition-colors uppercase"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[8px] uppercase tracking-widest font-bold text-zinc-500">Password</label>
              {mode === 'login' && <button type="button" className="text-[8px] uppercase tracking-widest text-[#8ca67a] hover:underline">Forgot?</button>}
            </div>
            <input
              type="password"
              required
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black text-sm transition-colors"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white h-14 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-black transition-colors"
          >
            {mode === 'login' ? "New Client? Register" : "Already a Member? Login"}
          </button>
        </div>

        {/* Close Button */}
        <button className="absolute top-6 right-6 p-2 hover:opacity-50 transition-opacity" onClick={onClose}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
