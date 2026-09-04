import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShoppingBag, ShieldCheck, TrendingUp, Users, Award, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import api from '../../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      const pRes = await api.get('/products?status=active&limit=4');
      if (pRes.data.success) setFeaturedProducts(pRes.data.data.slice(0, 4));

      const cRes = await api.get('/categories');
      if (cRes.data.success) setCategories(cRes.data.data.slice(0, 6));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] hero-glow pointer-events-none rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-primary-500/40 text-primary-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Direct Farm-to-Table Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-tight">
              Fresh From Farmers.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-accent-gold">
                Directly To You.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              FarmConnect bridges local agricultural growers directly with buyers, restaurants, and wholesalers. Enjoy zero middleman markup, transparent pricing, and 100% verified fresh produce.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Marketplace
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto glass-panel-interactive text-slate-200 hover:text-white font-semibold px-7 py-3.5 rounded-2xl flex items-center justify-center gap-2"
              >
                <Sprout className="w-5 h-5 text-primary-400" />
                Join as Farmer / Buyer
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-dark-border/80">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-100">100%</p>
                <p className="text-xs text-slate-400 font-medium">Direct Producer Sourced</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-primary-400">0%</p>
                <p className="text-xs text-slate-400 font-medium">Middleman Fees</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-accent-gold">24h</p>
                <p className="text-xs text-slate-400 font-medium">Fresh Farm Dispatch</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visual with Tilt & Floating Badge */}
          <div className="lg:col-span-5 relative group">
            {/* Background Glow Ring */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/30 to-accent-gold/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-500" />

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80"
                alt="Fresh Organic Vegetables Harvest"
                className="w-full h-[420px] object-cover rounded-3xl"
                tilt={true}
                tiltDirection="right"
              />

              {/* Floating Quality Badge */}
              <div className="absolute -bottom-6 -left-6 bg-dark-surface/90 border border-primary-500/40 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse-subtle">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-primary-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-100">Verified Quality</p>
                  <p className="text-[11px] text-slate-400">Direct From Farm Gates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES GRID */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Explore Categories</span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-1">Agricultural Categories</h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View All Marketplace Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/marketplace?category=${cat._id}`}
                className="glass-panel-interactive p-5 rounded-2xl text-center group flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-3 group-hover:scale-110 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-primary-400 transition">{cat.name}</h4>
                <span className="text-[10px] text-slate-400 mt-1">Explore Crops</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS SHOWCASE */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">Fresh Arrivals</span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-1">Featured Farm Produce</h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <div key={p._id} className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative p-2">
                    <ImageWithFallback
                      src={p.images && p.images[0] ? p.images[0] : ''}
                      alt={p.name}
                      className="w-full h-48 object-cover rounded-xl"
                      tilt={true}
                    />
                    {p.isOrganic && (
                      <span className="absolute top-4 left-4 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
                        Organic
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-100 text-base line-clamp-1 group-hover:text-primary-400 transition">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Farmer: <span className="text-slate-200 font-medium">{p.farmer?.farmName || 'Local Farm'}</span>
                    </p>
                    <div className="flex items-baseline justify-between pt-2">
                      <p className="text-lg font-black text-primary-400">
                        ₹{p.price} <span className="text-xs font-normal text-slate-400">/ {p.unit}</span>
                      </p>
                      <span className="text-[11px] text-slate-400 font-medium">Stock: {p.quantity} {p.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    to={`/products/${p._id}`}
                    className="w-full block text-center bg-dark-card hover:bg-primary-500 hover:text-slate-950 text-primary-300 font-semibold text-xs py-2.5 rounded-xl border border-primary-500/30 hover:border-primary-500 transition shadow-sm"
                  >
                    View Product Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WHY FARMCONNECT VALUES */}
      <section className="bg-dark-surface border-y border-dark-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-100 mb-3">Why Choose FarmConnect?</h2>
            <p className="text-sm text-slate-400">
              Modernizing agricultural supply chains with direct connections, verified farm credentials, and fair pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Farmer Empowerment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Farmers set their own fair harvest prices and communicate directly with buyers without distributor commissions.
              </p>
            </div>

            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Transparent Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buyers get lower wholesale & retail market rates by skipping multiple distribution layers.
              </p>
            </div>

            <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Quality Guarantee</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All farm profiles are verified by platform administrators to ensure crop authenticity and harvesting standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-dark-surface to-dark-card border border-emerald-800/50 p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Ready to revolutionize your agricultural sourcing?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Join thousands of local farmers and buyers already trading directly on FarmConnect today.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-primary-500/25 whitespace-nowrap text-sm"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
