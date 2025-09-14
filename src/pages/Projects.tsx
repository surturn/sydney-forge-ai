import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Play } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'AI-Powered E-commerce Platform',
      description: 'Full-stack e-commerce solution with AI-driven product recommendations, automated inventory management, and intelligent customer support chatbot.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      technologies: ['React', 'Node.js', 'OpenAI API', 'PostgreSQL', 'Stripe'],
      liveUrl: '#',
      githubUrl: '#',
      featured: true,
    },
    {
      title: 'Automated Content Management System',
      description: 'CMS with AI content generation, automated SEO optimization, and smart content scheduling. Reduces content creation time by 70%.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      technologies: ['Next.js', 'TypeScript', 'Supabase', 'LangChain', 'TailwindCSS'],
      liveUrl: '#',
      githubUrl: '#',
      featured: true,
    },
    {
      title: 'Smart Analytics Dashboard',
      description: 'Real-time analytics platform with predictive insights, automated reporting, and AI-powered data visualization for business intelligence.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      technologies: ['React', 'Python', 'FastAPI', 'TensorFlow', 'D3.js'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false,
    },
    {
      title: 'Workflow Automation Suite',
      description: 'Complete automation platform that connects various business tools, automates repetitive tasks, and provides intelligent workflow optimization.',
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop',
      technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Docker', 'Zapier API'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false,
    },
    {
      title: 'AI Chat Application',
      description: 'Real-time chat application with AI moderators, smart translation, sentiment analysis, and automated customer support features.',
      image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop',
      technologies: ['React Native', 'Socket.io', 'OpenAI API', 'Express.js', 'Redis'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false,
    },
    {
      title: 'Predictive Maintenance System',
      description: 'IoT-based system that predicts equipment failures, schedules maintenance automatically, and optimizes operational efficiency using ML algorithms.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
      technologies: ['Python', 'Django', 'TensorFlow', 'AWS IoT', 'PostgreSQL'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false,
    },
  ];

  const featuredProjects = projects.filter(p => p.featured);
  const otherProjects = projects.filter(p => !p.featured);

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
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A showcase of my work in full-stack development, AI integration, and automation. 
            Each project demonstrates my ability to solve complex problems with innovative solutions.
          </p>
        </motion.div>

        {/* Featured Projects */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-semibold mb-8">Featured Projects</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Other Projects */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold mb-8">Other Projects</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {otherProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 group h-full">
                  <div className="relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Demo
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3 mr-1" />
                          Code
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <Card className="p-8 bg-accent/50">
            <h3 className="text-2xl font-semibold mb-4">Interested in Working Together?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              I'm always excited to take on new challenges and bring innovative ideas to life. 
              Let's discuss how we can create something amazing together.
            </p>
            <Button size="lg" asChild>
              <a href="/contact">
                Start a Project <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Projects;
