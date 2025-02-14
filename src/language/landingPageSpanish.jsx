import React from 'react';
import { CheckCircle,  Gift, Users } from 'lucide-react';

const LandingPageSpanishContent = {
  nav: {
    features: "Características",
    pricing: "Precios",
    about: "Nosotros",
    login: "acceso"
  },
  hero: {
    title: "Transforma tu Negocio con Nuestra Solución",
    subtitle: "Experimenta el poder de la integración perfecta y el análisis en tiempo real.",
    emailPlaceholder: "Ingresa tu correo electrónico",
    demoButton: "Solicitar Demo"
  },
  features: {
    title: "Características Poderosas",
    items: [
      {
        title: "Integración Fácil",
        description: "Conecta tus sistemas en minutos con nuestra solución plug-and-play",
        icon: <CheckCircle className="feature-icon" />
      },
      {
        title: "Análisis en Tiempo Real",
        description: "Obtén información instantánea sobre el rendimiento de tu negocio",
        icon: <Gift className="feature-icon" />
      },
      {
        title: "Soporte 24/7",
        description: "Nuestro equipo de expertos está siempre aquí para ayudarte a tener éxito",
        icon: <Users className="feature-icon" />
      }
    ]
  },
  pricing: {
    title: "Precios Simples",
    plans: [
      {
        tier: "Inicial",
        price: "$49",
        features: ["Integración Básica", "5 Usuarios", "Soporte Comunitario"]
      },
      {
        tier: "Profesional",
        price: "$99",
        features: ["Integración Avanzada", "Usuarios Ilimitados", "Soporte 24/7"]
      },
      {
        tier: "Empresarial",
        price: "Personalizado",
        features: ["Integración Personalizada", "Soporte Dedicado", "Garantía SLA"]
      }
    ],
    button: "Comenzar"
  },
  about: {
    title: "Sobre Nosotros",
    mission: {
      title: "Nuestra Misión",
      text: "Nuestra misión es transformar la forma en que las empresas gestionan sus operaciones. Con nuestra plataforma innovadora, ayudamos a empresas de todos los tamaños a optimizar sus procesos y lograr mejores resultados."
    },
    values: {
      title: "Nuestros Valores",
      items: ["Cliente Primero", "Innovación", "Transparencia", "Excelencia"]
    }
  },
  cta: {
    title: "¿Listo para Empezar?",
    subtitle: "Únete a miles de empresas que ya utilizan nuestra plataforma para escalar su negocio",
    button: "Programar Demo"
  }
};

export default LandingPageSpanishContent;
