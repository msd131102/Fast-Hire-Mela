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
    <div className="min-h-screen bg-background text-text">
      {/* Enhanced Hero Section */}
      <div className="relative bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 z-0" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wide text-primary-400 uppercase bg-primary-400/10 rounded-full shadow-glow-primary">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-text mb-6 tracking-tight">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">help you?</span>
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
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
                { icon: Mail, color: "text-primary-400", bg: "bg-primary-500/20", title: "Email Us", detail: "fasthiremela@gmail.com", sub: "Response within 24 hours" },
                { icon: Phone, color: "text-success-400", bg: "bg-success-500/20", title: "Call Us", detail: "+91 900-XXX-XXX", sub: "Mon-Fri, 9AM-6PM IST" },
                { icon: MapPin, color: "text-secondary-400", bg: "bg-secondary-500/20", title: "Location", detail: "Kakinada, India", sub: "Available for meetings" }
              ].map((item, idx) => (
                <Card key={idx} className="p-6 border border-border bg-surface shadow-adventure transition-shadow duration-300">
                  <div className="flex items-center space-x-4">
                    <div className={`${item.bg} p-3 rounded-2xl`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted uppercase tracking-wider">{item.title}</p>
                      <p className="text-lg font-black text-text">{item.detail}</p>
                      <p className="text-xs text-muted/70 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Support Hours Card */}
            <Card className="p-6 border border-border shadow-adventure bg-surface overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Clock className="h-24 w-24" />
              </div>
              <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-500" />
                Support Hours
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { day: "Monday - Friday", time: "9:00 AM - 6:00 PM" },
                  { day: "Saturday - Sunday", time: "Closed", dim: true }
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center py-2 border-b border-border last:border-0 ${row.dim ? 'text-muted' : 'text-text'}`}>
                    <span>{row.day}</span>
                    <span className="font-semibold">{row.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Form & FAQ */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="p-8 border border-border shadow-adventure bg-surface">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-text">Send us a Message</h2>
                <p className="text-muted mt-1 font-medium">Fields marked with an asterisk (*) are required.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Your Name *</label>
                    <Input
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-background border-border text-text placeholder-muted focus:bg-surface transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wider">Email Address *</label>
                    <Input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="bg-background border-border text-text placeholder-muted focus:bg-surface transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Subject *</label>
                  <Input
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="bg-background border-border text-text placeholder-muted focus:bg-surface transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-wider">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border text-text rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-muted"
                    placeholder="Tell us more about your needs..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                  <div className="flex items-center text-muted text-sm gap-2 font-medium">
                    <ShieldCheck className="h-4 w-4 text-success-500" />
                    We value your privacy.
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-6 rounded-xl bg-primary-600 hover:bg-primary-500 shadow-glow-primary text-text active:scale-95 transition-all"
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
                <Card key={i} className="p-6 border border-border shadow-adventure bg-surface hover:bg-secondary-800 transition-colors">
                  <h3 className="font-black text-text mb-2">{faq.q}</h3>
                  <p className="text-muted text-sm leading-relaxed font-medium">{faq.a}</p>
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