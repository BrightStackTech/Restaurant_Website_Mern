import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaBriefcase, FaWhatsapp, FaEnvelope, FaGithub } from 'react-icons/fa';

const About = () => {
  const [showDevDialog, setShowDevDialog] = useState(false);
  return (
    <div className="container mx-auto px-4 py-12 mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">About {import.meta.env.VITE_RESTAURANT_NAME}</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="h-64 overflow-hidden">
            <img 
              src="/images/restaurant-interior.jpg" 
              alt="Restaurant Interior" 
              className="w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://res.cloudinary.com/domckasfk/image/upload/v1745098862/WhatsApp_Image_2025-04-20_at_01.12.41_e16022dd_fyqjub.jpg'; 
              }}
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Our Story</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Located in the vibrant heart of Virar East, {import.meta.env.VITE_RESTAURANT_NAME} Fast Food Centre is a cherished culinary haven where tradition meets innovation. Known for its commitment to quality ingredients, delightful flavors, and exceptional service, {import.meta.env.VITE_RESTAURANT_NAME} Fast Food Centre invites you to savor a dining experience like no other. 
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The restaurant’s interior is elegantly designed to provide a cozy yet refined ambiance, with warm lighting and tasteful decor that make every meal feel special. Whether you’re here for a quick bite or a leisurely gathering, the inviting atmosphere at {import.meta.env.VITE_RESTAURANT_NAME} Fast Food Centre ensures a memorable dining experience.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Our Philosophy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              At {import.meta.env.VITE_RESTAURANT_NAME}, we believe that great food brings people together. Our philosophy is centered around three core principles:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li className="mb-2"><span className="font-semibold">Quality ingredients</span>: We source the freshest, highest-quality ingredients from local suppliers whenever possible.</li>
              <li className="mb-2"><span className="font-semibold">Culinary craftsmanship</span>: Our chefs are dedicated to their craft, preparing each dish with care and attention to detail.</li>
              <li className="mb-2"><span className="font-semibold">Warm hospitality</span>: We strive to create a welcoming atmosphere where every guest feels like part of our family.</li>
            </ul>
          </div>
        </div>
 
        {/* <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">Meet Our Team</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our team consists of passionate food lovers dedicated to creating memorable dining experiences. From our skilled chefs to our attentive service staff, everyone plays a crucial role in bringing the {import.meta.env.VITE_RESTAURANT_NAME} vision to life.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We pride ourselves on fostering a collaborative environment where creativity flourishes, and where each team member's unique talents contribute to our shared success.
              </p>
            </div>
            <div className="h-full">
              <img 
                src="/images/chef-team.jpg" 
                alt="Our Chef Team" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1954&q=80'; 
                }}
              />
            </div>
          </div>
        </div> */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-10">
          <div className="p-6">
            <h2 className="lg:text-3xl text-2xl font-semibold mb-4 dark:text-white">Enjoyed surfing through our seamless website?</h2>
            <h2 className="lg:text-2xl text-xl font-semibold mb-4 dark:text-white">Want to know about our developer?</h2>
            <span>
              <button
                title="btn"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300"
                onClick={() => setShowDevDialog(true)}
              >
                Yes, want to know more!
              </button>
            </span>
          </div>
        </div>
      </motion.div>
      {showDevDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => setShowDevDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl"
              title="Close"
            >
              <FaTimes />
            </button>
            <div className="flex flex-col items-center p-6">
              <img
                src="https://res.cloudinary.com/domckasfk/image/upload/v1744755959/tzusm3fz2tpxevfke0ai.png"
                alt="BrightStack"
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-2xl font-bold mb-2 text-center text-black dark:text-white">Hi, call me BrightStack</h2>
              <p className="italic text-gray-500 text-center mb-6">
                A recently become graduate, fond of making amazing cool looking, dynamic websites using React.js, Node.js, Express.js and MongoDB. Currently unemployed and is in search for a Job.
              </p>
              <div className="flex flex-col space-y-3 w-full">
                <a
                  href="https://www.upwork.com/freelancers/~019553adae7272fc11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
                >
                  <FaBriefcase className="mr-2 text-green-400" /> Hire me, on upwork?
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=918928802932"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
                >
                  <FaWhatsapp className="mr-2" /> Talk to me directly?
                </a>
                <a
                  href="https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=brightstack.work.01@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  <FaEnvelope className="mr-2" /> Contact me on email?
                </a>
                <a
                  href="https://github.com/BrightStackTech?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-black transition"
                >
                  <FaGithub className="mr-2" /> Check my github repositories?
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About; 
