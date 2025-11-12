/**
 * Testimonials Section - Social proof with featured gamers and testimonials
 */
import { motion } from 'framer-motion';
import { BiJoystick, BiTrophy, BiLightning, BiFire, BiStar } from 'bootstrap-icons/react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Raj "ProGamer" Kumar',
      role: 'BGMI Pro Player',
      rating: 5,
      text: 'VinVerse transformed how I find teammates. The AI matchmaking is incredible - found my perfect squad in days!',
      avatar: BiJoystick,
      game: 'BGMI',
    },
    {
      name: 'Priya "Valkyrie" Sharma',
      role: 'Valorant Champion',
      rating: 5,
      text: 'The tournament system is smooth and the community is amazing. Won my first tournament here!',
      avatar: BiTrophy,
      game: 'Valorant',
    },
    {
      name: 'Arjun "Shadow" Patel',
      role: 'Free Fire Streamer',
      rating: 5,
      text: 'Best platform for competitive gaming in India. The AI insights help me improve my gameplay every day.',
      avatar: BiLightning,
      game: 'Free Fire',
    },
    {
      name: 'Sneha "Phoenix" Reddy',
      role: 'CS:GO Team Captain',
      rating: 5,
      text: 'Team Finder feature is a game-changer. Built a competitive team that qualified for regionals!',
      avatar: BiFire,
      game: 'CS:GO',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Players' },
    { number: '500+', label: 'Tournaments' },
    { number: '2K+', label: 'Teams Created' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
            Loved by Gamers
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Join thousands of players who are already competing and winning on VinVerse
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="glass rounded-xl p-4 sm:p-6 text-center border border-neon-purple/30"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-neon-purple/50 transition-all"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <BiStar key={i} className="text-yellow-400 text-lg fill-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="text-4xl flex items-center justify-center w-12 h-12">
                  <testimonial.avatar className="w-full h-full" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-lg">{testimonial.name}</div>
                  <div className="text-white/60 text-sm">{testimonial.role}</div>
                  <div className="text-neon-purple text-sm mt-1">• {testimonial.game}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

