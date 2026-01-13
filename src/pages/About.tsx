import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const About = () => {
  const techStack = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 'Express.js',
    'PostgreSQL', 'MongoDB', 'Supabase', 'AWS', 'Docker', 'Git',
    'OpenAI API', 'Langchain', 'TensorFlow', 'Pandas', 'FastAPI', 'Django'
  ];

  const experience = [
    {
      title: 'Freelance Full-Stack Developer',
      company: 'Sydney\'s Hub',
      period: '2024 - Present',
      description: 'Delivering websites, automation systems, and AI-powered solutions for clients. Built custom web solutions using React and Supabase/Firebase, automated business processes using N8N workflows.',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: 'AI in the Workplace Simulation',
      company: 'Datacom (Forage)',
      period: 'December 2024',
      description: 'Partnered with generative AI tools for research, design, and debugging. Created client-ready reports and presentations, diagnosed website issues through AI-guided troubleshooting.',
      icon: <Briefcase className="h-5 w-5" />,
    },
  ];

  const education = [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Multimedia University of Kenya',
      period: '2024 - Present',
      description: 'Currently pursuing degree with focus on software engineering and AI/ML systems.',
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      degree: 'Certificate in Web & App Full Stack Development',
      institution: 'Emobilis Technical Institute',
      period: '2024',
      description: 'Completed comprehensive full-stack development program covering modern web technologies.',
      icon: <GraduationCap className="h-5 w-5" />,
    },
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
          <h1 className="text-4xl font-bold mb-4">About Me</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Passionate about creating innovative solutions that bridge the gap between
            traditional development and cutting-edge AI technology.
          </p>
        </motion.div>

        {/* Bio Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold mb-4">My Journey</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    I'm a passionate full-stack developer with over 5 years of experience
                    building web applications that solve real-world problems. My journey
                    began with traditional web development, but I quickly became fascinated
                    by the potential of AI and automation.
                  </p>
                  <p>
                    Today, I specialize in integrating AI capabilities into modern applications,
                    creating intelligent systems that not only function well but truly enhance
                    user experiences. From chatbots and recommendation systems to automated
                    workflows and data analysis tools, I love exploring the intersection of
                    code and intelligence.
                  </p>
                  <p>
                    When I'm not coding, you'll find me exploring the latest AI research,
                    contributing to open-source projects, or mentoring aspiring developers.
                    I believe in the power of technology to create positive change in the world.
                    I'm always looking for new opportunities to learn and grow, so feel free to
                    reach out if you have any questions or would like to collaborate on a project.
                    Outside of tech, I'm a big football fan and competitive FIFA player and overall gamer—because strategy, optimization, and decision-making don't stop at code.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <span>Available for projects</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Briefcase className="h-5 w-5 mr-3 text-primary" />
                  <span>5+ years experience</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-8 text-center">Technology Stack</h2>
          <Card className="p-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Badge variant="secondary" className="text-sm py-2 px-4">
                    {tech}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Experience & Education */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Experience */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold mb-8">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-primary mt-1">
                      {exp.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <p className="text-primary font-medium">{exp.company}</p>
                      <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                      <p className="text-muted-foreground">{exp.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Education */}
          <motion.section
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold mb-8">Education</h2>
            <div className="space-y-6">
              {education.map((edu, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-primary mt-1">
                      {edu.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-primary font-medium">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground mb-2">{edu.period}</p>
                      <p className="text-muted-foreground">{edu.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default About;