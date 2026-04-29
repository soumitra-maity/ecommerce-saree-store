// src/app/(store)/contact/page.tsx
"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Send, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactFormAction } from "@/server/actions.contact";

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(contactFormAction, { 
    success: false, 
    error: "",
    message: "" 
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Get in Touch</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have questions about our sarees, orders, or customizations? We're here to help!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        
        {/* Contact Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-gray-900">Send us a Message</h2>
          
          <form action={formAction} className="space-y-5">
            {state.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                ✅ {state.message}
              </div>
            )}
            
            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                ❌ {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input id="name" name="name" required placeholder="Anjali Verma" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" required placeholder="anjali@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" name="subject" required placeholder="Question about Banarasi Saree" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea 
                id="message" 
                name="message" 
                required 
                rows={5} 
                placeholder="Tell us how we can help..." 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
            <h3 className="font-bold text-lg text-rose-900 mb-4">🕐 Business Hours</h3>
            <ul className="space-y-2 text-sm text-rose-800">
              <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Mon–Sat: 10:00 AM – 8:00 PM IST</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Sunday: 11:00 AM – 6:00 PM IST</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Festival Seasons: Extended Hours</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-rose-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Email Us</p>
                <a href="mailto:hello@ethnicsaree.com" className="text-sm text-gray-600 hover:text-rose-600">
                  hello@ethnicsaree.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-rose-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Call / WhatsApp</p>
                <a href="tel:+919876543210" className="text-sm text-gray-600 hover:text-rose-600">
                  +91 98765 43210
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-rose-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Visit Us</p>
                <p className="text-sm text-gray-600">
                  123 Handloom Street, Varanasi<br />
                  Uttar Pradesh, India – 221001
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">❓ Quick Answers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <strong>Shipping:</strong> Free above ₹999, 3–7 days delivery</li>
              <li>• <strong>Returns:</strong> 7-day easy returns on unworn items</li>
              <li>• <strong>Customization:</strong> WhatsApp us for bespoke orders</li>
            </ul>
            <a href="/collection" className="inline-block mt-3 text-sm font-medium text-rose-600 hover:text-rose-700">
              Browse Collection →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}