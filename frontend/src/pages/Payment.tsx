import { motion } from 'framer-motion';

const Payment = () => {

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} className="container mx-auto px-4 py-6 mt-16 lg:mt-10">
      <div
        className="max-w-lg mx-auto  rounded-lg  p-4 text-center"
      >
      <p className="text-primary text-center italic text-sm">
          ( Note : We don't offer delivery services from this website, and this page is just to aid you pay your outstanding payment REMOTELY )
        </p>
      </div>
      <div
        className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Scan to Pay</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Please scan the QR code below to complete your payment.
        </p>
        <div className="flex justify-center mb-8">
          <img
            src="https://res.cloudinary.com/domckasfk/image/upload/v1744503982/PhonePe_frqmxy.png"
            alt="QR Code"
            className="w-70 h-80 rounded-lg shadow-lg"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Thankyou for being our customer! Your support means the world to us.
        </p>
      </div>
    </motion.div>
  );
};

export default Payment;