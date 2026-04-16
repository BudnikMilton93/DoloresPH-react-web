export type Language = 'es' | 'en' | 'pt';

export interface Translations {
  nav: {
    about: string;
    portfolio: string;
    essays: string;
    services: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    viewPortfolio: string;
    getInTouch: string;
  };
  about: {
    eyebrow: string;
    yearsLabel: string;
    sessionsLabel: string;
    awardsLabel: string;
  };
  portfolio: {
    eyebrow: string;
    title: string;
    filterAll: string;
  };
  essays: {
    eyebrow: string;
    title: string;
  };
  services: {
    eyebrow: string;
    title: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submit: string;
    successTitle: string;
    successSub: string;
  };
  footer: {
    copyright: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      about: 'Sobre mí',
      portfolio: 'Portfolio',
      essays: 'Ensayos',
      services: 'Servicios',
      contact: 'Contacto',
    },
    hero: {
      eyebrow: 'Fotografía & Narrativa Visual',
      viewPortfolio: 'Ver Portfolio',
      getInTouch: 'Contactar',
    },
    about: {
      eyebrow: 'Acerca de mí',
      yearsLabel: 'Años de experiencia',
      sessionsLabel: 'Sesiones completadas',
      awardsLabel: 'Fotografías capturadas',
    },
    portfolio: {
      eyebrow: 'Trabajo',
      title: 'Portfolio',
      filterAll: 'Todas',
    },
    essays: {
      eyebrow: 'Historias',
      title: 'Ensayos Fotográficos',
    },
    services: {
      eyebrow: 'Lo que ofrezco',
      title: 'Servicios',
    },
    testimonials: {
      title: 'Lo que dicen mis clientes',
      subtitle: 'Comentarios obtenidos de Instagram',
    },
    contact: {
      eyebrow: 'Conectemos',
      title: 'Hablemos',
      description:
        'Me encantaría escuchar sobre tu proyecto. Ya sea una boda, sesión de retratos, una aventura en la naturaleza o una colaboración creativa — creemos algo hermoso juntos. También disfruto capturar paisajes y la belleza del mundo natural.',
      namePlaceholder: 'Tu Nombre',
      emailPlaceholder: 'Tu Email',
      messagePlaceholder: 'Tu Mensaje',
      submit: 'Enviar Mensaje',
      successTitle: '¡Gracias!',
      successSub: 'Me pongo en contacto pronto.',
    },
    footer: {
      copyright: '© {year} Dolores Photography. Todos los derechos reservados.',
    },
  },

  en: {
    nav: {
      about: 'About',
      portfolio: 'Portfolio',
      essays: 'Essays',
      services: 'Services',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Photography & Visual Storytelling',
      viewPortfolio: 'View Portfolio',
      getInTouch: 'Get in Touch',
    },
    about: {
      eyebrow: 'About Me',
      yearsLabel: 'Years of experience',
      sessionsLabel: 'Completed sessions',
      awardsLabel: 'Captured photographs',
    },
    portfolio: {
      eyebrow: 'Work',
      title: 'Portfolio',
      filterAll: 'All',
    },
    essays: {
      eyebrow: 'Stories',
      title: 'Photo Essays',
    },
    services: {
      eyebrow: 'What I Offer',
      title: 'Services',
    },
    testimonials: {
      title: 'What my clients say',
      subtitle: 'Reviews from Instagram',
    },
    contact: {
      eyebrow: "Let's Connect",
      title: 'Get in Touch',
      description:
        "I'd love to hear about your project. Whether it's a wedding, portrait session, a nature adventure, or a creative collaboration — let's create something beautiful together. I also enjoy capturing landscapes and the beauty of the natural world.",
      namePlaceholder: 'Your Name',
      emailPlaceholder: 'Your Email',
      messagePlaceholder: 'Your Message',
      submit: 'Send Message',
      successTitle: 'Thank you!',
      successSub: "I'll be in touch soon.",
    },
    footer: {
      copyright: '© {year} Dolores Photography. All rights reserved.',
    },
  },

  pt: {
    nav: {
      about: 'Sobre',
      portfolio: 'Portfolio',
      essays: 'Ensaios',
      services: 'Serviços',
      contact: 'Contato',
    },
    hero: {
      eyebrow: 'Fotografia & Narrativa Visual',
      viewPortfolio: 'Ver Portfolio',
      getInTouch: 'Entrar em Contato',
    },
    about: {
      eyebrow: 'Sobre mim',
      yearsLabel: 'Anos de experiência',
      sessionsLabel: 'Sessões concluídas',
      awardsLabel: 'Fotografias capturadas',
    },
    portfolio: {
      eyebrow: 'Trabalho',
      title: 'Portfolio',
      filterAll: 'Todas',
    },
    essays: {
      eyebrow: 'Histórias',
      title: 'Ensaios Fotográficos',
    },
    services: {
      eyebrow: 'O que ofereço',
      title: 'Serviços',
    },
    testimonials: {
      title: 'O que dizem meus clientes',
      subtitle: 'Comentários do Instagram',
    },
    contact: {
      eyebrow: 'Vamos conversar',
      title: 'Entre em Contato',
      description:
        'Adoraria ouvir sobre o seu projeto. Seja um casamento, sessão de retratos, uma aventura na natureza ou uma colaboração criativa — vamos criar algo lindo juntos. Também adoro capturar paisagens e a beleza do mundo natural.',
      namePlaceholder: 'Seu Nome',
      emailPlaceholder: 'Seu Email',
      messagePlaceholder: 'Sua Mensagem',
      submit: 'Enviar Mensagem',
      successTitle: 'Obrigada!',
      successSub: 'Entrarei em contato em breve.',
    },
    footer: {
      copyright: '© {year} Dolores Photography. Todos os direitos reservados.',
    },
  },
};
