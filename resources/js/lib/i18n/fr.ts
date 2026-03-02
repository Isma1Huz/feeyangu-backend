import type { Translations } from './en';

const fr: Partial<Translations> & Record<string, any> = {
  APP_NAME: 'Feeyangu',
  APP_TAGLINE: 'Gestion intelligente des frais scolaires',
  APP_DESCRIPTION: 'Simplifiez la collecte, le suivi et le reporting des frais pour les écoles et les parents.',

  AUTH_TEXT: {
    login: {
      title: 'Bon retour',
      subtitle: 'Connectez-vous à votre compte pour continuer',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'Entrez votre e-mail',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      submitButton: 'Se connecter',
      noAccount: "Pas de compte ?",
      registerLink: 'Créer un compte',
      orContinue: 'Ou continuer avec',
    },
    register: {
      title: 'Créez votre compte',
      subtitle: 'Commencez avec Feeyangu dès aujourd\'hui',
      nameLabel: 'Nom complet',
      namePlaceholder: 'Entrez votre nom complet',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'Entrez votre e-mail',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Créez un mot de passe',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
      roleLabel: 'Je suis',
      roleParent: 'Parent',
      roleSchoolAdmin: 'Administrateur scolaire',
      schoolNameLabel: 'Nom de l\'école',
      schoolNamePlaceholder: 'Entrez le nom de l\'école',
      termsText: 'J\'accepte les',
      termsLink: 'Conditions générales',
      submitButton: 'Créer le compte',
      hasAccount: 'Vous avez déjà un compte ?',
      loginLink: 'Se connecter',
    },
    forgotPassword: {
      title: 'Réinitialiser votre mot de passe',
      subtitle: 'Entrez votre e-mail et nous vous enverrons un lien de réinitialisation',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'Entrez votre e-mail',
      submitButton: 'Envoyer le lien',
      backToLogin: 'Retour à la connexion',
      successMessage: 'Vérifiez votre e-mail pour un lien de réinitialisation.',
    },
  },

  SIDEBAR_TEXT: {
    superAdmin: { label: 'Plateforme', items: { dashboard: 'Tableau de bord', schools: 'Écoles', users: 'Utilisateurs', settings: 'Paramètres' } },
    schoolAdmin: {
      main: { label: 'Principal', items: { dashboard: 'Tableau de bord', students: 'Élèves', grades: 'Niveaux & Classes' } },
      finance: { label: 'Finances', items: { feeStructures: 'Structures tarifaires', payments: 'Paiements', receipts: 'Reçus' } },
      settings: { label: 'Paramètres', items: { paymentMethods: 'Moyens de paiement', terms: 'Trimestres', settings: 'Paramètres école' } },
    },
    parent: { label: 'Menu', items: { dashboard: 'Tableau de bord', children: 'Mes enfants', payments: 'Historique des paiements', receipts: 'Reçus' } },
  },

  DASHBOARD_TEXT: {
    school: {
      title: 'Tableau de bord école',
      bannerTitle: 'Bienvenue sur votre portail scolaire',
      bannerDescription: 'Gérez les élèves, suivez les paiements et générez des rapports depuis un seul endroit.',
      kpi: { totalStudents: 'Total élèves', feesCollected: 'Frais collectés', pendingFees: 'Frais en attente', overdueAccounts: 'Comptes en retard' },
      revenueChart: 'Revenus mensuels',
      recentPayments: 'Paiements récents',
      overdueAlert: 'Alerte frais en retard',
    },
    parent: {
      title: 'Accueil',
      subtitle: 'Aperçu du profil de gestion des frais de vos enfants',
      bannerTitle: 'Gérez les frais de vos enfants',
      bannerDescription: 'Consultez les soldes, effectuez des paiements et téléchargez les reçus pour tous vos enfants.',
      bannerAction: 'Effectuer un paiement',
      childrenSection: 'Mes enfants',
      outstandingFees: 'Total des frais impayés',
      recentPayments: 'Paiements récents',
      quickPay: 'Paiement rapide',
      viewFees: 'Voir les frais',
      overviewTitle: 'Aperçu - Trimestre en cours 2026',
      totalFeesDue: 'Total des frais dus',
      totalPaid: 'Total payé',
    },
    admin: {
      title: 'Vue d\'ensemble de la plateforme',
      bannerTitle: 'Console d\'administration Feeyangu',
      bannerDescription: 'Surveillez les statistiques, gérez les écoles et supervisez tous les utilisateurs.',
      kpi: { totalSchools: 'Total écoles', activeUsers: 'Utilisateurs actifs', monthlyRevenue: 'Revenus mensuels', pendingApprovals: 'Approbations en attente' },
      topSchools: 'Meilleures écoles',
      recentActivity: 'Activité récente',
    },
  },

  STUDENTS_TEXT: {
    title: 'Élèves',
    searchPlaceholder: 'Rechercher par nom ou numéro d\'admission...',
    addStudent: 'Ajouter un élève',
    importCsv: 'Importer CSV',
    exportCsv: 'Exporter CSV',
    filters: { grade: 'Tous les niveaux', status: 'Tous les statuts', class: 'Toutes les classes' },
    table: { admissionNo: 'N° admission', name: 'Nom de l\'élève', grade: 'Niveau', class: 'Classe', parent: 'Parent', fees: 'Statut frais', status: 'Statut', actions: 'Actions' },
    emptyState: { title: 'Aucun élève trouvé', description: 'Commencez par ajouter un élève ou importer depuis un CSV.' },
    form: { createTitle: 'Ajouter un nouvel élève', editTitle: 'Modifier l\'élève', firstName: 'Prénom', lastName: 'Nom', admissionNumber: 'Numéro d\'admission', grade: 'Niveau', className: 'Classe', parentName: 'Nom du parent', parentEmail: 'E-mail du parent', status: 'Statut' },
  },

  GRADES_TEXT: {
    title: 'Niveaux & Classes',
    subtitle: 'Gérez les niveaux et sections de classe.',
    addGrade: 'Ajouter un niveau',
    addClass: 'Ajouter une classe',
    editGrade: 'Modifier le niveau',
    deleteGrade: 'Supprimer le niveau',
    editClass: 'Modifier la classe',
    deleteClass: 'Supprimer la classe',
    table: { grade: 'Niveau', classes: 'Classes', students: 'Élèves', actions: 'Actions' },
    classTable: { name: 'Nom de la classe', teacher: 'Enseignant principal', students: 'Élèves', actions: 'Actions' },
    form: { gradeName: 'Nom du niveau', gradeNamePlaceholder: 'ex. Niveau 5', className: 'Nom de la classe', classNamePlaceholder: 'ex. 5A', teacher: 'Enseignant principal', teacherPlaceholder: 'ex. Mme Kamau', selectGrade: 'Sélectionner le niveau' },
    emptyState: { title: 'Aucun niveau', description: 'Commencez par créer votre premier niveau.' },
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ? Cette action est irréversible.',
  },

  FEE_STRUCTURES_TEXT: {
    title: 'Structures tarifaires',
    subtitle: 'Définissez et gérez les structures tarifaires par niveau et trimestre.',
    addFeeStructure: 'Ajouter une structure',
    editFeeStructure: 'Modifier la structure',
    table: { name: 'Nom', grade: 'Niveau', term: 'Trimestre', totalAmount: 'Montant total', status: 'Statut', actions: 'Actions' },
    detail: { feeBreakdown: 'Détail des frais', itemName: 'Élément', itemAmount: 'Montant', addItem: 'Ajouter un élément', total: 'Total' },
    form: { name: 'Nom de la structure', namePlaceholder: 'ex. Niveau 5 - Trim. 1 2026', grade: 'Niveau', term: 'Trimestre', status: 'Statut', feeItemName: 'Nom de l\'élément', feeItemNamePlaceholder: 'ex. Scolarité', feeItemAmount: 'Montant' },
    emptyState: { title: 'Aucune structure tarifaire', description: 'Créez des structures tarifaires pour attribuer des frais.' },
  },

  PAYMENTS_TEXT: {
    title: 'Paiements',
    subtitle: 'Consultez et gérez toutes les transactions.',
    searchPlaceholder: 'Rechercher par nom ou référence...',
    exportCsv: 'Exporter CSV',
    table: { date: 'Date', student: 'Élève', amount: 'Montant', method: 'Méthode', status: 'Statut', reference: 'Référence', actions: 'Actions' },
    filters: { allMethods: 'Toutes les méthodes', allStatus: 'Tous les statuts' },
    actions: { approve: 'Approuver', reject: 'Rejeter', viewDetails: 'Voir les détails' },
    emptyState: { title: 'Aucun paiement trouvé', description: 'Les paiements apparaîtront ici une fois reçus.' },
  },

  RECEIPTS_TEXT: {
    title: 'Reçus',
    subtitle: 'Consultez et téléchargez les reçus de paiement.',
    searchPlaceholder: 'Rechercher par numéro de reçu ou élève...',
    table: { receiptNo: 'N° reçu', date: 'Date', student: 'Élève', amount: 'Montant', method: 'Méthode', actions: 'Actions' },
    preview: { title: 'Aperçu du reçu', schoolName: 'Green Valley Academy', receiptLabel: 'Reçu', dateLabel: 'Date', studentLabel: 'Élève', referenceLabel: 'Référence de paiement', methodLabel: 'Méthode de paiement', itemLabel: 'Description', amountLabel: 'Montant', totalLabel: 'Total payé' },
    emptyState: { title: 'Aucun reçu trouvé', description: 'Les reçus sont générés après les paiements.' },
  },

  PAYMENT_METHODS_TEXT: {
    title: 'Moyens de paiement',
    subtitle: 'Configurez les moyens de paiement pour les parents.',
    addMethod: 'Ajouter une méthode',
    table: { name: 'Nom', type: 'Type', details: 'Détails', enabled: 'Activé', actions: 'Actions' },
    form: { name: 'Nom de la méthode', namePlaceholder: 'ex. M-Pesa Paybill', type: 'Type', details: 'Détails / Instructions', detailsPlaceholder: 'ex. Paybill: 123456, Compte: Frais scolaires', enabled: 'Activé' },
    emptyState: { title: 'Aucun moyen de paiement', description: 'Ajoutez des moyens de paiement pour les parents.' },
  },

  TERMS_TEXT: {
    title: 'Trimestres',
    subtitle: 'Gérez les trimestres et le calendrier scolaire.',
    addTerm: 'Ajouter un trimestre',
    table: { name: 'Nom', year: 'Année', startDate: 'Date de début', endDate: 'Date de fin', status: 'Statut', actions: 'Actions' },
    form: { name: 'Nom du trimestre', namePlaceholder: 'ex. Trimestre 1 2026', year: 'Année', startDate: 'Date de début', endDate: 'Date de fin', status: 'Statut' },
    emptyState: { title: 'Aucun trimestre', description: 'Créez des trimestres pour organiser le calendrier.' },
  },

  SCHOOL_SETTINGS_TEXT: {
    title: 'Paramètres de l\'école',
    subtitle: 'Personnalisez le profil et les préférences de votre école.',
    sections: { profile: 'Profil de l\'école', branding: 'Image de marque', subscription: 'Abonnement' },
    fields: { schoolName: 'Nom de l\'école', schoolNamePlaceholder: 'Entrez le nom', motto: 'Devise', mottoPlaceholder: 'Entrez la devise', location: 'Emplacement', locationPlaceholder: 'Entrez l\'emplacement', email: 'E-mail de contact', emailPlaceholder: 'Entrez l\'e-mail', phone: 'Téléphone', phonePlaceholder: 'Entrez le numéro', primaryColor: 'Couleur principale', secondaryColor: 'Couleur secondaire', logo: 'Logo de l\'école', uploadLogo: 'Télécharger le logo' },
    subscription: { plan: 'Plan actuel', planValue: 'Premium', status: 'Statut', statusValue: 'Actif', nextBilling: 'Prochaine facturation', nextBillingValue: '1 mars 2026' },
    saveButton: 'Enregistrer',
    savedMessage: 'Paramètres enregistrés avec succès.',
  },

  COMMON_TEXT: {
    actions: { save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', view: 'Voir', create: 'Créer', export: 'Exporter', import: 'Importer', search: 'Rechercher', filter: 'Filtrer', refresh: 'Actualiser', download: 'Télécharger', print: 'Imprimer', close: 'Fermer', confirm: 'Confirmer', back: 'Retour', next: 'Suivant' },
    status: { active: 'Actif', inactive: 'Inactif', pending: 'En attente', completed: 'Terminé', failed: 'Échoué', overdue: 'En retard', paid: 'Payé', partial: 'Partiel', suspended: 'Suspendu', upcoming: 'À venir' },
    currency: 'KES',
    noData: 'Aucune donnée disponible',
    loading: 'Chargement...',
    logout: 'Déconnexion',
    profile: 'Profil',
    notifications: 'Notifications',
    settings: 'Paramètres',
    vsLastMonth: 'vs mois dernier',
    notFoundTitle: '404',
    notFoundMessage: 'Oups ! Page introuvable',
    notFoundLink: 'Retour à l\'accueil',
  },

  PAYMENT_METHOD_LABELS: { mpesa: 'M-Pesa', bank: 'Virement bancaire', cash: 'Espèces', card: 'Carte' },

  PARENT_CHILDREN_TEXT: { title: 'Mes enfants', subtitle: 'Consultez les frais et effectuez des paiements.', viewFees: 'Voir les frais', quickPay: 'Paiement rapide', feeProgress: 'Progression des frais' },
  PARENT_FEES_TEXT: { title: 'Détail des frais', subtitle: 'Détail et statut des paiements', item: 'Élément', total: 'Total', paid: 'Payé', balance: 'Solde', status: 'Statut', payNow: 'Payer maintenant', backToChildren: 'Retour aux enfants', totalOutstanding: 'Total impayé' },
  PARENT_PAY_TEXT: { title: 'Effectuer un paiement', selectMethod: 'Choisir le moyen de paiement', amount: 'Montant (KES)', reference: 'Référence de paiement', referencePlaceholder: 'ex. Code transaction M-Pesa', submitPayment: 'Soumettre le paiement', cancel: 'Annuler' },
  PARENT_PAYMENTS_TEXT: { title: 'Historique des paiements', subtitle: 'Consultez tous vos paiements.', searchPlaceholder: 'Rechercher par référence...', filterChild: 'Tous les enfants', table: { date: 'Date', child: 'Enfant', amount: 'Montant', method: 'Méthode', status: 'Statut', reference: 'Référence' }, emptyState: { title: 'Aucun paiement', description: 'Votre historique apparaîtra ici.' } },
  PARENT_RECEIPTS_TEXT: { title: 'Reçus', subtitle: 'Téléchargez et imprimez vos reçus.', searchPlaceholder: 'Rechercher par numéro de reçu...', filterChild: 'Tous les enfants', table: { receiptNo: 'N° reçu', date: 'Date', child: 'Enfant', amount: 'Montant', actions: 'Actions' }, emptyState: { title: 'Aucun reçu', description: 'Les reçus apparaîtront après les paiements.' } },

  ADMIN_SCHOOLS_TEXT: {
    title: 'Écoles', subtitle: 'Gérez toutes les écoles de la plateforme.', addSchool: 'Ajouter une école', searchPlaceholder: 'Rechercher des écoles...',
    table: { name: 'Nom de l\'école', owner: 'Propriétaire', location: 'Emplacement', students: 'Élèves', feesCollected: 'Frais collectés', status: 'Statut', actions: 'Actions' },
    form: { name: 'Nom de l\'école', namePlaceholder: 'Entrez le nom', owner: 'Propriétaire', ownerPlaceholder: 'Entrez le nom du propriétaire', location: 'Emplacement', locationPlaceholder: 'Entrez l\'emplacement', status: 'Statut' },
    emptyState: { title: 'Aucune école', description: 'Aucune école enregistrée.' },
    actions: { activate: 'Activer', suspend: 'Suspendre', delete: 'Supprimer' },
  },

  ADMIN_USERS_TEXT: {
    title: 'Utilisateurs', subtitle: 'Gérez tous les utilisateurs de la plateforme.', searchPlaceholder: 'Rechercher des utilisateurs...', filterRole: 'Tous les rôles', filterStatus: 'Tous les statuts',
    table: { name: 'Nom', email: 'E-mail', role: 'Rôle', school: 'École', status: 'Statut', lastLogin: 'Dernière connexion', actions: 'Actions' },
    actions: { deactivate: 'Désactiver', activate: 'Activer', resetPassword: 'Réinitialiser le mot de passe' },
    emptyState: { title: 'Aucun utilisateur trouvé', description: 'Les utilisateurs apparaîtront ici.' },
  },

  ADMIN_SETTINGS_TEXT: {
    title: 'Paramètres de la plateforme', subtitle: 'Configurez les paramètres globaux.',
    sections: { general: 'Général', notifications: 'Notifications', billing: 'Facturation' },
    fields: { platformName: 'Nom de la plateforme', platformNamePlaceholder: 'Feeyangu', supportEmail: 'E-mail support', supportEmailPlaceholder: 'support@feeyangu.com', defaultCurrency: 'Devise par défaut', maintenanceMode: 'Mode maintenance', emailNotifications: 'Notifications par e-mail', smsNotifications: 'Notifications SMS', paymentAlerts: 'Alertes de paiement', overdueReminders: 'Rappels de retard' },
    saveButton: 'Enregistrer',
    savedMessage: 'Paramètres de la plateforme enregistrés.',
  },

  HEADER: {
    roleLabels: { super_admin: 'Super Admin', school_admin: 'Admin École', parent: 'Parent' },
    childrenSummary: 'Résumé des enfants',
    recentReceipts: 'Reçus récents',
    viewAll: 'Voir tout',
    feeProgress: 'Progression des frais',
    daysOverdue: 'jours de retard',
    platformStats: 'Statistiques et gestion de la plateforme.',
    welcomeBack: 'Bienvenue. Voici l\'aperçu de votre école.',
    studentInfo: 'Informations de l\'élève',
    feeStatus: 'Statut des frais',
    totalFees: 'Total des frais',
    paid: 'Payé',
    balanceLabel: 'Solde',
    paymentProgress: 'Progression du paiement',
    paymentHistory: 'Historique des paiements',
    noPaymentsYet: 'Aucun paiement enregistré.',
    studentNotFound: 'Élève introuvable',
    deleteConfirmGeneric: 'Êtes-vous sûr ? Cette action est irréversible.',
    fillDetails: 'Remplissez les détails ci-dessous.',
    paymentDetails: 'Détails de la transaction.',
  },

  LANGUAGE: { label: 'Langue', en: 'English', fr: 'Français', de: 'Deutsch', nl: 'Nederlands', sw: 'Kiswahili' },

  // Teacher sidebar
  SIDEBAR_TEACHER: {
    label: 'Enseignement',
    items: {
      dashboard: 'Tableau de bord',
      myClasses: 'Mes classes',
      results: 'Saisie des résultats',
      attendance: 'Présences',
      portfolio: 'Portfolio CBC',
      ptMeetings: 'Réunions parents-profs',
      announcements: 'Annonces',
      profile: 'Profil',
    },
  },

  // Portfolio
  PORTFOLIO_TEXT: {
    pageTitle: 'Portfolio numérique CBC',
    pageSubtitle: 'Gérez les portfolios d\'apprentissage des élèves dans toutes les matières CBC.',
    completionRing: { complete: 'Terminé', inProgress: 'En cours', notStarted: 'Non commencé' },
    evidence: {
      add: 'Ajouter une preuve',
      edit: 'Modifier la preuve',
      delete: 'Supprimer la preuve',
      publish: 'Publier',
      types: { photo: 'Photo', video: 'Vidéo', document: 'Document', drawing: 'Dessin', craft_photo: 'Photo artisanale', written_work: 'Travail écrit', audio: 'Audio' },
    },
    ratings: { EE: 'EE', ME: 'ME', AE: 'AE', BE: 'BE', EEFull: 'Dépasse les attentes', MEFull: 'Atteint les attentes', AEFull: 'Approche les attentes', BEFull: 'En dessous des attentes' },
    learningAreas: { empty: 'Aucune matière configurée', addArea: 'Ajouter une matière', configure: 'Configurer' },
    parentView: { downloadButton: 'Télécharger le portfolio', draftHidden: 'Les brouillons sont masqués aux parents.', noEvidenceYet: 'Aucune preuve téléchargée pour ce point.' },
    bulkUpload: { title: 'Téléchargement en masse', dropzone: 'Glissez-déposez des images ici ou cliquez', assignStudent: 'Assigner à l\'élève', saveAll: 'Tout enregistrer' },
  },

  // PT Meetings
  PT_MEETINGS_TEXT: {
    pageTitle: 'Réunions parents-professeurs',
    bookMeeting: 'Réserver une réunion',
    myMeetings: 'Mes réunions',
    session: { create: 'Créer une session', open: 'Ouvrir les réservations', close: 'Fermer les réservations', complete: 'Marquer terminé', draft: 'Brouillon' },
    slot: { available: 'Disponible', booked: 'Réservé', blocked: 'Bloqué', select: 'Choisir un créneau' },
    booking: { confirm: 'Confirmer', cancel: 'Annuler', reschedule: 'Reporter', pending: 'En attente', confirmed: 'Confirmé' },
    steps: { selectChild: 'Choisir l\'enfant', selectTeacher: 'Choisir le professeur', selectSlot: 'Choisir le créneau', confirm: 'Confirmer la réservation' },
    notifications: { bookingRequest: 'Demande de réunion envoyée', confirmed: 'Réunion confirmée', reminder: 'Rappel de réunion', cancelled: 'Réunion annulée' },
    calendar: { addToCalendar: 'Ajouter au calendrier' },
  },

  // Health
  HEALTH_TEXT: {
    pageTitle: 'Dossiers de santé',
    healthProfile: 'Profil de santé',
    condition: {
      add: 'Ajouter une condition', edit: 'Modifier', deactivate: 'Désactiver',
      types: { chronic: 'Chronique', allergy: 'Allergie', disability: 'Handicap', dietary: 'Alimentaire', mental_health: 'Santé mentale', other: 'Autre' },
      severities: { mild: 'Léger', moderate: 'Modéré', severe: 'Grave', critical: 'Critique', life_threatening: 'Potentiellement mortel' },
    },
    allergy: {
      add: 'Ajouter une allergie', remove: 'Supprimer l\'allergie', epiPen: 'EpiPen', responseProtocol: 'Protocole de réponse',
      severities: { mild: 'Léger', moderate: 'Modéré', severe: 'Grave', critical: 'Critique', life_threatening: 'Potentiellement mortel' },
    },
    vaccination: { add: 'Ajouter un vaccin', edit: 'Modifier', statuses: { up_to_date: 'À jour', due_soon: 'Bientôt dû', overdue: 'En retard' }, dueDate: 'Date d\'échéance', upToDate: 'À jour' },
    incident: {
      record: 'Enregistrer un incident', resolve: 'Résoudre', followUp: 'Suivi', parentNotify: 'Parent informé',
      types: { injury: 'Blessure', illness: 'Maladie', allergic_reaction: 'Réaction allergique', mental_health: 'Santé mentale', emergency: 'Urgence', other: 'Autre' },
    },
    emergency: { contacts: 'Contacts d\'urgence', addContact: 'Ajouter un contact', priority: 'Priorité' },
    documents: { upload: 'Télécharger un document', download: 'Télécharger', types: { medical_certificate: 'Certificat médical', vaccination_card: 'Carnet de vaccination', doctor_letter: 'Lettre du médecin', disability_assessment: 'Évaluation du handicap', insurance_card: 'Carte d\'assurance', other: 'Autre' } },
    tripSheet: { generate: 'Générer la fiche de sortie', selectClass: 'Sélectionner la classe', format: 'Format' },
    parentView: { flagUpdate: 'Signaler une mise à jour', downloadSummary: 'Télécharger le résumé de santé', updatePending: 'Mise à jour en attente' },
    alerts: { severeCondition: 'Condition grave', lifeThreateningAllergy: 'Allergie potentiellement mortelle', vaccinationDue: 'Vaccination due' },
  },

  // Teacher dashboard
  TEACHER_DASHBOARD_TEXT: {
    title: 'Tableau de bord enseignant',
    subtitle: 'Bienvenue. Voici votre aperçu d\'enseignement.',
    kpi: { myClasses: 'Mes classes', myStudents: 'Mes élèves', assessmentsSubmitted: 'Évaluations soumises', attendanceRate: 'Taux de présence' },
    schedule: 'Emploi du temps du jour',
    classPerformance: 'Performance de la classe',
    attendanceTrend: 'Tendance des présences',
    gradeDistribution: 'Distribution des notes (CBC)',
    lowAttendance: 'Élèves avec faible présence (<80%)',
    pendingPortfolios: 'Portfolios en attente de révision',
  },

  // Teacher pages
  TEACHER_CLASSES_TEXT: {
    title: 'Mes classes',
    subtitle: 'Consultez et gérez vos classes.',
    classDetail: 'Détail de la classe',
    tabs: { students: 'Élèves', results: 'Résultats', attendance: 'Présences', portfolio: 'Portfolio', announcements: 'Annonces' },
  },

  TEACHER_RESULTS_TEXT: {
    title: 'Saisie des résultats',
    subtitle: 'Entrez et soumettez les résultats des examens.',
    steps: { selectExam: 'Choisir l\'examen', enterScores: 'Saisir les notes', review: 'Réviser et soumettre' },
    fields: { term: 'Trimestre', exam: 'Examen', subject: 'Matière', class: 'Classe', score: 'Note', grade: 'Niveau', remarks: 'Remarques' },
    actions: { saveDraft: 'Enregistrer brouillon', submit: 'Soumettre pour révision', bulkUpload: 'Import CSV en masse' },
    cbcMode: { strand: 'Axe', rating: 'Évaluation' },
  },

  TEACHER_ATTENDANCE_TEXT: {
    title: 'Enregistrement des présences',
    subtitle: 'Enregistrez les présences quotidiennes.',
    modes: { manual: 'Saisie manuelle', upload: 'Importer une feuille' },
    status: { present: 'Présent', absent: 'Absent', late: 'En retard', excused: 'Excusé' },
    actions: { submit: 'Soumettre les présences', uploadFile: 'Importer un fichier' },
    history: 'Historique des présences',
  },

  TEACHER_ANNOUNCEMENTS_TEXT: {
    title: 'Annonces',
    subtitle: 'Envoyez des annonces aux parents et aux élèves.',
    create: 'Créer une annonce',
    fields: { title: 'Titre', body: 'Message', target: 'Public cible', priority: 'Priorité', category: 'Catégorie' },
    priorities: { normal: 'Normal', important: 'Important', urgent: 'Urgent' },
    categories: { general: 'Général', cbcMaterials: 'Matériel CBC', event: 'Événement', health: 'Avis de santé', academic: 'Académique', portfolio: 'Portfolio' },
  },

  // Accountant sidebar
  SIDEBAR_ACCOUNTANT: {
    label: 'Finance',
    items: {
      dashboard: 'Tableau de bord',
      feeStructures: 'Structures tarifaires',
      invoicing: 'Facturation',
      payments: 'Paiements',
      reconciliation: 'Rapprochement',
      reports: 'Rapports financiers',
      expenses: 'Dépenses',
      integrations: 'Intégrations',
      paymentGateway: 'Config. paiement',
    },
  },

  // Accountant pages
  ACCOUNTANT_DASHBOARD_TEXT: {
    title: 'Tableau de bord comptable',
    subtitle: 'Opérations financières quotidiennes et aperçu du rapprochement.',
    kpi: {
      dailyCollections: 'Collectes du jour',
      pendingReconciliation: 'Rapprochement en attente',
      unmatchedTransactions: 'Transactions non appariées',
      outstandingInvoices: 'Factures impayées',
      paymentSuccessRate: 'Taux de succès des paiements',
      pettyCashBalance: 'Solde petite caisse',
    },
    collectionTrend: 'Collecte vs Facturé',
    paymentMethods: 'Répartition des modes de paiement',
    receivablesAging: 'Vieillissement des créances',
    recentActivity: 'Activité de paiement du jour',
    reconciliationQueue: 'File de rapprochement',
    integrationStatus: 'Statut des intégrations',
  },

  ACCOUNTANT_INVOICING_TEXT: {
    title: 'Gestion des factures',
    subtitle: 'Générez, envoyez et gérez les factures de frais.',
    searchPlaceholder: 'Rechercher par numéro de facture ou élève...',
    generateInvoices: 'Générer des factures',
    sendReminder: 'Envoyer un rappel',
    table: { invoiceNo: 'N° facture', student: 'Élève', grade: 'Niveau', term: 'Trimestre', total: 'Total', paid: 'Payé', balance: 'Solde', status: 'Statut', dueDate: 'Date d\'échéance', actions: 'Actions' },
    filters: { allStatus: 'Tous les statuts', allGrades: 'Tous les niveaux' },
    actions: { send: 'Envoyer', void: 'Annuler', download: 'Télécharger PDF', markPaid: 'Marquer payé', viewDetails: 'Voir les détails' },
    emptyState: { title: 'Aucune facture', description: 'Générez des factures en début de trimestre.' },
  },

  ACCOUNTANT_RECONCILIATION_TEXT: {
    title: 'Rapprochement bancaire',
    subtitle: 'Associez les transactions bancaires aux paiements du système.',
    importStatement: 'Importer un relevé bancaire',
    autoMatch: 'Auto-associer',
    tabs: { matched: 'Associés', suggested: 'Suggestions', unmatchedBank: 'Banque non associée', unmatchedSystem: 'Système non associé' },
    confidence: { high: 'Élevé', medium: 'Moyen', low: 'Faible' },
    actions: { confirmMatch: 'Confirmer', rejectMatch: 'Rejeter', manualMatch: 'Association manuelle', markComplete: 'Terminer le rapprochement' },
  },

  ACCOUNTANT_REPORTS_TEXT: {
    title: 'Rapports financiers',
    subtitle: 'Générez et exportez des rapports financiers complets.',
    reports: {
      incomeStatement: 'Compte de résultat',
      cashFlow: 'Tableau des flux de trésorerie',
      feeCollection: 'Rapport de collecte des frais',
      outstanding: 'Rapport des frais impayés',
      paymentMethod: 'Analyse des modes de paiement',
      aging: 'Rapport de vieillissement des créances',
      audit: 'Rapport de piste d\'audit',
    },
    actions: { generate: 'Générer le rapport', export: 'Exporter', schedule: 'Planifier', compare: 'Comparer les périodes' },
  },

  ACCOUNTANT_EXPENSES_TEXT: {
    title: 'Suivi des dépenses',
    subtitle: 'Enregistrez et catégorisez les dépenses scolaires.',
    addExpense: 'Ajouter une dépense',
    table: { date: 'Date', category: 'Catégorie', description: 'Description', amount: 'Montant', vendor: 'Fournisseur', status: 'Statut', actions: 'Actions' },
    emptyState: { title: 'Aucune dépense enregistrée', description: 'Commencez le suivi des dépenses.' },
  },

  ACCOUNTANT_INTEGRATIONS_TEXT: {
    title: 'Intégrations comptables',
    subtitle: 'Connectez et gérez les intégrations de logiciels comptables.',
    connect: 'Connecter',
    disconnect: 'Déconnecter',
    syncNow: 'Synchroniser maintenant',
    lastSynced: 'Dernière synchronisation',
    syncFrequency: 'Fréquence de synchronisation',
    itemsSynced: 'Éléments synchronisés',
    syncErrors: 'Erreurs de synchronisation',
  },

  ACCOUNTANT_PAYMENTS_TEXT: {
    title: 'Traitement des paiements',
    subtitle: 'Enregistrez et approuvez les transactions de paiement.',
    recordPayment: 'Enregistrer un paiement',
    approvalQueue: 'File d\'approbation',
  },
};

export default fr;
