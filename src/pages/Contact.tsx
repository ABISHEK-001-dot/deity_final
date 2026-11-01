import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Send,
  CheckCircle2,
  Factory,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

export const Contact: React.FC = () => {
  const [inquiryType, setInquiryType] = useState<'general' | 'custom_bulk_order'>('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: subject || (inquiryType === 'custom_bulk_order' ? `Bulk Inquiry: ${quantity} units` : 'General Inquiry'),
          message,
          type: inquiryType,
          quantity: inquiryType === 'custom_bulk_order' ? Number(quantity) : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        showToast(data.message || 'Message sent to Madurai HQ!', 'success');
      } else {
        showToast(data.message || 'Failed to send message.', 'error');
      }
    } catch (err) {
      showToast('Error communicating with contact server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'Where are DEITY CAPS manufactured and shipped from?',
      a: 'All DEITY CAPS are manufactured, embroidered, and quality-inspected at our manufacturing plant in Keeranur Village, Thuvarangulam, Madurai district, Tamil Nadu (PIN: 625110). Orders are dispatched within 24-48 hours via premium express couriers across India.'
    },
    {
      q: 'What is the sizing and fit of DEITY CAPS?',
      a: 'Our snapbacks and strapbacks feature an adjustable perimeter of 54cm to 62cm (fits sizes XS through XXL). Our structured caps have an ergonomic 12cm crown height and pre-blocked visor.'
    },
    {
      q: 'What is the Minimum Order Quantity (MOQ) for custom advertising caps?',
      a: 'For custom advertising caps, corporate event merchandise, or college fests with 3D embroidery or digital transfer, our MOQ starts at just 25 units with tiered wholesale pricing up to 10,000+ units.'
    },
    {
      q: 'What is your exchange and return policy?',
      a: 'We offer an easy 7-day hassle-free exchange or return policy on all unworn retail caps with original tags intact.'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 border-b border-neutral-850 mb-12">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-amber-400 mb-2 block">
            MADURAI FACTORY & SUPPORT
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight">
            CONTACT DEITY CAPS
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mt-2">
            Have a question about an order or looking for custom advertising caps for your brand, college fest, or collective? Reach out directly.
          </p>
        </div>

        {/* 2-Column: Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Contact Details & Factory Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-850 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  MANUFACTURING PLANT & HEADQUARTERS
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  Deity Cap Facility
                </h3>
              </div>

              <div className="space-y-4 text-xs text-neutral-300">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm mb-1">Registered Factory Address</strong>
                    <p className="text-neutral-400 leading-relaxed">
                      Door No 206, Keeranur Village School, K. Valayarpatti, Keeranur, Thuvarangulam, Madurai-625110, Tamil Nadu, India
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-bold">Direct Phone / WhatsApp</span>
                    <a href="tel:+919843566994" className="text-white text-sm font-bold font-mono hover:text-amber-400 transition-colors">
                      +91 98435 66994
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-bold">Official Email</span>
                    <a href="mailto:deitycap@gmail.com" className="text-white text-sm font-bold hover:text-amber-400 transition-colors">
                      deitycap@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <Instagram className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-bold">Official Instagram</span>
                    <a
                      href="https://instagram.com/deity_advertisingcaps_1"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white text-sm font-bold hover:text-amber-400 transition-colors"
                    >
                      @deity_advertisingcaps_1
                    </a>
                  </div>
                </div>
              </div>

              {/* Madurai Dispatch Notice */}
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center gap-2">
                <Factory className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Operating Monday to Saturday: 9:00 AM – 7:30 PM IST</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-850">
              {/* Type Switcher */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800 mb-6">
                <button
                  type="button"
                  onClick={() => setInquiryType('general')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    inquiryType === 'general'
                      ? 'bg-white text-neutral-950 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  General Support
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryType('custom_bulk_order')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    inquiryType === 'custom_bulk_order'
                      ? 'bg-amber-400 text-neutral-950 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Custom & Bulk Inquiries
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-black text-2xl text-white uppercase">
                    Message Received
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                    Thank you for contacting DEITY CAPS. A representative from our Madurai office will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName('');
                      setEmail('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold uppercase"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98400 00000"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {inquiryType === 'custom_bulk_order' ? (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Estimated Quantity (Caps)
                        </label>
                        <select
                          value={quantity}
                          onChange={e => setQuantity(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="25">25 – 50 caps (Starter / Fest batch)</option>
                          <option value="100">100 – 250 caps (Brand launch)</option>
                          <option value="500">500 – 1,000 caps (Wholesale)</option>
                          <option value="2500">2,500+ caps (Industrial / Enterprise)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="Order status, cap sizing..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      {inquiryType === 'custom_bulk_order'
                        ? 'Project Details / Logo Requirements / Deadline *'
                        : 'Your Message *'}
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={
                        inquiryType === 'custom_bulk_order'
                          ? 'Describe your desired cap style (snapback, trucker, dad cap), embroidery preferences (3D puff, flat), colors, and timeline...'
                          : 'How can our team help you?'
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'TRANSMITTING...' : 'SEND INQUIRY'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto pt-12 border-t border-neutral-850">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1 block">
              FREQUENTLY ASKED
            </span>
            <h3 className="font-display font-bold text-2xl uppercase text-white">
              Cap Sizing, Shipping & Wholesale
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-neutral-900/40 border border-neutral-850 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
