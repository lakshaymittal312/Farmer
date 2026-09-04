import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, HeartHandshake, Truck, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-20 text-slate-300">
      {/* Top Value Badges Section */}
      <div className="border-b border-dark-border py-8 bg-dark-bg/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Direct Farmer Connection</h4>
              <p className="text-xs text-slate-400">Zero middlemen, fair pricing for farmers & buyers</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Verified Farm Quality</h4>
              <p className="text-xs text-slate-400">100% authentic local produce & organic options</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Fast Regional Transport</h4>
              <p className="text-xs text-slate-400">Direct delivery from local farm gates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-bold shadow-lg">
              <Sprout className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-100">
              FarmConnect
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Empowering agricultural communities by directly bridging local growers with buyers, markets, and consumers.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Marketplace</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/marketplace" className="hover:text-primary-400 transition">Browse Fresh Crops</Link></li>
            <li><Link to="/marketplace?organic=true" className="hover:text-primary-400 transition">Organic Produce</Link></li>
            <li><Link to="/about" className="hover:text-primary-400 transition">About FarmConnect</Link></li>
            <li><Link to="/contact" className="hover:text-primary-400 transition">Contact & Support</Link></li>
          </ul>
        </div>

        {/* Col 3: For Users */}
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Portals</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><Link to="/register" className="hover:text-primary-400 transition">Register as Farmer</Link></li>
            <li><Link to="/register" className="hover:text-primary-400 transition">Register as Buyer</Link></li>
            <li><Link to="/login" className="hover:text-primary-400 transition">Sign In</Link></li>
            <li><Link to="/admin/login" className="hover:text-amber-400 transition">Admin Login</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact Details */}
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Get In Touch</h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
              <span>National Agri Tech Hub, India</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-primary-400 shrink-0" />
              <span>+91 (800) 456-FARM</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-primary-400 shrink-0" />
              <span>support@farmconnect.org</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-dark-border py-6 text-center text-xs text-slate-500">
        <p>© 2026 FarmConnect - Premium Agricultural Marketplace. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
