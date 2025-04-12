export type Translations = {
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
    change: string;
    download: string;
    send: string;
  };
  auth: {
    login: string;
    register: string;
    forgotPassword: string;
  };
  navigation: {
    dashboard: string;
    works: string;
    rdos: string;
    team: string;
    analyses: string;
    settings: string;
    plans: string;
    tutorial: string;
    support: string;
    logout: string;
  };
  rdoPage: {
    title: string;
    basicInfo: string;
    project: string;
    date: string;
    weather: string;
    morning: string;
    afternoon: string;
    evening: string;
    idleHours: string;
    hours: string;
    team: string;
    managers: string;
    administrators: string;
    collaborators: string;
    totalTeam: string;
    activities: string;
    activity: string;
    description: string;
    progress: string;
    extraActivity: string;
    extraActivityName: string;
    accidents: string;
    accidentDescription: string;
    injuredCount: string;
    equipment: string;
    equipmentDescription: string;
    idleHoursEquipment: string;
    responsible: string;
    weather_forecast: string;
    local: string;
    precipitation: string;
    wind: string;
    share: string;
    sendWhatsApp: string;
    sendEmail: string;
    saveRDO: string;
  };
  workPage: {
    title: string;
    newWork: string;
    search: string;
    status: string;
    all: string;
    active: string;
    completed: string;
    noWorks: string;
    addWork: string;
  };
  teamPage: {
    title: string;
    newMember: string;
    name: string;
    role: string;
    rdosGenerated: string;
    managers: string;
    administrators: string;
    collaborators: string;
    language: string;
    selectLanguage: string;
  };
  locationModal: {
    detected: string;
    confirm: string;
    change: string;
    select: string;
    save: string;
    selectCountry: string;
    whereAreYou: string;
  };
  supportPage: {
    title: string;
    contactSupport: string;
    jumpToTopic: string;
    topics: {
      workManagement: string;
      rdos: string;
      plansAndPayment: string;
      technicalFeatures: string;
      supportAndGeneral: string;
    };
    faq: {
      // Work Management
      howToRegisterWork: {
        question: string;
        answer: string;
      };
      howToAddPhotos: {
        question: string;
        answer: string;
      };
      canRegisterAccidents: {
        question: string;
        answer: string;
      };
      // RDOs
      whatIsRDO: {
        question: string;
        answer: string;
      };
      shareRDO: {
        question: string;
        answer: string;
      };
      editRDO: {
        question: string;
        answer: string;
      };
      // Plans and Payment
      changePlan: {
        question: string;
        answer: string;
      };
      paymentMethods: {
        question: string;
        answer: string;
      };
      cancelPlan: {
        question: string;
        answer: string;
      };
      // Technical Features
      offlineMode: {
        question: string;
        answer: string;
      };
      aiIntegration: {
        question: string;
        answer: string;
      };
      multipleDevices: {
        question: string;
        answer: string;
      };
      changeLanguage: {
        question: string;
        answer: string;
      };
      // Support and General
      contactSupport: {
        question: string;
        answer: string;
      };
      forgotPassword: {
        question: string;
        answer: string;
      };
    };
  };
};

export const translations: Record<string, Translations> = {
  'pt-BR': {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Deletar',
      confirm: 'Confirmar',
      change: 'Alterar',
      download: 'Baixar',
      send: 'Enviar',
    },
    auth: {
      login: 'Entrar',
      register: 'Registrar',
      forgotPassword: 'Esqueceu a senha?',
    },
    navigation: {
      dashboard: 'Dashboard',
      works: 'Obras',
      rdos: 'RDOs',
      team: 'Equipe',
      analyses: 'Análises',
      settings: 'Configurações',
      plans: 'Planos',
      tutorial: 'Tutorial',
      support: 'Suporte',
      logout: 'Sair',
    },
    rdoPage: {
      title: 'Novo RDO',
      basicInfo: 'Informações Básicas',
      project: 'Projeto',
      date: 'Data',
      weather: 'Clima',
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
      idleHours: 'Horas Ociosas por Clima',
      hours: 'horas',
      team: 'Equipe Presente',
      managers: 'Gerentes',
      administrators: 'Administradores',
      collaborators: 'Colaboradores',
      totalTeam: 'Total de Colaboradores Presentes',
      activities: 'Atividades Realizadas',
      activity: 'Atividade',
      description: 'Descrição',
      progress: 'Progresso',
      extraActivity: 'Atividade Extra',
      extraActivityName: 'Nome da Atividade Extra',
      accidents: 'Registro de Acidentes',
      accidentDescription: 'Descrição do Acidente',
      injuredCount: 'Número de Feridos',
      equipment: 'Registro de Equipamentos',
      equipmentDescription: 'Descrição da Quebra/Manutenção',
      idleHoursEquipment: 'Horas Ociosas por Equipamento',
      responsible: 'Responsável pelo RDO',
      weather_forecast: 'Previsão do Tempo',
      local: 'Local',
      precipitation: 'Precipitação',
      wind: 'Vento',
      share: 'Compartilhar',
      sendWhatsApp: 'Enviar via WhatsApp',
      sendEmail: 'Enviar via E-mail',
      saveRDO: 'Salvar RDO',
    },
    workPage: {
      title: 'Obras',
      newWork: 'Nova Obra',
      search: 'Buscar obras...',
      status: 'Status',
      all: 'Todas',
      active: 'Ativas',
      completed: 'Finalizadas',
      noWorks: 'Nenhuma obra encontrada',
      addWork: 'Adicionar Obra',
    },
    teamPage: {
      title: 'Equipe',
      newMember: 'Novo Membro',
      name: 'Nome',
      role: 'Função',
      rdosGenerated: 'RDOs Gerados',
      managers: 'Gerentes',
      administrators: 'Administradores',
      collaborators: 'Colaboradores',
      language: 'Linguagem',
      selectLanguage: 'Selecione o idioma',
    },
    locationModal: {
      detected: 'Detectamos que você está em',
      confirm: 'Confirma?',
      change: 'Alterar',
      select: 'Selecione seu país',
      save: 'Salvar',
      selectCountry: 'Selecione o país',
      whereAreYou: 'De qual país você está acessando?',
    },
    supportPage: {
      title: 'Suporte',
      contactSupport: 'Fale com o Suporte',
      jumpToTopic: 'Ir para o tópico',
      topics: {
        workManagement: 'Gerenciamento de Obras',
        rdos: 'Relatórios Diários de Obra (RDOs)',
        plansAndPayment: 'Planos e Pagamento',
        technicalFeatures: 'Funcionalidades Técnicas',
        supportAndGeneral: 'Suporte e Uso Geral'
      },
      faq: {
        // Work Management
        howToRegisterWork: {
          question: 'Como posso registrar uma nova obra no app?',
          answer: 'Para registrar uma nova obra, clique no guia "Obras" no menu superior, depois clique em "Nova Obra". Preencha os detalhes, como nome da obra e localização, e salve. Você pode começar a adicionar atividades e RDOs em seguida!'
        },
        howToAddPhotos: {
          question: 'Como posso adicionar fotos e vídeos da obra pelo WhatsApp?',
          answer: 'É bem fácil! No chat do Meta Constructor Bot no WhatsApp, você pode enviar fotos e vídeos diretamente. Por exemplo, tire uma foto do progresso da obra, envie no chat, e o bot vai registrar no seu RDO. Você também pode enviar vídeos pra documentar detalhes específicos!'
        },
        canRegisterAccidents: {
          question: 'Posso registrar acidentes ou imprevistos na obra?',
          answer: 'Sim, claro! No chat do WhatsApp, informe o bot sobre o acidente ou imprevisto, como "Houve um pequeno acidente hoje". O bot vai registrar isso no RDO e te pedir mais detalhes, como fotos ou descrições, pra documentar tudo certinho.'
        },
        // RDOs
        whatIsRDO: {
          question: 'O que é um RDO e como ele é gerado?',
          answer: 'RDO significa Relatório Diário de Obra. Ele registra o progresso diário da sua obra. No app, você envia os dados pelo WhatsApp, e nosso bot organiza tudo automaticamente, gerando o RDO em PDF para você compartilhar.'
        },
        shareRDO: {
          question: 'Como posso compartilhar o RDO gerado com minha equipe?',
          answer: 'Depois que o RDO é gerado em PDF, você pode compartilhá-lo diretamente pelo WhatsApp ou e-mail. No app, vá até a seção "RDOs", selecione o relatório desejado, e clique em "Compartilhar". Escolha o método que preferir e envie pra sua equipe!'
        },
        editRDO: {
          question: 'Posso editar um RDO depois que ele foi gerado?',
          answer: 'No momento, os RDOs gerados não podem ser editados diretamente, mas você pode criar um novo RDO com as informações atualizadas. Envie os novos dados pelo WhatsApp, e o bot vai gerar um RDO atualizado pra você.'
        },
        // Plans and Payment
        changePlan: {
          question: 'Como posso mudar o plano que estou usando?',
          answer: 'Para mudar de plano, vá até o menu "Dashboard" e clique em "Plano Premium". Lá você pode ver os detalhes do seu plano atual e escolher um novo plano, como o Avançado ou Premium.'
        },
        paymentMethods: {
          question: 'Quais formas de pagamento o Meta Construtor aceita?',
          answer: 'Aceitamos pagamento via cartão de crédito, boleto bancário e Pix. Você pode escolher a melhor opção ao assinar um plano na seção "Plano Ideal" do app ou da landing page.'
        },
        cancelPlan: {
          question: 'Posso cancelar meu plano a qualquer momento?',
          answer: 'Sim! Você pode cancelar seu plano a qualquer momento sem custos adicionais. Basta ir até a seção "Plano" no app, clicar em "Gerenciar Plano", e selecionar a opção de cancelamento. Seu acesso será mantido até o final do ciclo de pagamento.'
        },
        // Technical Features
        offlineMode: {
          question: 'O app funciona offline?',
          answer: 'O app precisa de conexão com a internet para sincronizar os dados e gerar os RDOs, mas você pode salvar algumas informações offline e sincronizar quando estiver conectado.'
        },
        aiIntegration: {
          question: 'Como a integração com IA ajuda no gerenciamento da obra?',
          answer: 'A integração com IA analisa os dados que você envia, como fotos e textos, pra identificar padrões e sugerir melhorias. Por exemplo, ela pode alertar sobre atrasos no cronograma ou sugerir ajustes com base nas condições climáticas que você informou.'
        },
        multipleDevices: {
          question: 'Posso usar o Meta Construtor em mais de um dispositivo?',
          answer: 'Sim! Você pode usar o Meta Construtor em qualquer dispositivo com acesso à internet. Basta fazer login com sua conta no app ou no site, e todos os seus dados estarão sincronizados.'
        },
        changeLanguage: {
          question: 'Como posso mudar a linguagem do app?',
          answer: 'Pra mudar a linguagem, vá até a guia "Equipe" no menu superior, clique em "Linguagem", e escolha entre as opções disponíveis, como português, inglês, espanhol, francês ou alemão. O app vai atualizar automaticamente!'
        },
        // Support and General
        contactSupport: {
          question: 'Como entro em contato com o suporte se minha dúvida não estiver aqui?',
          answer: 'Se precisar de mais ajuda, você pode nos contatar diretamente pelo WhatsApp. Clique no botão "Fale com o Suporte" no final desta página para iniciar uma conversa com nossa equipe!'
        },
        forgotPassword: {
          question: 'O que acontece se eu esquecer minha senha?',
          answer: 'Se você esquecer sua senha, clique em "Esqueci minha senha" na tela de login. Você vai receber um e-mail com um link pra redefinir sua senha. Siga as instruções e crie uma nova senha pra acessar o app.'
        }
      }
    }
  },
  'en-US': {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      change: 'Change',
      download: 'Download',
      send: 'Send',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password?',
    },
    navigation: {
      dashboard: 'Dashboard',
      works: 'Projects',
      rdos: 'Reports',
      team: 'Team',
      analyses: 'Analytics',
      settings: 'Settings',
      plans: 'Plans',
      tutorial: 'Tutorial',
      support: 'Support',
      logout: 'Logout',
    },
    rdoPage: {
      title: 'New RDO',
      basicInfo: 'Basic Information',
      project: 'Project',
      date: 'Date',
      weather: 'Weather',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      idleHours: 'Idle Hours due to Weather',
      hours: 'hours',
      team: 'Present Team',
      managers: 'Managers',
      administrators: 'Administrators',
      collaborators: 'Collaborators',
      totalTeam: 'Total Team Members Present',
      activities: 'Activities Performed',
      activity: 'Activity',
      description: 'Description',
      progress: 'Progress',
      extraActivity: 'Extra Activity',
      extraActivityName: 'Extra Activity Name',
      accidents: 'Accident Records',
      accidentDescription: 'Accident Description',
      injuredCount: 'Number of Injured',
      equipment: 'Equipment Records',
      equipmentDescription: 'Breakdown/Maintenance Description',
      idleHoursEquipment: 'Idle Hours due to Equipment',
      responsible: 'RDO Responsible',
      weather_forecast: 'Weather Forecast',
      local: 'Location',
      precipitation: 'Precipitation',
      wind: 'Wind',
      share: 'Share',
      sendWhatsApp: 'Send via WhatsApp',
      sendEmail: 'Send via Email',
      saveRDO: 'Save RDO',
    },
    workPage: {
      title: 'Works',
      newWork: 'New Work',
      search: 'Search works...',
      status: 'Status',
      all: 'All',
      active: 'Active',
      completed: 'Completed',
      noWorks: 'No works found',
      addWork: 'Add Work',
    },
    teamPage: {
      title: 'Team',
      newMember: 'New Member',
      name: 'Name',
      role: 'Role',
      rdosGenerated: 'Reports Generated',
      managers: 'Managers',
      administrators: 'Administrators',
      collaborators: 'Collaborators',
      language: 'Language',
      selectLanguage: 'Select language',
    },
    locationModal: {
      detected: 'We detected that you are in',
      confirm: 'Confirm?',
      change: 'Change',
      select: 'Select your country',
      save: 'Save',
      selectCountry: 'Select country',
      whereAreYou: 'Which country are you accessing from?',
    },
    supportPage: {
      title: 'Support',
      contactSupport: 'Contact Support',
      jumpToTopic: 'Jump to topic',
      topics: {
        workManagement: 'Work Management',
        rdos: 'Daily Reports (RDOs)',
        plansAndPayment: 'Plans and Payment',
        technicalFeatures: 'Technical Features',
        supportAndGeneral: 'Support and General Use'
      },
      faq: {
        // Work Management
        howToRegisterWork: {
          question: 'How can I register a new project in the app?',
          answer: 'To register a new project, click on the "Projects" tab in the top menu, then click on "New Project". Fill in the details, such as project name and location, and save. You can start adding activities and reports right away!'
        },
        howToAddPhotos: {
          question: 'How can I add photos and videos of the project via WhatsApp?',
          answer: 'It\'s easy! In the Meta Constructor Bot chat on WhatsApp, you can send photos and videos directly. For example, take a photo of the project progress, send it in the chat, and the bot will register it in your report. You can also send videos to document specific details!'
        },
        canRegisterAccidents: {
          question: 'Can I register accidents or unforeseen events at the project?',
          answer: 'Yes, of course! In the WhatsApp chat, inform the bot about the accident or unforeseen event, such as "There was a small accident today". The bot will record this in the report and ask you for more details, such as photos or descriptions, to document everything properly.'
        },
        // RDOs
        whatIsRDO: {
          question: 'What is a Report and how is it generated?',
          answer: 'Reports track the daily progress of your project. In the app, you send the data via WhatsApp, and our bot automatically organizes everything, generating a PDF report for you to share.'
        },
        shareRDO: {
          question: 'How can I share the generated report with my team?',
          answer: 'After the report is generated as a PDF, you can share it directly via WhatsApp or email. In the app, go to the "Reports" section, select the desired report, and click on "Share". Choose your preferred method and send it to your team!'
        },
        editRDO: {
          question: 'Can I edit a report after it has been generated?',
          answer: 'At the moment, generated reports cannot be edited directly, but you can create a new report with updated information. Send the new data via WhatsApp, and the bot will generate an updated report for you.'
        },
        // Plans and Payment
        changePlan: {
          question: 'How can I change my current plan?',
          answer: 'To change plans, go to the "Dashboard" menu and click on "Premium Plan". There you can see the details of your current plan and choose a new plan, such as Advanced or Premium.'
        },
        paymentMethods: {
          question: 'What payment methods does Meta Constructor accept?',
          answer: 'We accept payment via credit card, bank slip, and Pix. You can choose the best option when signing up for a plan in the "Ideal Plan" section of the app or landing page.'
        },
        cancelPlan: {
          question: 'Can I cancel my plan at any time?',
          answer: 'Yes! You can cancel your plan at any time without additional costs. Just go to the "Plan" section in the app, click on "Manage Plan", and select the cancellation option. Your access will be maintained until the end of the payment cycle.'
        },
        // Technical Features
        offlineMode: {
          question: 'Does the app work offline?',
          answer: 'The app needs an internet connection to synchronize data and generate reports, but you can save some information offline and synchronize when you\'re connected.'
        },
        aiIntegration: {
          question: 'How does AI integration help with project management?',
          answer: 'AI integration analyzes the data you send, such as photos and texts, to identify patterns and suggest improvements. For example, it can alert you to delays in the schedule or suggest adjustments based on the weather conditions you reported.'
        },
        multipleDevices: {
          question: 'Can I use Meta Constructor on more than one device?',
          answer: 'Yes! You can use Meta Constructor on any device with internet access. Just log in with your account on the app or website, and all your data will be synchronized.'
        },
        changeLanguage: {
          question: 'How can I change the app language?',
          answer: 'To change the language, go to the "Team" tab in the top menu, click on "Language", and choose from the available options, such as Portuguese, English, Spanish, French, or German. The app will update automatically!'
        },
        // Support and General
        contactSupport: {
          question: 'How do I contact support if my question is not listed here?',
          answer: 'If you need more help, you can contact us directly via WhatsApp. Click the "Contact Support" button at the bottom of this page to start a conversation with our team!'
        },
        forgotPassword: {
          question: 'What happens if I forget my password?',
          answer: 'If you forget your password, click on "Forgot Password" on the login screen. You will receive an email with a link to reset your password. Follow the instructions and create a new password to access the app.'
        }
      }
    }
  },
  'es-ES': {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Eliminar',
      confirm: 'Confirmar',
      change: 'Cambiar',
      download: 'Descargar',
      send: 'Enviar',
    },
    auth: {
      login: 'Iniciar sesión',
      register: 'Registrarse',
      forgotPassword: '¿Olvidó su contraseña?',
    },
    navigation: {
      dashboard: 'Panel',
      works: 'Obras',
      rdos: 'Informes',
      team: 'Equipo',
      analyses: 'Análisis',
      settings: 'Ajustes',
      plans: 'Planes',
      tutorial: 'Tutorial',
      support: 'Soporte',
      logout: 'Salir',
    },
    rdoPage: {
      title: 'Nuevo RDO',
      basicInfo: 'Información Básica',
      project: 'Proyecto',
      date: 'Fecha',
      weather: 'Clima',
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Noche',
      idleHours: 'Horas Inactivas por Clima',
      hours: 'horas',
      team: 'Equipo Presente',
      managers: 'Gerentes',
      administrators: 'Administradores',
      collaborators: 'Colaboradores',
      totalTeam: 'Total de Miembros del Equipo Presentes',
      activities: 'Actividades Realizadas',
      activity: 'Actividad',
      description: 'Descripción',
      progress: 'Progreso',
      extraActivity: 'Actividad Extra',
      extraActivityName: 'Nombre de la Actividad Extra',
      accidents: 'Registro de Accidentes',
      accidentDescription: 'Descripción del Accidente',
      injuredCount: 'Número de Heridos',
      equipment: 'Registro de Equipos',
      equipmentDescription: 'Descripción de Avería/Mantenimiento',
      idleHoursEquipment: 'Horas Inactivas por Equipo',
      responsible: 'Responsable del RDO',
      weather_forecast: 'Pronóstico del Tiempo',
      local: 'Ubicación',
      precipitation: 'Precipitación',
      wind: 'Viento',
      share: 'Compartir',
      sendWhatsApp: 'Enviar por WhatsApp',
      sendEmail: 'Enviar por Email',
      saveRDO: 'Guardar RDO',
    },
    workPage: {
      title: 'Obras',
      newWork: 'Nueva Obra',
      search: 'Buscar obras...',
      status: 'Estado',
      all: 'Todas',
      active: 'Activas',
      completed: 'Finalizadas',
      noWorks: 'No se encontraron obras',
      addWork: 'Añadir Obra',
    },
    teamPage: {
      title: 'Equipo',
      newMember: 'Nuevo Miembro',
      name: 'Nombre',
      role: 'Función',
      rdosGenerated: 'Informes Generados',
      managers: 'Gerentes',
      administrators: 'Administradores',
      collaborators: 'Colaboradores',
      language: 'Idioma',
      selectLanguage: 'Seleccione el idioma',
    },
    locationModal: {
      detected: 'Hemos detectado que estás en',
      confirm: '¿Confirmar?',
      change: 'Cambiar',
      select: 'Selecciona tu país',
      save: 'Guardar',
      selectCountry: 'Seleccione el país',
      whereAreYou: '¿De qué país estás accediendo?',
    },
    supportPage: {
      title: 'Soporte',
      contactSupport: 'Hablar con Soporte',
      jumpToTopic: 'Ir al tema',
      topics: {
        workManagement: 'Gestión de Obras',
        rdos: 'Informes Diarios de Obra (RDOs)',
        plansAndPayment: 'Planes y Pago',
        technicalFeatures: 'Funciones Técnicas',
        supportAndGeneral: 'Soporte y Uso General'
      },
      faq: {
        // Work Management
        howToRegisterWork: {
          question: '¿Cómo puedo registrar una nueva obra en la aplicación?',
          answer: '¡Para registrar una nueva obra, haz clic en la pestaña "Obras" en el menú superior, luego haz clic en "Nueva Obra". Completa los detalles, como el nombre de la obra y la ubicación, y guarda. Puedes comenzar a agregar actividades y informes de inmediato!'
        },
        howToAddPhotos: {
          question: '¿Cómo puedo añadir fotos y videos de la obra por WhatsApp?',
          answer: '¡Es muy fácil! En el chat de Meta Constructor Bot en WhatsApp, puedes enviar fotos y videos directamente. Por ejemplo, toma una foto del progreso de la obra, envíala al chat, y el bot la registrará en tu informe. ¡También puedes enviar videos para documentar detalles específicos!'
        },
        canRegisterAccidents: {
          question: '¿Puedo registrar accidentes o imprevistos en la obra?',
          answer: '¡Sí, por supuesto! En el chat de WhatsApp, informa al bot sobre el accidente o imprevisto, como "Hubo un pequeño accidente hoy". El bot lo registrará en el informe y te pedirá más detalles, como fotos o descripciones, para documentar todo correctamente.'
        },
        // RDOs
        whatIsRDO: {
          question: '¿Qué es un Informe y cómo se genera?',
          answer: 'Los Informes registran el progreso diario de tu obra. En la aplicación, envías los datos a través de WhatsApp, y nuestro bot organiza todo automáticamente, generando un informe en PDF para que lo compartas.'
        },
        shareRDO: {
          question: '¿Cómo puedo compartir el informe generado con mi equipo?',
          answer: 'Después de que se genera el informe en PDF, puedes compartirlo directamente por WhatsApp o correo electrónico. En la aplicación, ve a la sección "Informes", selecciona el informe deseado, y haz clic en "Compartir". ¡Elige el método que prefieras y envíalo a tu equipo!'
        },
        editRDO: {
          question: '¿Puedo editar un informe después de que se ha generado?',
          answer: 'Por el momento, los informes generados no se pueden editar directamente, pero puedes crear un nuevo informe con la información actualizada. Envía los nuevos datos por WhatsApp, y el bot generará un informe actualizado para ti.'
        },
        // Plans and Payment
        changePlan: {
          question: '¿Cómo puedo cambiar el plan que estoy usando?',
          answer: 'Para cambiar de plan, ve al menú "Panel" y haz clic en "Plan Premium". Allí puedes ver los detalles de tu plan actual y elegir un nuevo plan, como Avanzado o Premium.'
        },
        paymentMethods: {
          question: '¿Qué métodos de pago acepta Meta Constructor?',
          answer: 'Aceptamos pago por tarjeta de crédito, virement bancario y Pix. Puedes elegir la mejor opción al suscribirte a un plan en la sección "Plan Ideal" de la aplicación o página de inicio.'
        },
        cancelPlan: {
          question: '¿Puedo cancelar mi plan en cualquier momento?',
          answer: '¡Sí! Puedes cancelar tu plan en cualquier momento sin costos adicionales. Solo ve a la sección "Plan" en la aplicación, haz clic en "Gestionar Plan", y selecciona la opción de cancelación. Tu acceso se mantendrá hasta el final del ciclo de pago.'
        },
        // Technical Features
        offlineMode: {
          question: '¿La aplicación funciona sin conexión?',
          answer: 'La aplicación necesita conexión a Internet para sincronizar datos y generar informes, pero puedes guardar alguna información sin conexión y sincronizar cuando estés conectado.'
        },
        aiIntegration: {
          question: '¿Cómo ayuda la integración con IA en la gestión de la obra?',
          answer: 'La integración con IA analiza los datos que envías, como fotos y textos, para identificar patrones y sugerir mejoras. Por ejemplo, puede alertarte sobre retrasos en el cronograma o sugerir ajustes basados en las condiciones climáticas que informaste.'
        },
        multipleDevices: {
          question: '¿Puedo usar Meta Constructor en más de un dispositivo?',
          answer: '¡Sí! Puedes usar Meta Constructor en cualquier dispositivo con acceso a internet. Solo inicia sesión con tu cuenta en la aplicación o sitio web, y todos tus datos estarán sincronizados.'
        },
        changeLanguage: {
          question: '¿Cómo puedo cambiar el idioma de la aplicación?',
          answer: 'Para cambiar el idioma, ve a la pestaña "Equipo" en el menú superior, haz clic en "Idioma", y elige entre las opciones disponibles, como portugués, inglés, español, francés o alemán. ¡La aplicación se actualizará automáticamente!'
        },
        // Support and General
        contactSupport: {
          question: '¿Cómo contacto con soporte si mi pregunta no está aquí?',
          answer: 'Si necesitas más ayuda, puedes contactarnos directamente a través de WhatsApp. ¡Haz clic en el botón "Hablar con Soporte" al final de esta página para iniciar una conversación con nuestro equipo!'
        },
        forgotPassword: {
          question: '¿Qué ocurre si olvido mi contraseña?',
          answer: 'Si olvidas tu contraseña, haz clic en "Olvidé mi contraseña" en la pantalla de inicio de sesión. Recibirás un correo electrónico con un enlace para restablecer tu contraseña. Sigue las instrucciones y crea una nueva contraseña para acceder a la aplicación.'
        }
      }
    }
  },
  'fr-FR': {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      confirm: 'Confirmer',
      change: 'Changer',
      download: 'Télécharger',
      send: 'Envoyer',
    },
    auth: {
      login: 'Connexion',
      register: 'S\'inscrire',
      forgotPassword: 'Mot de passe oublié?',
    },
    navigation: {
      dashboard: 'Tableau de bord',
      works: 'Projets',
      rdos: 'Rapports',
      team: 'Équipe',
      analyses: 'Analyses',
      settings: 'Paramètres',
      plans: 'Plans',
      tutorial: 'Tutoriel',
      support: 'Support',
      logout: 'Déconnexion',
    },
    rdoPage: {
      title: 'Nouveau Rapport',
      basicInfo: 'Informations de base',
      project: 'Projet',
      date: 'Date',
      weather: 'Météo',
      morning: 'Matin',
      afternoon: 'Après-midi',
      evening: 'Soir',
      idleHours: 'Heures d\'inactivité dues à la météo',
      hours: 'heures',
      team: 'Équipe présente',
      managers: 'Gestionnaires',
      administrators: 'Administrateurs',
      collaborators: 'Collaborateurs',
      totalTeam: 'Total des membres d\'équipe présents',
      activities: 'Activités réalisées',
      activity: 'Activité',
      description: 'Description',
      progress: 'Progrès',
      extraActivity: 'Activité supplémentaire',
      extraActivityName: 'Nom de l\'activité supplémentaire',
      accidents: 'Registre des accidents',
      accidentDescription: 'Description de l\'accident',
      injuredCount: 'Nombre de blessés',
      equipment: 'Registre des équipements',
      equipmentDescription: 'Description de panne/maintenance',
      idleHoursEquipment: 'Heures d\'inactivité dues à l\'équipement',
      responsible: 'Responsable du rapport',
      weather_forecast: 'Prévisions météorologiques',
      local: 'Emplacement',
      precipitation: 'Précipitation',
      wind: 'Vent',
      share: 'Partager',
      sendWhatsApp: 'Envoyer par WhatsApp',
      sendEmail: 'Envoyer par e-mail',
      saveRDO: 'Enregistrer le rapport',
    },
    workPage: {
      title: 'Projets',
      newWork: 'Nouveau projet',
      search: 'Rechercher des projets...',
      status: 'Statut',
      all: 'Tous',
      active: 'Actifs',
      completed: 'Terminés',
      noWorks: 'Aucun projet trouvé',
      addWork: 'Ajouter un projet',
    },
    teamPage: {
      title: 'Équipe',
      newMember: 'Nouveau membre',
      name: 'Nom',
      role: 'Rôle',
      rdosGenerated: 'Rapports générés',
      managers: 'Gestionnaires',
      administrators: 'Administrateurs',
      collaborators: 'Collaborateurs',
      language: 'Langue',
      selectLanguage: 'Sélectionnez la langue',
    },
    locationModal: {
      detected: 'Nous avons détecté que vous êtes en',
      confirm: 'Confirmer ?',
      change: 'Changer',
      select: 'Sélectionnez votre pays',
      save: 'Enregistrer',
      selectCountry: 'Sélectionnez le pays',
      whereAreYou: 'De quel pays accédez-vous ?',
    },
    supportPage: {
      title: 'Support',
      contactSupport: 'Contacter le support',
      jumpToTopic: 'Aller au sujet',
      topics: {
        workManagement: 'Gestion des Projets',
        rdos: 'Rapports Quotidiens (RDOs)',
        plansAndPayment: 'Plans et Paiement',
        technicalFeatures: 'Fonctionnalités Techniques',
        supportAndGeneral: 'Support et Utilisation Générale'
      },
      faq: {
        // Work Management
        howToRegisterWork: {
          question: 'Comment puis-je enregistrer un nouveau projet dans l\'application ?',
          answer: 'Pour enregistrer un nouveau projet, cliquez sur l\'onglet "Projets" dans le menu supérieur, puis cliquez sur "Nouveau projet". Remplissez les détails, comme le nom du projet et l\'emplacement, et enregistrez. Vous pouvez commencer à ajouter des activités et des rapports immédiatement !'
        },
        howToAddPhotos: {
          question: 'Comment puis-je ajouter des photos et des vidéos du projet via WhatsApp ?',
          answer: 'C\'est facile ! Dans le chat Meta Constructor Bot sur WhatsApp, vous pouvez envoyer des photos et des vidéos directement. Par exemple, prenez une photo de l\'avancement du projet, envoyez-la dans le chat, et le bot l\'enregistrera dans votre rapport. Vous pouvez également envoyer des vidéos pour documenter des détails spécifiques !'
        },
        canRegisterAccidents: {
          question: 'Puis-je enregistrer des accidents ou des imprévus sur le chantier ?',
          answer: 'Oui, bien sûr ! Dans le chat WhatsApp, informez le bot de l\'accident ou de l\'imprévu, comme "Il y a eu un petit accident aujourd\'hui". Le bot l\'enregistrera dans le rapport et vous demandera plus de détails, comme des photos ou des descriptions, pour tout documenter correctement.'
        },
        // RDOs
        whatIsRDO: {
          question: 'Qu\'est-ce qu\'un Rapport et comment est-il généré ?',
          answer: 'Les Rapports suivent l\'avancement quotidien de votre projet. Dans l\'application, vous envoyez les données via WhatsApp, et notre bot organise automatiquement tout, générant un rapport PDF à partager.'
        },
        shareRDO: {
          question: 'Comment puis-je partager le rapport généré avec mon équipe ?',
          answer: 'Une fois le rapport généré en PDF, vous pouvez le partager directement via WhatsApp ou e-mail. Dans l\'application, allez à la section "Rapports", sélectionnez le rapport souhaité, et cliquez sur "Partager". Choisissez votre méthode préférée et envoyez-le à votre équipe !'
        },
        editRDO: {
          question: 'Puis-je modifier un rapport après sa génération ?',
          answer: 'Pour le moment, les rapports générés ne peuvent pas être modifiés directement, mais vous pouvez créer un nouveau rapport avec des informations mises à jour. Envoyez les nouvelles données via WhatsApp, et le bot générera un rapport mis à jour pour vous.'
        },
        // Plans and Payment
        changePlan: {
          question: 'Comment puis-je changer mon plan actuel ?',
          answer: 'Pour changer de plan, allez au menu "Tableau de bord" et cliquez sur "Plan Premium". Vous pourrez y voir les détails de votre plan actuel et choisir un nouveau plan, comme Avancé ou Premium.'
        },
        paymentMethods: {
          question: 'Quels moyens de paiement Meta Constructor accepte-t-il ?',
          answer: 'Nous acceptons les paiements par carte de crédit, virement bancaire et Pix. Vous pouvez choisir la meilleure option lors de l\'inscription à un plan dans la section "Plan Idéal" de l\'application ou de la page d\'accueil.'
        },
        cancelPlan: {
          question: 'Puis-je annuler mon plan à tout moment ?',
          answer: 'Oui ! Vous pouvez annuler votre plan à tout moment sans frais supplémentaires. Il suffit d\'aller à la section "Plan" dans l\'application, de cliquer sur "Gérer le plan", et de sélectionner l\'option d\'annulation. Votre accès sera maintenu jusqu\'à la fin du cycle de paiement.'
        },
        // Technical Features
        offlineMode: {
          question: 'L\'application fonctionne-t-elle hors ligne ?',
          answer: 'L\'application nécessite une connexion Internet pour synchroniser les données et générer des rapports, mais vous pouvez enregistrer certaines informations hors ligne et les synchroniser lorsque vous êtes connecté.'
        },
        aiIntegration: {
          question: 'Comment l\'intégration de l\'IA aide-t-elle à la gestion de projet ?',
          answer: 'L\'intégration de l\'IA analyse les données que vous envoyez, comme les photos et les textes, pour identifier des modèles et suggérer des améliorations. Par exemple, elle peut vous alerter des retards dans le calendrier ou suggérer des ajustements en fonction des conditions météorologiques que vous avez signalées.'
        },
        multipleDevices: {
          question: 'Puis-je utiliser Meta Constructor sur plusieurs appareils ?',
          answer: 'Oui ! Vous pouvez utiliser Meta Constructor sur n\'importe quel appareil avec accès à Internet. Connectez-vous simplement avec votre compte sur l\'application ou le site web, et toutes vos données seront synchronisées.'
        },
        changeLanguage: {
          question: 'Comment puis-je changer la langue de l\'application ?',
          answer: 'Pour changer la langue, allez à l\'onglet "Équipe" dans le menu supérieur, cliquez sur "Langue", et choisissez parmi les options disponibles, comme le portugais, l\'anglais, l\'espagnol, le français ou l\'allemand. L\'application se mettra à jour automatiquement !'
        },
        // Support and General
        contactSupport: {
          question: 'Comment puis-je contacter le support si ma question n\'est pas listée ici ?',
          answer: 'Si vous avez besoin de plus d\'aide, vous pouvez nous contacter directement via WhatsApp. Cliquez sur le bouton "Contacter le support" en bas de cette page pour commencer une conversation avec notre équipe !'
        },
        forgotPassword: {
          question: 'Que se passe-t-il si j\'oublie mon mot de passe ?',
          answer: 'Si vous oubliez votre mot de passe, cliquez sur "Mot de passe oublié" sur l\'écran de connexion. Vous recevrez un e-mail avec un lien pour réinitialiser votre mot de passe. Suivez les instructions et créez une nouvelle mot de passe pour accéder à l\'application.'
        }
      }
    }
  }
};

// This is the function that was missing - it returns translations for a given locale
export function useTranslation(locale: string): Translations {
  // Default to English if the locale doesn't exist
  return translations[locale] || translations['en-US'];
}
