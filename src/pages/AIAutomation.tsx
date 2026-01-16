import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Zap,
  Brain,
  Workflow,
  MessageSquare,
  BarChart3,
  Clock,
  Target,
  ArrowRight
} from 'lucide-react';

const AIAutomation = () => {
  const capabilities = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AI Chatbots & Assistants',
      description: 'Intelligent conversational AI that understands context, learns from interactions, and provides personalized responses.',
      features: ['Natural Language Processing', 'Context Awareness', 'Multi-language Support', 'Custom Training'],
      color: 'text-blue-500',
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Machine Learning Integration',
      description: 'Custom ML models for prediction, classification, and pattern recognition tailored to your specific business needs.',
      features: ['Predictive Analytics', 'Image Recognition', 'Sentiment Analysis', 'Recommendation Systems'],
      color: 'text-purple-500',
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: 'Process Automation',
      description: 'Streamline repetitive tasks and complex workflows with intelligent automation that adapts and optimizes over time.',
      features: ['Workflow Optimization', 'Task Automation', 'API Integration', 'Smart Scheduling'],
      color: 'text-green-500',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Data Analysis & Insights',
      description: 'Transform raw data into actionable insights with AI-powered analytics and automated reporting systems.',
      features: ['Real-time Analytics', 'Automated Reports', 'Trend Analysis', 'Predictive Modeling'],
      color: 'text-orange-500',
    },
  ];

  const useCases = [
    {
      title: 'Customer Support Automation',
      description: 'AI-powered support system that handles 80% of customer inquiries automatically.',
      metrics: ['80% Query Resolution', '24/7 Availability', '60% Cost Reduction'],
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      title: 'Sales Process Optimization',
      description: 'Intelligent lead scoring and automated follow-up sequences that increase conversion rates.',
      metrics: ['45% More Leads', '30% Higher Conversion', 'Automated Follow-ups'],
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: 'Content Generation',
      description: 'AI-driven content creation for marketing, documentation, and social media.',
      metrics: ['70% Time Saved', 'Consistent Quality', 'Multi-format Output'],
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: 'Inventory Management',
      description: 'Predictive inventory system that prevents stockouts and reduces excess inventory.',
      metrics: ['95% Accuracy', '40% Less Overstock', 'Automated Reordering'],
      icon: <Clock className="h-6 w-6" />,
    },
  ];

  const technologies = [
    'OpenAI GPT Models', 'LangChain', 'TensorFlow', 'PyTorch', 'Hugging Face',
    'AutoML', 'Computer Vision', 'NLP Libraries', 'MLOps Tools', 'API Integrations'
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
          <h1 className="text-4xl font-bold mb-4">AI & Automation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Harness the power of artificial intelligence and automation to transform your business processes,
            reduce costs, and unlock new opportunities for growth.
          </p>
        </motion.div>

        {/* Core Capabilities */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-semibold text-center mb-12">Core Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-glow transition-all duration-300">
                  <div className={`${capability.color} mb-4`}>
                    {capability.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{capability.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {capability.description}
                  </p>
                  <div className="space-y-2">
                    {capability.features.map((feature) => (
                      <div key={feature} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Use Cases */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-semibold text-center mb-12">Real-World Applications</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:shadow-glow transition-all duration-300">
                  <div className="text-primary mb-4">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {useCase.description}
                  </p>
                  <div className="space-y-2">
                    {useCase.metrics.map((metric) => (
                      <Badge key={metric} variant="secondary" className="mr-2 mb-2">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-semibold text-center mb-8">AI Technologies & Tools</h2>
          <Card className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{tech}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>

        {/* Process */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-semibold text-center mb-12">My AI Implementation Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Discovery & Analysis',
                description: 'Understand your business needs and identify automation opportunities.',
              },
              {
                step: '02',
                title: 'Strategy Design',
                description: 'Create a comprehensive AI strategy tailored to your specific goals.',
              },
              {
                step: '03',
                title: 'Development & Integration',
                description: 'Build and integrate AI solutions with your existing systems.',
              },
              {
                step: '04',
                title: 'Optimization & Scaling',
                description: 'Monitor performance and continuously improve the AI systems.',
              },
            ].map((phase, index) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-glow transition-all duration-300">
                  <div className="text-3xl font-bold text-primary mb-4">{phase.step}</div>
                  <h3 className="text-lg font-semibold mb-3">{phase.title}</h3>
                  <p className="text-muted-foreground text-sm">{phase.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="p-8 bg-accent/50">
            <h3 className="text-2xl font-semibold mb-4">Ready to Automate Your Business?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's discuss how AI and automation can transform your operations,
              reduce costs, and accelerate your business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="https://calendly.com/sydneykamau2005" target="_blank" rel="noopener noreferrer">
                  Schedule Consultation <ArrowRight className="ml-2 h-5 w-5" />
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

export default AIAutomation;