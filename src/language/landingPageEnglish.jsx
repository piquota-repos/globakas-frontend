import React from 'react';
import { CheckCircle, Gift, Users } from 'lucide-react';

const LandingPageEnglishContent = {
  nav: {
    features: "Features",
    pricing: "Pricing",
    about: "About",
    login: "Login"
  },
  hero: {
    title: "Transform Your Business with Our Solution",
    subtitle: "Experience the power of seamless integration and real-time analytics.",
    emailPlaceholder: "Enter your work email",
    demoButton: "Request Demo"
  },
  features: {
    title: "Powerful Features",
    items: [
      {
        title: "Easy Integration",
        description: "Connect your systems in minutes with our plug-and-play solution",
        icon: <CheckCircle className="feature-icon" />
      },
      {
        title: "Real-time Analytics",
        description: "Get instant insights into your business performance",
        icon: <Gift className="feature-icon" />
      },
      {
        title: "24/7 Support",
        description: "Our expert team is always here to help you succeed",
        icon: <Users className="feature-icon" />
      }
    ]
  },
  pricing: {
    title: "Simple Pricing",
    plans: [
      {
        tier: "Starter",
        price: "$49",
        features: ["Basic Integration", "5 Users", "Community Support"]
      },
      {
        tier: "Professional",
        price: "$99",
        features: ["Advanced Integration", "Unlimited Users", "24/7 Support"]
      },
      {
        tier: "Enterprise",
        price: "Custom",
        features: ["Custom Integration", "Dedicated Support", "SLA Guarantee"]
      }
    ],
    button: "Get Started"
  },
  about: {
    title: "About Us",
    mission: {
      title: "Our Mission",
      text: "We're on a mission to transform how businesses manage their operations. With our innovative platform, we help companies of all sizes streamline their processes and achieve better results."
    },
    values: {
      title: "Our Values",
      items: ["Customer First", "Innovation", "Transparency", "Excellence"]
    }
  },
  cta: {
    title: "Ready to Get Started?",
    subtitle: "Join thousands of companies already using our platform to scale their business",
    button: "Schedule a Demo"
  }
};

export default LandingPageEnglishContent;
