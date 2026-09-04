import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Get In Touch</h1>
        <p className="text-sm text-slate-400">Have questions about farm registration, bulk purchasing, or system support?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-slate-100">Contact Information</h3>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Headquarters</h4>
                <p className="text-xs text-slate-400 mt-0.5">National Agri Tech Hub, Sector 62, India</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Support Hotline</h4>
                <p className="text-xs text-slate-400 mt-0.5">+91 (800) 456-FARM (Mon-Sat, 9am - 6pm)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Email Address</h4>
                <p className="text-xs text-slate-400 mt-0.5">support@farmconnect.org</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-dark-card border border-dark-border p-8 rounded-3xl space-y-6">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-primary-500 text-primary-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Message Delivered!</h3>
                <p className="text-xs text-slate-400">Thank you for reaching out to FarmConnect. Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-100 mb-2">Send Us A Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ramesh@farm.com"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Farmer Registration Inquiry"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your inquiry or feedback..."
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-primary-500/20"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
