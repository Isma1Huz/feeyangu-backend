import type { Translations } from './en';

const nl: Partial<Translations> & Record<string, any> = {
  APP_NAME: 'Feeyangu',
  APP_TAGLINE: 'Slim schoolgeldenbeheer',
  APP_DESCRIPTION: 'Vereenvoudig het innen, volgen en rapporteren van schoolgelden.',

  AUTH_TEXT: {
    login: { title: 'Welkom terug', subtitle: 'Meld u aan om door te gaan', emailLabel: 'E-mailadres', emailPlaceholder: 'Voer uw e-mail in', passwordLabel: 'Wachtwoord', passwordPlaceholder: 'Voer uw wachtwoord in', rememberMe: 'Onthoud mij', forgotPassword: 'Wachtwoord vergeten?', submitButton: 'Inloggen', noAccount: 'Geen account?', registerLink: 'Maak er een', orContinue: 'Of ga verder met' },
    register: { title: 'Maak uw account aan', subtitle: 'Begin vandaag met Feeyangu', nameLabel: 'Volledige naam', namePlaceholder: 'Voer uw naam in', emailLabel: 'E-mailadres', emailPlaceholder: 'Voer uw e-mail in', passwordLabel: 'Wachtwoord', passwordPlaceholder: 'Maak een wachtwoord', confirmPasswordLabel: 'Bevestig wachtwoord', confirmPasswordPlaceholder: 'Bevestig uw wachtwoord', roleLabel: 'Ik ben een', roleParent: 'Ouder', roleSchoolAdmin: 'Schoolbeheerder', schoolNameLabel: 'Schoolnaam', schoolNamePlaceholder: 'Voer schoolnaam in', termsText: 'Ik ga akkoord met de', termsLink: 'Voorwaarden', submitButton: 'Account aanmaken', hasAccount: 'Al een account?', loginLink: 'Inloggen' },
    forgotPassword: { title: 'Wachtwoord resetten', subtitle: 'Voer uw e-mail in, we sturen u een resetlink', emailLabel: 'E-mailadres', emailPlaceholder: 'Voer uw e-mail in', submitButton: 'Resetlink sturen', backToLogin: 'Terug naar inloggen', successMessage: 'Controleer uw e-mail voor een resetlink.' },
  },

  SIDEBAR_TEXT: {
    superAdmin: { label: 'Platform', items: { dashboard: 'Dashboard', schools: 'Scholen', users: 'Gebruikers', settings: 'Instellingen' } },
    schoolAdmin: {
      main: { label: 'Hoofd', items: { dashboard: 'Dashboard', students: 'Leerlingen', grades: 'Klassen & Niveaus' } },
      finance: { label: 'Financiën', items: { feeStructures: 'Tariefstructuren', payments: 'Betalingen', receipts: 'Bonnen' } },
      settings: { label: 'Instellingen', items: { paymentMethods: 'Betaalmethoden', terms: 'Schoolperiodes', settings: 'Schoolinstellingen' } },
    },
    parent: { label: 'Menu', items: { dashboard: 'Dashboard', children: 'Mijn kinderen', payments: 'Betalingsgeschiedenis', receipts: 'Bonnen', ptMeetings: 'Oudergesprekken' } },
  },

  DASHBOARD_TEXT: {
    school: {
      title: 'Schooldashboard', bannerTitle: 'Welkom bij uw schoolportaal', bannerDescription: 'Beheer leerlingen, volg betalingen en genereer rapporten.',
      kpi: { totalStudents: 'Totaal leerlingen', feesCollected: 'Geïnd', pendingFees: 'Openstaand', overdueAccounts: 'Achterstallig' },
      revenueChart: 'Maandelijkse inkomsten', recentPayments: 'Recente betalingen', overdueAlert: 'Achterstallige meldingen',
    },
    parent: {
      title: 'Home', subtitle: 'Overzicht van het schoolgeldbeheer van uw kinderen',
      bannerTitle: 'Beheer de schoolgelden van uw kinderen', bannerDescription: 'Bekijk saldi, doe betalingen en download bonnen.',
      bannerAction: 'Betaling doen', childrenSection: 'Mijn kinderen', outstandingFees: 'Totaal openstaand', recentPayments: 'Recente betalingen', quickPay: 'Snelbetalen', viewFees: 'Gelden bekijken',
      overviewTitle: 'Overzicht - Huidige periode 2026', totalFeesDue: 'Totaal verschuldigd', totalPaid: 'Totaal betaald',
    },
    admin: {
      title: 'Platformoverzicht', bannerTitle: 'Feeyangu Beheerconsole', bannerDescription: 'Monitor statistieken, beheer scholen en gebruikers.',
      kpi: { totalSchools: 'Totaal scholen', activeUsers: 'Actieve gebruikers', monthlyRevenue: 'Maandelijkse inkomsten', pendingApprovals: 'Wachtende goedkeuringen' },
      topSchools: 'Beste scholen', recentActivity: 'Recente activiteit',
    },
  },

  STUDENTS_TEXT: {
    title: 'Leerlingen', searchPlaceholder: 'Zoek op naam of toelatingsnummer...', addStudent: 'Leerling toevoegen', importCsv: 'CSV importeren', exportCsv: 'CSV exporteren',
    filters: { grade: 'Alle niveaus', status: 'Alle statussen', class: 'Alle klassen' },
    table: { admissionNo: 'Toelatingsnr.', name: 'Leerlingnaam', grade: 'Niveau', class: 'Klas', parent: 'Ouder', fees: 'Geldenstatus', status: 'Status', actions: 'Acties' },
    emptyState: { title: 'Geen leerlingen gevonden', description: 'Voeg een leerling toe of importeer uit CSV.' },
    form: { createTitle: 'Nieuwe leerling toevoegen', editTitle: 'Leerling bewerken', firstName: 'Voornaam', lastName: 'Achternaam', admissionNumber: 'Toelatingsnummer', grade: 'Niveau', className: 'Klas', parentName: 'Oudernaam', parentEmail: 'Ouder e-mail', status: 'Status' },
  },

  GRADES_TEXT: {
    title: 'Niveaus & Klassen', subtitle: 'Beheer schoolniveaus en klasindeling.',
    addGrade: 'Niveau toevoegen', addClass: 'Klas toevoegen', editGrade: 'Niveau bewerken', deleteGrade: 'Niveau verwijderen', editClass: 'Klas bewerken', deleteClass: 'Klas verwijderen',
    table: { grade: 'Niveau', classes: 'Klassen', students: 'Leerlingen', actions: 'Acties' },
    classTable: { name: 'Klasnaam', teacher: 'Klasleerkracht', students: 'Leerlingen', actions: 'Acties' },
    form: { gradeName: 'Niveaunaam', gradeNamePlaceholder: 'bijv. Niveau 5', className: 'Klasnaam', classNamePlaceholder: 'bijv. 5A', teacher: 'Klasleerkracht', teacherPlaceholder: 'bijv. Mevr. Kamau', selectGrade: 'Niveau kiezen' },
    emptyState: { title: 'Geen niveaus', description: 'Maak uw eerste niveau aan.' },
    deleteConfirm: 'Weet u het zeker? Deze actie kan niet ongedaan worden gemaakt.',
  },

  FEE_STRUCTURES_TEXT: {
    title: 'Tariefstructuren', subtitle: 'Definieer en beheer tariefstructuren.',
    addFeeStructure: 'Structuur toevoegen', editFeeStructure: 'Structuur bewerken',
    table: { name: 'Naam', grade: 'Niveau', term: 'Periode', totalAmount: 'Totaalbedrag', status: 'Status', actions: 'Acties' },
    detail: { feeBreakdown: 'Specificatie', itemName: 'Post', itemAmount: 'Bedrag', addItem: 'Post toevoegen', total: 'Totaal' },
    form: { name: 'Structuurnaam', namePlaceholder: 'bijv. Niveau 5 - Per. 1 2026', grade: 'Niveau', term: 'Periode', status: 'Status', feeItemName: 'Postnaam', feeItemNamePlaceholder: 'bijv. Schoolgeld', feeItemAmount: 'Bedrag' },
    emptyState: { title: 'Geen tariefstructuren', description: 'Maak structuren aan om gelden toe te wijzen.' },
  },

  PAYMENTS_TEXT: {
    title: 'Betalingen', subtitle: 'Bekijk en beheer alle transacties.', searchPlaceholder: 'Zoek op naam of referentie...', exportCsv: 'CSV exporteren',
    table: { date: 'Datum', student: 'Leerling', amount: 'Bedrag', method: 'Methode', status: 'Status', reference: 'Referentie', actions: 'Acties' },
    filters: { allMethods: 'Alle methoden', allStatus: 'Alle statussen' },
    actions: { approve: 'Goedkeuren', reject: 'Afwijzen', viewDetails: 'Details bekijken' },
    emptyState: { title: 'Geen betalingen gevonden', description: 'Betalingen verschijnen hier na ontvangst.' },
  },

  RECEIPTS_TEXT: {
    title: 'Bonnen', subtitle: 'Bekijk en download betalingsbonnen.', searchPlaceholder: 'Zoek op bonnummer of leerling...',
    table: { receiptNo: 'Bon-nr.', date: 'Datum', student: 'Leerling', amount: 'Bedrag', method: 'Methode', actions: 'Acties' },
    preview: { title: 'Bonvoorbeeld', schoolName: 'Green Valley Academy', receiptLabel: 'Bon', dateLabel: 'Datum', studentLabel: 'Leerling', referenceLabel: 'Betalingsreferentie', methodLabel: 'Betaalmethode', itemLabel: 'Omschrijving', amountLabel: 'Bedrag', totalLabel: 'Totaal betaald' },
    emptyState: { title: 'Geen bonnen gevonden', description: 'Bonnen worden aangemaakt na betalingen.' },
  },

  PAYMENT_METHODS_TEXT: {
    title: 'Betaalmethoden', subtitle: 'Configureer de beschikbare betaalmethoden.', addMethod: 'Methode toevoegen',
    table: { name: 'Naam', type: 'Type', details: 'Details', enabled: 'Ingeschakeld', actions: 'Acties' },
    form: { name: 'Methodenaam', namePlaceholder: 'bijv. M-Pesa Paybill', type: 'Type', details: 'Details / Instructies', detailsPlaceholder: 'bijv. Paybill: 123456', enabled: 'Ingeschakeld' },
    emptyState: { title: 'Geen betaalmethoden', description: 'Voeg betaalmethoden toe voor ouders.' },
  },

  TERMS_TEXT: {
    title: 'Schoolperiodes', subtitle: 'Beheer periodes en de schoolkalender.', addTerm: 'Periode toevoegen',
    table: { name: 'Naam', year: 'Jaar', startDate: 'Startdatum', endDate: 'Einddatum', status: 'Status', actions: 'Acties' },
    form: { name: 'Periodenaam', namePlaceholder: 'bijv. Periode 1 2026', year: 'Jaar', startDate: 'Startdatum', endDate: 'Einddatum', status: 'Status' },
    emptyState: { title: 'Geen periodes', description: 'Maak periodes aan voor de schoolkalender.' },
  },

  SCHOOL_SETTINGS_TEXT: {
    title: 'Schoolinstellingen', subtitle: 'Pas schoolprofiel en voorkeuren aan.',
    sections: { profile: 'Schoolprofiel', branding: 'Huisstijl', subscription: 'Abonnement' },
    fields: { schoolName: 'Schoolnaam', schoolNamePlaceholder: 'Naam invoeren', motto: 'Schoolmotto', mottoPlaceholder: 'Motto invoeren', location: 'Locatie', locationPlaceholder: 'Locatie invoeren', email: 'Contact e-mail', emailPlaceholder: 'E-mail invoeren', phone: 'Telefoonnummer', phonePlaceholder: 'Nummer invoeren', primaryColor: 'Primaire kleur', secondaryColor: 'Secundaire kleur', logo: 'Schoollogo', uploadLogo: 'Logo uploaden' },
    subscription: { plan: 'Huidig plan', planValue: 'Premium', status: 'Status', statusValue: 'Actief', nextBilling: 'Volgende facturering', nextBillingValue: '1 maart 2026' },
    saveButton: 'Opslaan', savedMessage: 'Instellingen opgeslagen.',
  },

  COMMON_TEXT: {
    actions: { save: 'Opslaan', cancel: 'Annuleren', delete: 'Verwijderen', edit: 'Bewerken', view: 'Bekijken', create: 'Aanmaken', export: 'Exporteren', import: 'Importeren', search: 'Zoeken', filter: 'Filteren', refresh: 'Vernieuwen', download: 'Downloaden', print: 'Afdrukken', close: 'Sluiten', confirm: 'Bevestigen', back: 'Terug', next: 'Volgende' },
    status: { active: 'Actief', inactive: 'Inactief', pending: 'In afwachting', completed: 'Voltooid', failed: 'Mislukt', overdue: 'Achterstallig', paid: 'Betaald', partial: 'Gedeeltelijk', suspended: 'Opgeschort', upcoming: 'Aankomend' },
    currency: 'KES', noData: 'Geen gegevens beschikbaar', loading: 'Laden...', logout: 'Uitloggen', profile: 'Profiel', notifications: 'Meldingen', settings: 'Instellingen',
    vsLastMonth: 'vs vorige maand', notFoundTitle: '404', notFoundMessage: 'Pagina niet gevonden', notFoundLink: 'Terug naar home',
  },

  PAYMENT_METHOD_LABELS: { mpesa: 'M-Pesa', bank: 'Bankoverschrijving', cash: 'Contant', card: 'Kaart' },

  PARENT_CHILDREN_TEXT: { title: 'Mijn kinderen', subtitle: 'Bekijk gelden en doe betalingen.', viewFees: 'Gelden bekijken', quickPay: 'Snelbetalen', feeProgress: 'Geldenvoortgang' },
  PARENT_FEES_TEXT: { title: 'Geldendetails', subtitle: 'Specificatie en betalingsstatus', item: 'Geldenpost', total: 'Totaal', paid: 'Betaald', balance: 'Saldo', status: 'Status', payNow: 'Nu betalen', backToChildren: 'Terug naar kinderen', totalOutstanding: 'Totaal openstaand' },
  PARENT_PAY_TEXT: { title: 'Betaling doen', selectMethod: 'Betaalmethode kiezen', amount: 'Bedrag (KES)', reference: 'Betalingsreferentie', referencePlaceholder: 'bijv. M-Pesa transactiecode', submitPayment: 'Betaling verzenden', cancel: 'Annuleren' },
  PARENT_PAYMENTS_TEXT: { title: 'Betalingsgeschiedenis', subtitle: 'Bekijk al uw betalingen.', searchPlaceholder: 'Zoek op referentie...', filterChild: 'Alle kinderen', table: { date: 'Datum', child: 'Kind', amount: 'Bedrag', method: 'Methode', status: 'Status', reference: 'Referentie' }, emptyState: { title: 'Nog geen betalingen', description: 'Uw betalingsgeschiedenis verschijnt hier.' } },
  PARENT_RECEIPTS_TEXT: { title: 'Bonnen', subtitle: 'Download en print uw bonnen.', searchPlaceholder: 'Zoek op bonnummer...', filterChild: 'Alle kinderen', table: { receiptNo: 'Bon-nr.', date: 'Datum', child: 'Kind', amount: 'Bedrag', actions: 'Acties' }, emptyState: { title: 'Geen bonnen', description: 'Bonnen verschijnen na betalingen.' } },

  ADMIN_SCHOOLS_TEXT: {
    title: 'Scholen', subtitle: 'Beheer alle scholen op het platform.', addSchool: 'School toevoegen', searchPlaceholder: 'Scholen zoeken...',
    table: { name: 'Schoolnaam', owner: 'Eigenaar', location: 'Locatie', students: 'Leerlingen', feesCollected: 'Geïnd', status: 'Status', actions: 'Acties' },
    form: { name: 'Schoolnaam', namePlaceholder: 'Naam invoeren', owner: 'Eigenaar', ownerPlaceholder: 'Eigenaarnaam invoeren', location: 'Locatie', locationPlaceholder: 'Locatie invoeren', status: 'Status' },
    emptyState: { title: 'Geen scholen', description: 'Nog geen scholen geregistreerd.' },
    actions: { activate: 'Activeren', suspend: 'Opschorten', delete: 'Verwijderen' },
  },

  ADMIN_USERS_TEXT: {
    title: 'Gebruikers', subtitle: 'Beheer alle platformgebruikers.', searchPlaceholder: 'Gebruikers zoeken...', filterRole: 'Alle rollen', filterStatus: 'Alle statussen',
    table: { name: 'Naam', email: 'E-mail', role: 'Rol', school: 'School', status: 'Status', lastLogin: 'Laatste login', actions: 'Acties' },
    actions: { deactivate: 'Deactiveren', activate: 'Activeren', resetPassword: 'Wachtwoord resetten' },
    emptyState: { title: 'Geen gebruikers gevonden', description: 'Gebruikers verschijnen hier.' },
  },

  ADMIN_SETTINGS_TEXT: {
    title: 'Platforminstellingen', subtitle: 'Configureer globale instellingen.',
    sections: { general: 'Algemeen', notifications: 'Meldingen', billing: 'Facturering' },
    fields: { platformName: 'Platformnaam', platformNamePlaceholder: 'Feeyangu', supportEmail: 'Support e-mail', supportEmailPlaceholder: 'support@feeyangu.com', defaultCurrency: 'Standaardvaluta', maintenanceMode: 'Onderhoudsmodus', emailNotifications: 'E-mailmeldingen', smsNotifications: 'SMS-meldingen', paymentAlerts: 'Betalingsmeldingen', overdueReminders: 'Achterstallige herinneringen' },
    saveButton: 'Opslaan', savedMessage: 'Platforminstellingen opgeslagen.',
  },

  HEADER: {
    roleLabels: { super_admin: 'Super Admin', school_admin: 'Schoolbeheerder', parent: 'Ouder' },
    childrenSummary: 'Kinderoverzicht', recentReceipts: 'Recente bonnen', viewAll: 'Alles bekijken', feeProgress: 'Geldenvoortgang', daysOverdue: 'dagen achterstallig',
    platformStats: 'Platformstatistieken en beheer.', welcomeBack: 'Welkom terug. Hier is uw schooloverzicht.',
    studentInfo: 'Leerlinginformatie', feeStatus: 'Geldenstatus', totalFees: 'Totaal gelden', paid: 'Betaald', balanceLabel: 'Saldo', paymentProgress: 'Betalingsvoortgang', paymentHistory: 'Betalingsgeschiedenis', noPaymentsYet: 'Nog geen betalingen.', studentNotFound: 'Leerling niet gevonden',
    deleteConfirmGeneric: 'Weet u het zeker? Dit kan niet ongedaan worden gemaakt.', fillDetails: 'Vul de details hieronder in.', paymentDetails: 'Betalingstransactiedetails.',
  },

  LANGUAGE: { label: 'Taal', en: 'English', fr: 'Français', de: 'Deutsch', nl: 'Nederlands', sw: 'Kiswahili' },

  // Teacher sidebar
  SIDEBAR_TEACHER: {
    label: 'Onderwijs',
    items: {
      dashboard: 'Dashboard',
      myClasses: 'Mijn klassen',
      results: 'Resultaten invoeren',
      attendance: 'Aanwezigheid',
      portfolio: 'CBC Portfolio',
      ptMeetings: 'Oudergesprekken',
      announcements: 'Aankondigingen',
      profile: 'Profiel',
    },
  },

  // Portfolio
  PORTFOLIO_TEXT: {
    pageTitle: 'CBC Digitaal Portfolio',
    pageSubtitle: 'Beheer leerportfolios voor alle CBC-leergebieden.',
    completionRing: { complete: 'Voltooid', inProgress: 'Bezig', notStarted: 'Niet begonnen' },
    evidence: {
      add: 'Bewijs toevoegen',
      edit: 'Bewijs bewerken',
      delete: 'Bewijs verwijderen',
      publish: 'Publiceren',
      types: { photo: 'Foto', video: 'Video', document: 'Document', drawing: 'Tekening', craft_photo: 'Knutselfoto', written_work: 'Schriftelijk werk', audio: 'Audio' },
    },
    ratings: { EE: 'EE', ME: 'ME', AE: 'AE', BE: 'BE', EEFull: 'Overtreft verwachtingen', MEFull: 'Voldoet aan verwachtingen', AEFull: 'Nadert verwachtingen', BEFull: 'Onder verwachtingen' },
    learningAreas: { empty: 'Geen leergebieden geconfigureerd', addArea: 'Leergebied toevoegen', configure: 'Configureren' },
    parentView: { downloadButton: 'Portfolio downloaden', draftHidden: 'Concepten zijn verborgen voor ouders.', noEvidenceYet: 'Nog geen bewijs geüpload voor dit onderdeel.' },
    bulkUpload: { title: 'Bulk uploaden', dropzone: 'Afbeeldingen hierheen slepen of klikken', assignStudent: 'Aan leerling toewijzen', saveAll: 'Alles opslaan' },
  },

  // PT Meetings
  PT_MEETINGS_TEXT: {
    pageTitle: 'Oudergesprekken',
    bookMeeting: 'Gesprek boeken',
    myMeetings: 'Mijn gesprekken',
    session: { create: 'Sessie aanmaken', open: 'Openen voor boeking', close: 'Boeking sluiten', complete: 'Markeer als voltooid', draft: 'Concept' },
    slot: { available: 'Beschikbaar', booked: 'Geboekt', blocked: 'Geblokkeerd', select: 'Tijdslot kiezen' },
    booking: { confirm: 'Bevestigen', cancel: 'Annuleren', reschedule: 'Verzetten', pending: 'In afwachting', confirmed: 'Bevestigd' },
    steps: { selectChild: 'Kind kiezen', selectTeacher: 'Leerkracht kiezen', selectSlot: 'Tijdslot kiezen', confirm: 'Boeking bevestigen' },
    notifications: { bookingRequest: 'Gesprekverzoek verzonden', confirmed: 'Gesprek bevestigd', reminder: 'Gesprekherinnering', cancelled: 'Gesprek geannuleerd' },
    calendar: { addToCalendar: 'Aan kalender toevoegen' },
  },

  // Health
  HEALTH_TEXT: {
    pageTitle: 'Gezondheids- en medische dossiers',
    healthProfile: 'Gezondheidsprofiel',
    condition: {
      add: 'Aandoening toevoegen', edit: 'Bewerken', deactivate: 'Deactiveren',
      types: { chronic: 'Chronisch', allergy: 'Allergie', disability: 'Beperking', dietary: 'Voeding', mental_health: 'Geestelijke gezondheid', other: 'Overig' },
      severities: { mild: 'Licht', moderate: 'Matig', severe: 'Ernstig', critical: 'Kritiek', life_threatening: 'Levensbedreigend' },
    },
    allergy: {
      add: 'Allergie toevoegen', remove: 'Allergie verwijderen', epiPen: 'EpiPen', responseProtocol: 'Reactieprotocol',
      severities: { mild: 'Licht', moderate: 'Matig', severe: 'Ernstig', critical: 'Kritiek', life_threatening: 'Levensbedreigend' },
    },
    vaccination: { add: 'Vaccinatie toevoegen', edit: 'Bewerken', statuses: { up_to_date: 'Actueel', due_soon: 'Binnenkort', overdue: 'Achterstallig' }, dueDate: 'Vervaldatum', upToDate: 'Actueel' },
    incident: {
      record: 'Incident vastleggen', resolve: 'Oplossen', followUp: 'Opvolgen', parentNotify: 'Ouder geïnformeerd',
      types: { injury: 'Letsel', illness: 'Ziekte', allergic_reaction: 'Allergische reactie', mental_health: 'Geestelijke gezondheid', emergency: 'Noodgeval', other: 'Overig' },
    },
    emergency: { contacts: 'Noodcontacten', addContact: 'Contact toevoegen', priority: 'Prioriteit' },
    documents: { upload: 'Document uploaden', download: 'Downloaden', types: { medical_certificate: 'Medisch attest', vaccination_card: 'Vaccinatieboekje', doctor_letter: 'Doktersbrief', disability_assessment: 'Beperking beoordeling', insurance_card: 'Verzekeringskaart', other: 'Overig' } },
    tripSheet: { generate: 'Uitstaplijst genereren', selectClass: 'Klas selecteren', format: 'Formaat' },
    parentView: { flagUpdate: 'Update melden', downloadSummary: 'Gezondheidsoverzicht downloaden', updatePending: 'Update in behandeling' },
    alerts: { severeCondition: 'Ernstige aandoening', lifeThreateningAllergy: 'Levensbedreigende allergie', vaccinationDue: 'Vaccinatie vervallen' },
  },

  // Teacher dashboard
  TEACHER_DASHBOARD_TEXT: {
    title: 'Leerkrachtdashboard',
    subtitle: 'Welkom terug. Hier is uw onderwijsoverzicht.',
    kpi: { myClasses: 'Mijn klassen', myStudents: 'Mijn leerlingen', assessmentsSubmitted: 'Ingediende beoordelingen', attendanceRate: 'Aanwezigheidspercentage' },
    schedule: 'Rooster van vandaag',
    classPerformance: 'Klassenprestaties',
    attendanceTrend: 'Aanwezigheidstrend',
    gradeDistribution: 'Cijferverdeling (CBC)',
    lowAttendance: 'Leerlingen met lage aanwezigheid (<80%)',
    pendingPortfolios: 'Portfoliobeoordelingen in behandeling',
  },

  // Teacher pages
  TEACHER_CLASSES_TEXT: {
    title: 'Mijn klassen',
    subtitle: 'Uw toegewezen klassen bekijken en beheren.',
    classDetail: 'Klasdetails',
    tabs: { students: 'Leerlingen', results: 'Resultaten', attendance: 'Aanwezigheid', portfolio: 'Portfolio', announcements: 'Aankondigingen' },
  },

  TEACHER_RESULTS_TEXT: {
    title: 'Resultaten invoeren',
    subtitle: 'Examenresultaten invoeren en indienen.',
    steps: { selectExam: 'Examen kiezen', enterScores: 'Cijfers invoeren', review: 'Beoordelen & indienen' },
    fields: { term: 'Periode', exam: 'Examen', subject: 'Vak', class: 'Klas', score: 'Cijfer', grade: 'Niveau', remarks: 'Opmerkingen' },
    actions: { saveDraft: 'Opslaan als concept', submit: 'Indienen voor beoordeling', bulkUpload: 'Bulk CSV upload' },
    cbcMode: { strand: 'Onderdeel', rating: 'Beoordeling' },
  },

  TEACHER_ATTENDANCE_TEXT: {
    title: 'Aanwezigheid registreren',
    subtitle: 'Dagelijkse aanwezigheid van leerlingen registreren.',
    modes: { manual: 'Handmatige invoer', upload: 'Lijst uploaden' },
    status: { present: 'Aanwezig', absent: 'Afwezig', late: 'Te laat', excused: 'Verontschuldigd' },
    actions: { submit: 'Aanwezigheid indienen', uploadFile: 'Bestand uploaden' },
    history: 'Aanwezigheidsgeschiedenis',
  },

  TEACHER_ANNOUNCEMENTS_TEXT: {
    title: 'Aankondigingen',
    subtitle: 'Aankondigingen versturen aan ouders en leerlingen.',
    create: 'Aankondiging aanmaken',
    fields: { title: 'Titel', body: 'Bericht', target: 'Doelgroep', priority: 'Prioriteit', category: 'Categorie' },
    priorities: { normal: 'Normaal', important: 'Belangrijk', urgent: 'Urgent' },
    categories: { general: 'Algemeen', cbcMaterials: 'CBC-materialen', event: 'Evenement', health: 'Gezondheidsmededeling', academic: 'Academisch', portfolio: 'Portfolio' },
  },

  // Accountant sidebar
  SIDEBAR_ACCOUNTANT: {
    label: 'Financiën',
    items: {
      dashboard: 'Dashboard',
      feeStructures: 'Tariefstructuren',
      invoicing: 'Facturering',
      payments: 'Betalingen',
      reconciliation: 'Afstemming',
      reports: 'Financiële rapporten',
      expenses: 'Uitgaven',
      integrations: 'Integraties',
      paymentGateway: 'Betalingsconfiguratie',
    },
  },

  // Accountant pages
  ACCOUNTANT_DASHBOARD_TEXT: {
    title: 'Boekhoudersdashboard',
    subtitle: 'Dagelijkse financiële operaties en afstemmingsoverzicht.',
    kpi: {
      dailyCollections: 'Dagelijkse inningen',
      pendingReconciliation: 'Afstemming in behandeling',
      unmatchedTransactions: 'Niet-afgestemde transacties',
      outstandingInvoices: 'Openstaande facturen',
      paymentSuccessRate: 'Betalingsslagingspercentage',
      pettyCashBalance: 'Kleine kassaldo',
    },
    collectionTrend: 'Inning vs. gefactureerd',
    paymentMethods: 'Verdeling betaalmethoden',
    receivablesAging: 'Ouderdom vorderingen',
    recentActivity: 'Betalingsactiviteit van vandaag',
    reconciliationQueue: 'Afstemmingswachtrij',
    integrationStatus: 'Integratiestatus',
  },

  ACCOUNTANT_INVOICING_TEXT: {
    title: 'Factuurbeheer',
    subtitle: 'Schoolgeldfacturen genereren, verzenden en beheren.',
    searchPlaceholder: 'Zoek op factuurnummer of leerling...',
    generateInvoices: 'Facturen genereren',
    sendReminder: 'Herinnering sturen',
    table: { invoiceNo: 'Factuur-nr.', student: 'Leerling', grade: 'Niveau', term: 'Periode', total: 'Totaal', paid: 'Betaald', balance: 'Saldo', status: 'Status', dueDate: 'Vervaldatum', actions: 'Acties' },
    filters: { allStatus: 'Alle statussen', allGrades: 'Alle niveaus' },
    actions: { send: 'Versturen', void: 'Annuleren', download: 'PDF downloaden', markPaid: 'Markeer als betaald', viewDetails: 'Details bekijken' },
    emptyState: { title: 'Geen facturen', description: 'Genereer facturen aan het begin van elke periode.' },
  },

  ACCOUNTANT_RECONCILIATION_TEXT: {
    title: 'Bankafstemming',
    subtitle: 'Banktransacties koppelen aan systeembetalingen.',
    importStatement: 'Bankafschrift importeren',
    autoMatch: 'Automatisch koppelen',
    tabs: { matched: 'Gekoppeld', suggested: 'Voorgestelde koppelingen', unmatchedBank: 'Bank niet gekoppeld', unmatchedSystem: 'Systeem niet gekoppeld' },
    confidence: { high: 'Hoog', medium: 'Gemiddeld', low: 'Laag' },
    actions: { confirmMatch: 'Bevestigen', rejectMatch: 'Afwijzen', manualMatch: 'Handmatig koppelen', markComplete: 'Afstemming afronden' },
  },

  ACCOUNTANT_REPORTS_TEXT: {
    title: 'Financiële rapporten',
    subtitle: 'Uitgebreide financiële rapporten genereren en exporteren.',
    reports: {
      incomeStatement: 'Resultatenrekening',
      cashFlow: 'Kasstroomoverzicht',
      feeCollection: 'Inningsrapport',
      outstanding: 'Openstaande-vorderingen-rapport',
      paymentMethod: 'Betaalmethodeanalyse',
      aging: 'Ouderdomsrapport vorderingen',
      audit: 'Auditrapport',
    },
    actions: { generate: 'Rapport genereren', export: 'Exporteren', schedule: 'Plannen', compare: 'Perioden vergelijken' },
  },

  ACCOUNTANT_EXPENSES_TEXT: {
    title: 'Uitgavenbeheer',
    subtitle: 'Schooluitgaven vastleggen en categoriseren.',
    addExpense: 'Uitgave toevoegen',
    table: { date: 'Datum', category: 'Categorie', description: 'Omschrijving', amount: 'Bedrag', vendor: 'Leverancier', status: 'Status', actions: 'Acties' },
    emptyState: { title: 'Geen uitgaven vastgelegd', description: 'Begin met het bijhouden van schooluitgaven.' },
  },

  ACCOUNTANT_INTEGRATIONS_TEXT: {
    title: 'Boekhoudintegraties',
    subtitle: 'Boekhoudingssoftware-integraties verbinden en beheren.',
    connect: 'Verbinden',
    disconnect: 'Verbreken',
    syncNow: 'Nu synchroniseren',
    lastSynced: 'Laatst gesynchroniseerd',
    syncFrequency: 'Synchronisatiefrequentie',
    itemsSynced: 'Gesynchroniseerde items',
    syncErrors: 'Synchronisatiefouten',
  },

  ACCOUNTANT_PAYMENTS_TEXT: {
    title: 'Betalingsverwerking',
    subtitle: 'Betalingstransacties vastleggen en goedkeuren.',
    recordPayment: 'Betaling vastleggen',
    approvalQueue: 'Goedkeuringswachtrij',
  },
};

export default nl;
