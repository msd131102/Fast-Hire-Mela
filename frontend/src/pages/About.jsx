import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, Heart, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section: Modern & Impactful */}
      <div className="relative overflow-hidden bg-background pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase text-primary-400 border border-primary-400/30 rounded-full bg-primary-400/5 shadow-glow-primary"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-4 tracking-tighter"
          >
            Fast Hire <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">Mela</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium leading-relaxed"
          >
            AI-powered job discovery platform focused on freshers and entry-level jobs across India. 
            <span className="block mt-2 text-primary-400 italic">Updated daily at 8 PM.</span>
          </motion.p>
        </div>
      </div>

      {/* Mission Section: Clean & Professional */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-text tracking-tight mb-6">Our Mission</h2>
              <p className="text-xl text-muted leading-relaxed">
                Fast Hire Mela is dedicated to revolutionizing the job search experience in India.
                We bridge the gap between talented professionals and top companies.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                "Faster hiring process",
                "More transparent results",
                "AI-powered candidate matching"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="font-bold text-text">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/jobs">
                <Button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-text font-bold rounded-2xl shadow-glow-primary transition-all active:scale-95">
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/premium">
                <Button variant="outline" className="px-8 py-4 border-2 border-border hover:border-primary-500 hover:bg-secondary-800 text-text font-bold rounded-2xl transition-all">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/10 blur-3xl rounded-full" />
            <div className="relative bg-surface border border-border p-10 rounded-[2.5rem] shadow-adventure text-center">
              <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-glow-primary">
                <Target className="h-12 w-12 text-white" />
              </div>
              <p className="text-4xl font-black text-text mb-2">Growing Daily</p>
              <p className="text-lg font-bold text-primary-400 uppercase tracking-widest">Jobs Across India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section: Grid Refinement */}
      <div className="bg-background py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-text tracking-tight">Our Values</h2>
            <div className="w-20 h-1.5 bg-primary-600 mx-auto mt-4 rounded-full shadow-glow-primary" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users />, title: "Community First", color: "text-primary-400 bg-primary-500/20", hover: "group-hover:bg-primary-600 group-hover:text-text", desc: "Building a supportive community where seekers and employers grow together." },
              { icon: <Target />, title: "Quality Matches", color: "text-success-400 bg-success-500/20", hover: "group-hover:bg-success-600 group-hover:text-text", desc: "Our AI-powered matching ensures every connection is meaningful." },
              { icon: <Award />, title: "Excellence", color: "text-secondary-400 bg-secondary-500/20", hover: "group-hover:bg-secondary-600 group-hover:text-text", desc: "Striving for excellence in everything, from UI to customer support." },
              { icon: <Heart />, title: "Passion", color: "text-danger-400 bg-danger-500/20", hover: "group-hover:bg-danger-600 group-hover:text-text", desc: "We're passionate about helping people find careers they love." }
            ].map((value, i) => (
              <div key={i} className="group bg-surface p-8 rounded-[2rem] border border-border shadow-adventure hover:border-primary-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${value.color} ${value.hover}`}>
                  {React.cloneElement(value.icon, { size: 28 })}
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{value.title}</h3>
                <p className="text-muted leading-relaxed text-sm font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section: Modern Dark Mode */}
      <div className="bg-background border-y border-border py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: "Job Seekers", value: "Growing", color: "text-primary-400" },
              { label: "Partner Companies", value: "Trusted", color: "text-success-400" },
              { label: "Algorithm", value: "Quality", color: "text-secondary-400" },
              { label: "Support", value: "24/7", color: "text-warning-400" }
            ].map((stat, i) => (
              <div key={i}>
                <p className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>{stat.value}</p>
                <p className="text-muted font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section: Featured Look */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-text tracking-tight">Meet Our Team</h2>
        </div>
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-surface border border-border rounded-[2.5rem] p-10 text-center shadow-adventure">
              <div className="relative inline-block mb-6">
                <img
                  src="https://avatars.githubusercontent.com/u/96329889?v=4"
                  alt="Mr. Shiva"
                  className="rounded-full w-32 h-32 mx-auto object-cover border-4 border-surface"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full border-4 border-surface flex items-center justify-center shadow-lg">
                  <Zap size={14} className="text-white fill-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-text mb-1">Mr. Shiva</h3>
              <p className="text-primary-400 font-bold tracking-widest uppercase text-xs mb-4">Full Stack Developer</p>
              <div className="inline-block px-4 py-1 text-[10px] font-black tracking-widest text-primary-400 bg-primary-500/20 rounded-full mb-6 uppercase">
                10+ projects done experienced in MERN stack
              </div>
              <p className="text-muted leading-relaxed font-medium">
                Full-stack engineer with a passion for building impactful web applications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section: High Conversion */}
      <div className="px-6 pb-20">
        <div className="max-w-5xl mx-auto bg-primary-600 rounded-[3rem] p-12 md:p-20 text-center text-text relative overflow-hidden shadow-glow-primary">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to Transform Your Career?</h2>
            <p className="text-lg md:text-xl mb-10 text-text max-w-2xl mx-auto font-medium">
              Join thousands of professionals who found their dream jobs through Fast Hire Mela.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="px-10 py-4 bg-background text-primary-400 font-black rounded-2xl hover:bg-surface transition-all flex items-center justify-center gap-2">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="px-10 py-4 bg-transparent border-2 border-text/30 text-text font-black rounded-2xl hover:bg-background/20 transition-all">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;