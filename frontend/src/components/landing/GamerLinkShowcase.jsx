/**
 * GamerLink Showcase - Teases upcoming features with icons and hover effects.
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BiCpu,
  BiTargetLock,
  BiChat,
  BiBarChart,
  BiArrowRight,
} from "bootstrap-icons/react";

const GamerLinkShowcase = () => {
  const features = [
    {
      title: "AI Insights Dashboard",
      description:
        "AI-powered match analysis, win predictions, and performance metrics",
      icon: BiCpu,
      gradient: "from-purple-500 to-pink-500",
      link: "/dashboard",
      status: "live",
    },
    {
      title: "Smart Matchmaking",
      description:
        "AI algorithm finds perfect teammates based on Elo, win rate, and synergy",
      icon: BiTargetLock,
      gradient: "from-blue-500 to-cyan-500",
      link: "/dashboard",
      status: "live",
    },
    {
      title: "Live Chat",
      description: "Real-time WebSocket communication with players",
      icon: BiChat,
      gradient: "from-green-500 to-emerald-500",
      link: "/dashboard",
      status: "live",
    },
    {
      title: "Leaderboards",
      description:
        "Animated rankings with tiers, badges, and competitive stats",
      icon: BiBarChart,
      gradient: "from-orange-500 to-red-500",
      link: "/dashboard",
      status: "live",
    },
  ];

  return (
    <section className="py-20 px-4 bg-black/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
            GamerLink Ecosystem
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Connect, compete, and conquer together. Your esports journey starts
            here.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Content = (
              <>
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
                <div className="mt-4 text-sm text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {feature.status === "live" ? (
                    <>
                      Available Now <BiArrowRight className="inline" />
                    </>
                  ) : (
                    <>
                      Coming Soon <BiArrowRight className="inline" />
                    </>
                  )}
                </div>
              </>
            );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className="glass rounded-xl p-6 border border-neon-purple/30 group cursor-pointer"
              >
                {feature.link && feature.status === "live" ? (
                  <Link
                    to={feature.link}
                    aria-label={`View ${feature.title}`}
                    className="block focus:outline-none focus:ring-4 focus:ring-neon-purple/50 rounded-xl"
                  >
                    {Content}
                  </Link>
                ) : (
                  <div className="block">{Content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GamerLinkShowcase;
