import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, TrendingUp, Users, Target } from 'lucide-react';
import ImageWithFallback from '../../components/ui/ImageWithFallback';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-primary-500/40 text-primary-300 text-xs font-semibold">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <span>Our Agricultural Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Empowering Local Farmers through Technology
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          FarmConnect is an end-to-end digital marketplace engineered to eliminate traditional supply chain inefficiencies, direct agricultural middleman markups, and empower regional growers.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Direct Farm Gate Sales</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            By connecting local farmers directly with buyers, we ensure maximum revenue retention for agricultural households and transparent pricing for buyers.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Verified Quality Standards</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every farm profile undergoes admin verification to validate crop authenticity, organic certifications, and regional harvesting compliance.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Real-Time Market Data</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrated order status tracking, inventory management tools, and revenue analytics for modern agricultural enterprise management.
          </p>
        </div>
      </div>

      {/* Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-dark-surface border border-dark-border p-8 sm:p-12 rounded-3xl">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">Our Vision</span>
          <h2 className="text-3xl font-extrabold text-slate-100">Sustainable Supply Chains For The Next Generation</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Agricultural commodities should move seamlessly from harvest fields to tables without unnecessary delays or price inflation. FarmConnect provides the digital infrastructure needed for sustainable, transparent, and direct trade.
          </p>
        </div>

        <div className="lg:col-span-6">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
            alt="Agricultural farm fields"
            className="w-full h-72 object-cover rounded-2xl"
            tilt={true}
          />
        </div>
      </div>
    </div>
  );
};

export default About;
