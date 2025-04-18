import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheck, FaClipboard } from 'react-icons/fa';
import api from '../api/config';
import { toast } from 'react-hot-toast';

const Contact = () => {

  const [copied, setCopied] = useState(false);

  const phoneNumber = import.meta.env.VITE_RESTAURANT_PHONE;

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      toast.success("Phone number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy!");
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await api.post('/contact', formData);
    if (response.data.success) {
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } else {
      throw new Error(response.data.message || 'Failed to send message');
    }
  } catch (error: any) {
    // Optionally show a toast or error message
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="container mx-auto px-4 py-12 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-primary-600 mt-1 mr-4 text-xl" />
                <div>
                  <h3 className="font-medium dark:text-white">Our Location</h3>
                  <p className="text-gray-600 dark:text-gray-300">E/50, Varad Vinayak Lane, Bhoirpada, Gawad Wadi, Virar East<br />Virar, Maharashtra 401305</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaPhone className="text-primary-600 mt-1 mr-4 text-xl" />
                <div>
                  <h3 className="font-medium dark:text-white">Phone</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-gray-600 dark:text-gray-300 cursor-pointer select-all"
                      onClick={handleCopyPhone}
                      title="Copy phone number"
                    >
                      {phoneNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="ml-1 text-primary-600 hover:text-primary-800 focus:outline-none"
                      aria-label="Copy phone number"
                    >
                      {copied ? <FaCheck className="text-green-500" /> : <FaClipboard />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaEnvelope className="text-primary-600 mt-1 mr-4 text-xl" />
                <div>
                  <h3 className="font-medium dark:text-white">Email</h3>
                  <p className="text-gray-600 dark:text-gray-300"><a href={`https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=${import.meta.env.VITE_RESTAURANT_EMAIL}`} target='_blank' className="hover:text-primary dark:hover:text-primary hover:underline">{import.meta.env.VITE_RESTAURANT_EMAIL}</a></p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-primary-600 mt-1 mr-4 text-xl" />
                <div>
                  <h3 className="font-medium dark:text-white">Hours</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Day: 11am - 3pm<br />
                    Evening: 6pm - 11pm<br />
                    Remains opened all days of week
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Send us a Message</h2>
            
            {submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>Thank you for your message! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange} 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-200  dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <select 
                    id="subject" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-200 "
                  >
                    <option value="">Select a subject</option>
                    <option value="service">Related to Service</option>
                    <option value="website">Related to website</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea 
                    id="message" 
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-200 "
                  ></textarea>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border btn-primary border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-0 h-96 overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2972.067499818109!2d72.81431578145742!3d19.459299209669453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7a98f8d565f65%3A0x91ee8f78352f1a63!2sVarad%20Vinayak%20chinese%20fast%20food%20centre!5e0!3m2!1sen!2sin!4v1744992889271!5m2!1sen!2sin"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            aria-hidden="false" 
            title="Restaurant Location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact; 