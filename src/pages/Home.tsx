import { motion } from 'framer-motion';
import { ArrowRight, Download, Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-image.jpg';

const Home = () => {
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
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.h1
                variants={itemVariants}
                className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
              >
                Hi, I'm{' '}
                <span className="text-gradient">Sydney Kamau</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-muted-foreground mb-8 leading-relaxed"
              >
                Full-Stack Developer specializing in{' '}
                <span className="text-primary font-semibold">AI Integration</span> and{' '}
                <span className="text-primary font-semibold">Automation</span>.
                I build scalable solutions that transform businesses and streamline workflows.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Button asChild size="lg" className="shadow-glow">
                  <Link to="/projects">
                    View Projects <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">
                    Contact Me <Mail className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4"
              >
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/surturn" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://www.linkedin.com/in/sydney-kamau-991b362a2" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://www.instagram.com/sydneystechhub" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <a href="/SydneyKamauResume.docx" download>
                    <Download className="h-4 w-4 mr-2" />
                    Resume
                  </a>
                </Button>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="Developer workspace showcasing modern development environment"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: '5+', label: 'Projects Delivered' },
              { number: '5+', label: 'Years Experience' },
              { number: '15+', label: 'Technologies' },
              { number: '5+', label: 'Happy Clients' },
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Specializations Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">My Specializations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Combining modern development practices with cutting-edge AI to deliver exceptional results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Full-Stack Development',
                description: 'React, Node.js, Python, and modern frameworks to build scalable applications',
                icon: '🚀',
              },
              {
                title: 'AI Integration',
                description: 'Implementing AI APIs, machine learning models, and intelligent automation',
                icon: '🤖',
              },
              {
                title: 'Process Automation',
                description: 'Streamlining workflows and building efficient systems that save time and resources',
                icon: '⚡',
              },
            ].map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-glow transition-all duration-300">
                  <div className="text-4xl mb-4">{spec.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{spec.title}</h3>
                  <p className="text-muted-foreground">{spec.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
