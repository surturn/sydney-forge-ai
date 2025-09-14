import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Twitter,
  Calendar,
  MessageCircle,
  Clock
} from 'lucide-react';

const Contact = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      value: 'sydney.kamau@email.com',
      href: 'mailto:sydney.kamau@email.com',
      description: 'Best for detailed project discussions',
      color: 'text-blue-500',
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      value: '+254 700 123 456',
      href: 'tel:+254700123456',
      description: 'For urgent matters and quick calls',
      color: 'text-green-500',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'WhatsApp',
      value: '+254 700 123 456',
      href: 'https://wa.me/254700123456',
      description: 'Quick messages and updates',
      color: 'text-emerald-500',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Schedule Meeting',
      value: 'Book 30min call',
      href: '#',
      description: 'Free consultation session',
      color: 'text-purple-500',
    },
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github className="h-6 w-6" />,
      url: 'https://github.com',
      color: 'hover:text-gray-700',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-6 w-6" />,
      url: 'https://linkedin.com',
      color: 'hover:text-blue-600',
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-6 w-6" />,
      url: 'https://twitter.com',
      color: 'hover:text-blue-400',
    },
  ];

  const availability = [
    { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM EAT' },
    { day: 'Saturday', time: '10:00 AM - 2:00 PM EAT' },
    { day: 'Sunday', time: 'Emergency only' },
  ];

  const services = [
    'Full-Stack Web Development',
    'AI Integration & Automation',
    'API Development & Integration',
    'Database Design & Optimization',
    'DevOps & Cloud Deployment',
    'Technical Consulting',
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Let's Work Together</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your ideas into reality? I'm here to help you build 
            innovative solutions that drive your business forward.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-semibold mb-8">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-glow transition-all duration-300 h-full">
                    <div className={`${method.color} mb-4`}>
                      {method.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {method.description}
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <a href={method.href} target="_blank" rel="noopener noreferrer">
                        {method.value}
                      </a>
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-6">Services I Offer</h3>
              <Card className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service, index) => (
                    <div key={service} className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Location */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">Location</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Nairobi, Kenya
              </p>
              <p className="text-sm text-muted-foreground">
                Available for remote work worldwide and local meetings in Nairobi.
              </p>
            </Card>

            {/* Availability */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">Availability</h3>
              </div>
              <div className="space-y-3">
                {availability.map((schedule, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{schedule.day}</span>
                    <span className="font-medium">{schedule.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Connect With Me</h3>
              <div className="space-y-3">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${social.color}`}
                  >
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      {social.icon}
                      <span className="ml-3">{social.name}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium">Within 24 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects Completed</span>
                  <span className="font-medium">50+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Client Satisfaction</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Years Experience</span>
                  <span className="font-medium">5+</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="p-8 bg-accent/50">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start Your Project?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you have a clear vision or just an idea, I'm here to help you 
              turn it into a successful digital solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:sydney.kamau@email.com">
                  Send Email <Mail className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/projects">
                  View My Work
                </a>
              </Button>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Contact;