/**
 * How It Works Section - 3-step visual flow: Discover → Join → Win
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiSearch, BiRocketTakeoff, BiTrophy } from 'bootstrap-icons/react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover',
      description: 'Browse tournaments, find teams, and explore the gaming community. Use our AI-powered matchmaking to find perfect teammates.',
      icon: BiSearch,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      number: '02',
      title: 'Join',
      description: 'Sign up in seconds, create your profile, and join tournaments or teams. Connect with players through GamerLink.',
      icon: BiRocketTakeoff,
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: '03',
      title: 'Win',
      description: 'Compete in tournaments, track your stats with AI insights, climb leaderboards, and dominate the arena.',
      icon: BiTrophy,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-purple via-pink-400 to-orange-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Get started in three simple steps. Join thousands of gamers competing on VinVerse.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-12"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative"
            >
              {/* Connection Line (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-neon-purple/50 to-transparent z-0" style={{ width: 'calc(100% - 4rem)' }} />
              )}
              
              <div className="glass rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-neon-purple/50 transition-all relative z-10 h-full flex flex-col">
                {/* Step Number */}
                <div className={`text-6xl sm:text-7xl font-black mb-4 bg-gradient-to-r ${step.color} bg-clip-text text-transparent opacity-20`}>
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="text-5xl sm:text-6xl mb-4 flex items-center justify-center">
                  <step.icon className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-white/70 text-base sm:text-lg leading-relaxed flex-grow">
                  {step.description}
                </p>
                
                {/* Decorative gradient */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg text-lg sm:text-xl font-semibold glow-button shadow-2xl min-h-[48px] min-w-[200px]"
              aria-label="Get Started - Join VinVerse Now"
            >
              Get Started Now <BiRocketTakeoff className="inline ml-1" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

