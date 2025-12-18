import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.success) {
        addToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        addToast(result.message || 'Failed to send message.', 'error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      addToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Enhanced Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-400 uppercase bg-blue-400/10 rounded-full">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">help you?</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Whether you're looking for your next career move or seeking world-class talent, our team is ready to assist.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Mail, color: "text-blue-600", bg: "bg-blue-50", title: "Email Us", detail: "fasthiremela@gmail.com", sub: "Response within 24 hours" },
                { icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50", title: "Call Us", detail: "+91 900-XXX-XXX", sub: "Mon-Fri, 9AM-6PM IST" },
                { icon: MapPin, color: "text-purple-600", bg: "bg-purple-50", title: "Location", detail: "Kakinada, India", sub: "Available for meetings" }
              ].map((item, idx) => (
                <Card key={idx} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-4">
                    <div className={`${item.bg} p-3 rounded-2xl`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{item.title}</p>
                      <p className="text-lg font-bold text-slate-900">{item.detail}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Support Hours Card */}
            <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Clock className="h-24 w-24" />
              </div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Support Hours
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { day: "Monday - Friday", time: "9:00 AM - 6:00 PM" },
                  { day: "Saturday - Sunday", time: "Closed", dim: true }
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center py-2 border-b border-slate-50 last:border-0 ${row.dim ? 'text-slate-400' : 'text-slate-700'}`}>
                    <span>{row.day}</span>
                    <span className="font-semibold">{row.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Form & FAQ */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="p-8 border-none shadow-xl bg-white">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
                <p className="text-slate-500 mt-1">Fields marked with an asterisk (*) are required.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Your Name *</label>
                    <Input
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address *</label>
                    <Input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subject *</label>
                  <Input
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="Tell us more about your needs..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center text-slate-500 text-sm gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    We value your privacy.
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isSubmitting ? 'Sending...' : (
                        <>
                          <span className="font-bold">Send Message</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </form>
            </Card>

            {/* FAQ Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: "How quickly will I hear back?", a: "We typically respond to all inquiries within 24 hours during business days." },
                { q: "Can I schedule a demo?", a: "Absolutely! Contact us to schedule a personalized demo of our platform." }
              ].map((faq, i) => (
                <Card key={i} className="p-6 border-none shadow-sm bg-white hover:bg-slate-50 transition-colors">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;