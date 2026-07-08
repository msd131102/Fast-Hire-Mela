import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, User, Search, Bot, Send, Star, Shield, Lightbulb,
  HelpCircle, Gift, Mail, CheckCircle2, ArrowRight, Zap, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const UserGuidance = () => {
  const steps = [
    {
      step: "01",
      title: "Visit FastHireMela",
      icon: <Globe className="text-blue-500" />,
      items: ["Open FastHireMela website", "Register & Login using Email or Google", "Best experience on Desktop / Laptop", "Mobile users should enable Desktop Mode"],
      color: "blue"
    },
    {
      step: "02",
      title: "Complete Your Profile",
      icon: <User className="text-emerald-500" />,
      items: ["Education, Skills, Experience", "Preferred job location", "Upload resume (recommended)"],
      warning: "⚠️ Profile not updated for 4–5 hours → AI job updates will stop temporarily",
      color: "emerald"
    },
    {
      step: "03",
      title: "Browse Jobs",
      icon: <Search className="text-purple-500" />,
      items: ["Category: IT, Govt, Private, Internship, Walk-in", "Location-based search", "Experience Level", "Job Type: Full-time, Part-time, Remote", "Latest / Today's Jobs"],
      badge: "✅ All jobs are verified & active",
      color: "purple"
    },
    {
      step: "04",
      title: "AI Daily Job Updates",
      icon: <Bot className="text-indigo-500" />,
      items: ["AI scans company career pages & portals", "Jobs are matched based on your profile", "New jobs are added automatically"],
      note: "📬 Fresh jobs daily at 8:00 PM",
      color: "indigo"
    },
    {
      step: "05",
      title: "Apply for Jobs",
      icon: <Send className="text-pink-500" />,
      items: ["Click 'Apply Now'", "Direct redirects to company portals", "No fake or misleading redirects"],
      tip: "💡 Tip: Apply early for better response.",
      color: "pink"
    },
    {
      step: "06",
      title: "Benefits for Users",
      icon: <Star className="text-amber-500" />,
      items: ["✔ Completely FREE forever", "✔ No recruiter spam", "✔ Freshers-friendly jobs", "✔ Works on low internet speed"],
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Sleek & High Tech */}
      <div className="relative bg-background border-b border-border pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-surface border border-border backdrop-blur-md">
              <Sparkles className="h-8 w-8 text-primary-400" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black font-pixel text-text tracking-tighter mb-4">
            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">Guidance</span>
          </h1>
          <p className="text-muted text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            A 100% FREE, AI-powered job discovery platform for Freshers & Experienced candidates in India.
          </p>
        </div>
      </div>

      {/* Steps Timeline Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={idx} 
              className="relative group"
            >
              <div className="absolute -top-4 -left-4 text-6xl font-black text-border group-hover:text-primary-500/20 transition-colors z-0">
                {item.step}
              </div>
              <div className="relative z-10 bg-surface border border-border rounded-[2rem] p-8 shadow-adventure group-hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-background group-hover:bg-primary-500/20 transition-colors">
                    {React.cloneElement(item.icon, { size: 24 })}
                  </div>
                  <h2 className="text-xl font-black text-text leading-tight">{item.title}</h2>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {item.items.map((li, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted font-medium leading-snug">
                      <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                      {li}
                    </li>
                  ))}
                </ul>

                {item.warning && (
                  <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-[11px] font-bold text-danger-400 uppercase tracking-tight">
                    {item.warning}
                  </div>
                )}
                {item.badge && <p className="text-xs font-bold text-success-400">{item.badge}</p>}
                {item.note && <p className="text-xs font-bold text-primary-400">{item.note}</p>}
                {item.tip && <p className="text-xs font-bold text-warning-400 italic">{item.tip}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety & Tips - Compact Horizontal Section */}
      <div className="bg-background border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-adventure">
            <div className="flex items-center gap-3 mb-4 text-success-400">
              <Shield size={24} />
              <h3 className="font-black text-text">Privacy & Safety</h3>
            </div>
            <p className="text-sm text-muted font-medium mb-4">Your data is secure. Resumes are only visible to employers when you apply.</p>
            <div className="text-xs font-bold text-success-400 uppercase tracking-widest">100% Secure</div>
          </div>

          <div className="bg-surface p-8 rounded-3xl border border-border shadow-adventure">
            <div className="flex items-center gap-3 mb-4 text-warning-400">
              <Lightbulb size={24} />
              <h3 className="font-black text-text">Pro Tips</h3>
            </div>
            <p className="text-sm text-muted font-medium mb-4">Complete your profile to 100% and apply early for the best response rates.</p>
            <div className="text-xs font-bold text-warning-400 uppercase tracking-widest">Get Hired Faster</div>
          </div>

          <div className="bg-surface p-8 rounded-3xl border border-border shadow-adventure">
            <div className="flex items-center gap-3 mb-4 text-primary-400">
              <HelpCircle size={24} />
              <h3 className="font-black text-text">Need Help?</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted font-bold mb-2">
              <Mail size={14} /> fasthiremela@gmail.com
            </div>
            <p className="text-xs text-muted/70">Available 24/7 for support.</p>
          </div>
        </div>
      </div>

      {/* Offer Section - High Conversion */}
      <div className="px-6 py-20">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-success-500 to-primary-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition" />
          <div className="relative bg-gradient-to-br from-success-600 to-primary-600 rounded-[2.5rem] p-10 md:p-16 text-center text-text overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <Gift className="h-12 w-12 mx-auto mb-6 text-success-200" />
              <h2 className="text-3xl md:text-5xl font-black font-pixel mb-6 tracking-tight">Special Referral Offer 🎁</h2>
              <p className="text-lg md:text-xl mb-10 text-success-600 font-medium bg-background px-6 py-2 rounded-full inline-block">
                Refer 20+ Friends = FREE Premium
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/premium/referral">
                  <Button className="px-8 py-4 bg-background text-success-500 font-black rounded-2xl hover:bg-surface transition-all flex items-center gap-2">
                    Start Referring
                  </Button>
                </Link>
                <Link to="/premium">
                  <Button className="px-8 py-4 bg-success-500/20 border-2 border-text/30 text-text font-black rounded-2xl hover:bg-background/20 transition-all">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center pb-24 px-6">
        <h3 className="text-2xl font-black text-text mb-8">All the best for your job search! 🚀</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button className="px-10 py-4 bg-primary-600 text-text font-black rounded-2xl hover:bg-primary-500 transition-all shadow-adventure">
              Get Started Now
            </Button>
          </Link>
          <Link to="/jobs">
            <Button className="px-10 py-4 bg-transparent border-2 border-border text-text font-black rounded-2xl hover:border-primary-500 hover:text-primary-400 transition-all">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserGuidance;