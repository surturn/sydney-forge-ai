import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Code2,
  Database,
  Bot,
  Cloud,
  Smartphone,
  Zap,
  Globe,
  GitBranch
} from 'lucide-react';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend Development',
      icon: <Code2 className="h-6 w-6" />,
      color: 'text-blue-500',
      skills: [
        { name: 'React/Next.js', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'Tailwind CSS', level: 95 },
        { name: 'Vue.js', level: 80 },
        { name: 'JavaScript (ES6+)', level: 95 },
      ],
    },
    {
      title: 'Backend Development',
      icon: <Database className="h-6 w-6" />,
      color: 'text-green-500',
      skills: [
        { name: 'Node.js/Express', level: 90 },
        { name: 'Python/Django', level: 85 },
        { name: 'FastAPI', level: 88 },
        { name: 'PostgreSQL', level: 85 },
        { name: 'MongoDB', level: 80 },
      ],
    },
    {
      title: 'AI & Machine Learning',
      icon: <Bot className="h-6 w-6" />,
      color: 'text-purple-500',
      skills: [
        { name: 'OpenAI API Integration', level: 95 },
        { name: 'LangChain', level: 90 },
        { name: 'TensorFlow', level: 75 },
        { name: 'Pandas/NumPy', level: 85 },
        { name: 'Hugging Face', level: 80 },
      ],
    },
    {
      title: 'Cloud & DevOps',
      icon: <Cloud className="h-6 w-6" />,
      color: 'text-orange-500',
      skills: [
        { name: 'AWS/EC2/S3', level: 85 },
        { name: 'Docker', level: 80 },
        { name: 'Vercel/Netlify', level: 90 },
        { name: 'Supabase', level: 92 },
        { name: 'CI/CD', level: 75 },
      ],
    },
    {
      title: 'Mobile Development',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'text-pink-500',
      skills: [
        { name: 'React Native', level: 80 },
        { name: 'Flutter', level: 70 },
        { name: 'PWA Development', level: 85 },
        { name: 'Mobile UI/UX', level: 82 },
      ],
    },
    {
      title: 'Automation & Tools',
      icon: <Zap className="h-6 w-6" />,
      color: 'text-yellow-500',
      skills: [
        { name: 'Process Automation', level: 90 },
        { name: 'API Development', level: 95 },
        { name: 'Web Scraping', level: 85 },
        { name: 'Workflow Optimization', level: 88 },
      ],
    },
  ];

  const tools = [
    'VS Code', 'Git', 'GitHub', 'Postman', 'Figma', 'Notion',
    'Slack', 'Jira', 'Linear', 'Sentry', 'Analytics', 'Stripe'
  ];

  const certifications = [
    'President\'s Award Kenya - Gold Level',
    'Full Stack Development - Emobilis',
    'AI in the Workplace - Datacom',
    'Python Developer Certificate',
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
          <h1 className="text-4xl font-bold mb-4">Skills & Expertise</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive overview of my technical capabilities and
            the technologies I use to build exceptional digital experiences.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-glow transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className={`${category.color} mr-3`}>
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                </div>

                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tools & Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tools & Technologies</h2>
            <p className="text-muted-foreground">
              Daily tools and technologies I work with to deliver efficient solutions
            </p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-primary mb-2">
                    <Globe className="h-6 w-6 mx-auto" />
                  </div>
                  <span className="text-sm font-medium">{tool}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Certifications */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
            <p className="text-muted-foreground">
              Professional certifications that validate my expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "President's Award Kenya - Gold Level",
                image: "/certificates/President's Award.png",
                issuer: "Awarded by H.E. President William Ruto",
                date: "October 2024"
              },
              {
                name: "Full Stack Software Development",
                image: "/certificates/eMoblis Fullstack.jpg",
                issuer: "Emobilis Technical Institute",
                date: "November 2024"
              },
              {
                name: "AI in the Workplace - Datacom",
                image: "/certificates/Datacom certificate.jpg",
                issuer: "Datacom via Forage",
                date: "December 2025"
              },
              {
                name: "Python Developer",
                image: "/certificates/Python Developer_certificate.jpg",
                issuer: "Sololearn",
                date: "November 2025"
              },
            ].map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cert.image}
                      alt={cert.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    <Badge variant="secondary" className="mt-2">
                      {cert.date}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Skills;