import type { Translations } from './en';

const de: Partial<Translations> & Record<string, any> = {
  APP_NAME: 'Feeyangu',
  APP_TAGLINE: 'Intelligente Schulgebührverwaltung',
  APP_DESCRIPTION: 'Vereinfachen Sie die Gebührenerhebung, Nachverfolgung und Berichterstellung für Schulen und Eltern.',

  AUTH_TEXT: {
    login: { title: 'Willkommen zurück', subtitle: 'Melden Sie sich an, um fortzufahren', emailLabel: 'E-Mail-Adresse', emailPlaceholder: 'E-Mail eingeben', passwordLabel: 'Passwort', passwordPlaceholder: 'Passwort eingeben', rememberMe: 'Angemeldet bleiben', forgotPassword: 'Passwort vergessen?', submitButton: 'Anmelden', noAccount: 'Kein Konto?', registerLink: 'Erstellen', orContinue: 'Oder weiter mit' },
    register: { title: 'Konto erstellen', subtitle: 'Starten Sie noch heute mit Feeyangu', nameLabel: 'Vollständiger Name', namePlaceholder: 'Namen eingeben', emailLabel: 'E-Mail-Adresse', emailPlaceholder: 'E-Mail eingeben', passwordLabel: 'Passwort', passwordPlaceholder: 'Passwort erstellen', confirmPasswordLabel: 'Passwort bestätigen', confirmPasswordPlaceholder: 'Passwort bestätigen', roleLabel: 'Ich bin', roleParent: 'Elternteil', roleSchoolAdmin: 'Schulverwalter', schoolNameLabel: 'Schulname', schoolNamePlaceholder: 'Schulnamen eingeben', termsText: 'Ich stimme den', termsLink: 'AGB zu', submitButton: 'Konto erstellen', hasAccount: 'Bereits ein Konto?', loginLink: 'Anmelden' },
    forgotPassword: { title: 'Passwort zurücksetzen', subtitle: 'Geben Sie Ihre E-Mail ein, wir senden Ihnen einen Link', emailLabel: 'E-Mail-Adresse', emailPlaceholder: 'E-Mail eingeben', submitButton: 'Link senden', backToLogin: 'Zurück zur Anmeldung', successMessage: 'Prüfen Sie Ihre E-Mail auf einen Rücksetzlink.' },
  },

  SIDEBAR_TEXT: {
    superAdmin: { label: 'Plattform', items: { dashboard: 'Dashboard', schools: 'Schulen', users: 'Benutzer', settings: 'Einstellungen' } },
    schoolAdmin: {
      main: { label: 'Haupt', items: { dashboard: 'Dashboard', students: 'Schüler', grades: 'Klassen & Stufen' } },
      finance: { label: 'Finanzen', items: { feeStructures: 'Gebührenstrukturen', payments: 'Zahlungen', receipts: 'Quittungen' } },
      settings: { label: 'Einstellungen', items: { paymentMethods: 'Zahlungsmethoden', terms: 'Schulhalbjahre', settings: 'Schuleinstellungen' } },
    },
    parent: { label: 'Menü', items: { dashboard: 'Dashboard', children: 'Meine Kinder', payments: 'Zahlungsverlauf', receipts: 'Quittungen', ptMeetings: 'Elterngespräche' } },
  },

  DASHBOARD_TEXT: {
    school: {
      title: 'Schul-Dashboard', bannerTitle: 'Willkommen in Ihrem Schulportal', bannerDescription: 'Verwalten Sie Schüler, verfolgen Sie Zahlungen und erstellen Sie Berichte.',
      kpi: { totalStudents: 'Schüler gesamt', feesCollected: 'Gebühren eingezogen', pendingFees: 'Ausstehende Gebühren', overdueAccounts: 'Überfällige Konten' },
      revenueChart: 'Monatliche Einnahmen', recentPayments: 'Letzte Zahlungen', overdueAlert: 'Überfällige Gebühren',
    },
    parent: {
      title: 'Startseite', subtitle: 'Übersicht der Gebührverwaltung Ihrer Kinder',
      bannerTitle: 'Verwalten Sie die Gebühren Ihrer Kinder', bannerDescription: 'Sehen Sie Salden ein, leisten Sie Zahlungen und laden Sie Quittungen herunter.',
      bannerAction: 'Zahlung leisten', childrenSection: 'Meine Kinder', outstandingFees: 'Ausstehende Gebühren gesamt', recentPayments: 'Letzte Zahlungen', quickPay: 'Schnellzahlung', viewFees: 'Gebühren ansehen',
      overviewTitle: 'Übersicht - Aktuelles Halbjahr 2026', totalFeesDue: 'Fällige Gebühren gesamt', totalPaid: 'Bezahlt gesamt',
    },
    admin: {
      title: 'Plattform-Übersicht', bannerTitle: 'Feeyangu Admin-Konsole', bannerDescription: 'Überwachen Sie Statistiken, verwalten Sie Schulen und Benutzer.',
      kpi: { totalSchools: 'Schulen gesamt', activeUsers: 'Aktive Benutzer', monthlyRevenue: 'Monatliche Einnahmen', pendingApprovals: 'Ausstehende Genehmigungen' },
      topSchools: 'Beste Schulen', recentActivity: 'Letzte Aktivität',
    },
  },

  STUDENTS_TEXT: {
    title: 'Schüler', searchPlaceholder: 'Nach Name oder Aufnahmenummer suchen...', addStudent: 'Schüler hinzufügen', importCsv: 'CSV importieren', exportCsv: 'CSV exportieren',
    filters: { grade: 'Alle Stufen', status: 'Alle Status', class: 'Alle Klassen' },
    table: { admissionNo: 'Aufnahme-Nr.', name: 'Schülername', grade: 'Stufe', class: 'Klasse', parent: 'Eltern', fees: 'Gebührenstatus', status: 'Status', actions: 'Aktionen' },
    emptyState: { title: 'Keine Schüler gefunden', description: 'Fügen Sie einen Schüler hinzu oder importieren Sie aus CSV.' },
    form: { createTitle: 'Neuen Schüler hinzufügen', editTitle: 'Schüler bearbeiten', firstName: 'Vorname', lastName: 'Nachname', admissionNumber: 'Aufnahmenummer', grade: 'Stufe', className: 'Klasse', parentName: 'Elternname', parentEmail: 'Eltern-E-Mail', status: 'Status' },
  },

  GRADES_TEXT: {
    title: 'Stufen & Klassen', subtitle: 'Verwalten Sie Stufen und Klassenabschnitte.',
    addGrade: 'Stufe hinzufügen', addClass: 'Klasse hinzufügen', editGrade: 'Stufe bearbeiten', deleteGrade: 'Stufe löschen', editClass: 'Klasse bearbeiten', deleteClass: 'Klasse löschen',
    table: { grade: 'Stufe', classes: 'Klassen', students: 'Schüler', actions: 'Aktionen' },
    classTable: { name: 'Klassenname', teacher: 'Klassenlehrer', students: 'Schüler', actions: 'Aktionen' },
    form: { gradeName: 'Stufenname', gradeNamePlaceholder: 'z.B. Stufe 5', className: 'Klassenname', classNamePlaceholder: 'z.B. 5A', teacher: 'Klassenlehrer', teacherPlaceholder: 'z.B. Frau Kamau', selectGrade: 'Stufe wählen' },
    emptyState: { title: 'Keine Stufen', description: 'Erstellen Sie Ihre erste Stufe.' },
    deleteConfirm: 'Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.',
  },

  FEE_STRUCTURES_TEXT: {
    title: 'Gebührenstrukturen', subtitle: 'Definieren und verwalten Sie Gebührenstrukturen.',
    addFeeStructure: 'Struktur hinzufügen', editFeeStructure: 'Struktur bearbeiten',
    table: { name: 'Name', grade: 'Stufe', term: 'Halbjahr', totalAmount: 'Gesamtbetrag', status: 'Status', actions: 'Aktionen' },
    detail: { feeBreakdown: 'Gebührenaufstellung', itemName: 'Posten', itemAmount: 'Betrag', addItem: 'Posten hinzufügen', total: 'Gesamt' },
    form: { name: 'Strukturname', namePlaceholder: 'z.B. Stufe 5 - HJ 1 2026', grade: 'Stufe', term: 'Halbjahr', status: 'Status', feeItemName: 'Postenname', feeItemNamePlaceholder: 'z.B. Schulgeld', feeItemAmount: 'Betrag' },
    emptyState: { title: 'Keine Gebührenstrukturen', description: 'Erstellen Sie Strukturen, um Gebühren zuzuweisen.' },
  },

  PAYMENTS_TEXT: {
    title: 'Zahlungen', subtitle: 'Alle Zahlungstransaktionen einsehen und verwalten.', searchPlaceholder: 'Nach Name oder Referenz suchen...', exportCsv: 'CSV exportieren',
    table: { date: 'Datum', student: 'Schüler', amount: 'Betrag', method: 'Methode', status: 'Status', reference: 'Referenz', actions: 'Aktionen' },
    filters: { allMethods: 'Alle Methoden', allStatus: 'Alle Status' },
    actions: { approve: 'Genehmigen', reject: 'Ablehnen', viewDetails: 'Details anzeigen' },
    emptyState: { title: 'Keine Zahlungen gefunden', description: 'Zahlungen erscheinen hier nach Eingang.' },
  },

  RECEIPTS_TEXT: {
    title: 'Quittungen', subtitle: 'Quittungen einsehen und herunterladen.', searchPlaceholder: 'Nach Quittungsnummer oder Schüler suchen...',
    table: { receiptNo: 'Quittungs-Nr.', date: 'Datum', student: 'Schüler', amount: 'Betrag', method: 'Methode', actions: 'Aktionen' },
    preview: { title: 'Quittungsvorschau', schoolName: 'Green Valley Academy', receiptLabel: 'Quittung', dateLabel: 'Datum', studentLabel: 'Schüler', referenceLabel: 'Zahlungsreferenz', methodLabel: 'Zahlungsmethode', itemLabel: 'Beschreibung', amountLabel: 'Betrag', totalLabel: 'Gesamt bezahlt' },
    emptyState: { title: 'Keine Quittungen gefunden', description: 'Quittungen werden nach Zahlungen generiert.' },
  },

  PAYMENT_METHODS_TEXT: {
    title: 'Zahlungsmethoden', subtitle: 'Konfigurieren Sie die verfügbaren Zahlungsmethoden.', addMethod: 'Methode hinzufügen',
    table: { name: 'Name', type: 'Typ', details: 'Details', enabled: 'Aktiviert', actions: 'Aktionen' },
    form: { name: 'Methodenname', namePlaceholder: 'z.B. M-Pesa Paybill', type: 'Typ', details: 'Details / Anweisungen', detailsPlaceholder: 'z.B. Paybill: 123456', enabled: 'Aktiviert' },
    emptyState: { title: 'Keine Zahlungsmethoden', description: 'Fügen Sie Zahlungsmethoden hinzu.' },
  },

  TERMS_TEXT: {
    title: 'Schulhalbjahre', subtitle: 'Verwalten Sie Halbjahre und den Schulkalender.', addTerm: 'Halbjahr hinzufügen',
    table: { name: 'Name', year: 'Jahr', startDate: 'Startdatum', endDate: 'Enddatum', status: 'Status', actions: 'Aktionen' },
    form: { name: 'Name', namePlaceholder: 'z.B. Halbjahr 1 2026', year: 'Jahr', startDate: 'Startdatum', endDate: 'Enddatum', status: 'Status' },
    emptyState: { title: 'Keine Halbjahre', description: 'Erstellen Sie Halbjahre für den Schulkalender.' },
  },

  SCHOOL_SETTINGS_TEXT: {
    title: 'Schuleinstellungen', subtitle: 'Passen Sie Schulprofil und Präferenzen an.',
    sections: { profile: 'Schulprofil', branding: 'Branding', subscription: 'Abonnement' },
    fields: { schoolName: 'Schulname', schoolNamePlaceholder: 'Name eingeben', motto: 'Schulmotto', mottoPlaceholder: 'Motto eingeben', location: 'Standort', locationPlaceholder: 'Standort eingeben', email: 'Kontakt-E-Mail', emailPlaceholder: 'E-Mail eingeben', phone: 'Telefon', phonePlaceholder: 'Nummer eingeben', primaryColor: 'Primärfarbe', secondaryColor: 'Sekundärfarbe', logo: 'Schullogo', uploadLogo: 'Logo hochladen' },
    subscription: { plan: 'Aktueller Plan', planValue: 'Premium', status: 'Status', statusValue: 'Aktiv', nextBilling: 'Nächste Abrechnung', nextBillingValue: '1. März 2026' },
    saveButton: 'Speichern', savedMessage: 'Einstellungen gespeichert.',
  },

  COMMON_TEXT: {
    actions: { save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', view: 'Ansehen', create: 'Erstellen', export: 'Exportieren', import: 'Importieren', search: 'Suchen', filter: 'Filtern', refresh: 'Aktualisieren', download: 'Herunterladen', print: 'Drucken', close: 'Schließen', confirm: 'Bestätigen', back: 'Zurück', next: 'Weiter' },
    status: { active: 'Aktiv', inactive: 'Inaktiv', pending: 'Ausstehend', completed: 'Abgeschlossen', failed: 'Fehlgeschlagen', overdue: 'Überfällig', paid: 'Bezahlt', partial: 'Teilweise', suspended: 'Gesperrt', upcoming: 'Kommend' },
    currency: 'KES', noData: 'Keine Daten verfügbar', loading: 'Laden...', logout: 'Abmelden', profile: 'Profil', notifications: 'Benachrichtigungen', settings: 'Einstellungen',
    vsLastMonth: 'vs letzten Monat', notFoundTitle: '404', notFoundMessage: 'Seite nicht gefunden', notFoundLink: 'Zurück zur Startseite',
  },

  PAYMENT_METHOD_LABELS: { mpesa: 'M-Pesa', bank: 'Banküberweisung', cash: 'Bargeld', card: 'Karte' },

  PARENT_CHILDREN_TEXT: { title: 'Meine Kinder', subtitle: 'Gebühren einsehen und Zahlungen leisten.', viewFees: 'Gebühren ansehen', quickPay: 'Schnellzahlung', feeProgress: 'Gebührenfortschritt' },
  PARENT_FEES_TEXT: { title: 'Gebührendetails', subtitle: 'Aufstellung und Zahlungsstatus', item: 'Gebührenposten', total: 'Gesamt', paid: 'Bezahlt', balance: 'Saldo', status: 'Status', payNow: 'Jetzt zahlen', backToChildren: 'Zurück zu Kinder', totalOutstanding: 'Gesamt ausstehend' },
  PARENT_PAY_TEXT: { title: 'Zahlung leisten', selectMethod: 'Zahlungsmethode wählen', amount: 'Betrag (KES)', reference: 'Zahlungsreferenz', referencePlaceholder: 'z.B. M-Pesa Transaktionscode', submitPayment: 'Zahlung absenden', cancel: 'Abbrechen' },
  PARENT_PAYMENTS_TEXT: { title: 'Zahlungsverlauf', subtitle: 'Alle Ihre Zahlungen einsehen.', searchPlaceholder: 'Nach Referenz suchen...', filterChild: 'Alle Kinder', table: { date: 'Datum', child: 'Kind', amount: 'Betrag', method: 'Methode', status: 'Status', reference: 'Referenz' }, emptyState: { title: 'Noch keine Zahlungen', description: 'Ihr Zahlungsverlauf erscheint hier.' } },
  PARENT_RECEIPTS_TEXT: { title: 'Quittungen', subtitle: 'Quittungen herunterladen und drucken.', searchPlaceholder: 'Nach Quittungsnummer suchen...', filterChild: 'Alle Kinder', table: { receiptNo: 'Quittungs-Nr.', date: 'Datum', child: 'Kind', amount: 'Betrag', actions: 'Aktionen' }, emptyState: { title: 'Keine Quittungen', description: 'Quittungen erscheinen nach Zahlungen.' } },

  ADMIN_SCHOOLS_TEXT: {
    title: 'Schulen', subtitle: 'Alle Schulen der Plattform verwalten.', addSchool: 'Schule hinzufügen', searchPlaceholder: 'Schulen suchen...',
    table: { name: 'Schulname', owner: 'Besitzer', location: 'Standort', students: 'Schüler', feesCollected: 'Gebühren eingezogen', status: 'Status', actions: 'Aktionen' },
    form: { name: 'Schulname', namePlaceholder: 'Name eingeben', owner: 'Besitzer', ownerPlaceholder: 'Besitzernamen eingeben', location: 'Standort', locationPlaceholder: 'Standort eingeben', status: 'Status' },
    emptyState: { title: 'Keine Schulen', description: 'Noch keine Schulen registriert.' },
    actions: { activate: 'Aktivieren', suspend: 'Sperren', delete: 'Löschen' },
  },

  ADMIN_USERS_TEXT: {
    title: 'Benutzer', subtitle: 'Alle Plattformbenutzer verwalten.', searchPlaceholder: 'Benutzer suchen...', filterRole: 'Alle Rollen', filterStatus: 'Alle Status',
    table: { name: 'Name', email: 'E-Mail', role: 'Rolle', school: 'Schule', status: 'Status', lastLogin: 'Letzte Anmeldung', actions: 'Aktionen' },
    actions: { deactivate: 'Deaktivieren', activate: 'Aktivieren', resetPassword: 'Passwort zurücksetzen' },
    emptyState: { title: 'Keine Benutzer gefunden', description: 'Benutzer erscheinen hier.' },
  },

  ADMIN_SETTINGS_TEXT: {
    title: 'Plattform-Einstellungen', subtitle: 'Globale Einstellungen konfigurieren.',
    sections: { general: 'Allgemein', notifications: 'Benachrichtigungen', billing: 'Abrechnung' },
    fields: { platformName: 'Plattformname', platformNamePlaceholder: 'Feeyangu', supportEmail: 'Support-E-Mail', supportEmailPlaceholder: 'support@feeyangu.com', defaultCurrency: 'Standardwährung', maintenanceMode: 'Wartungsmodus', emailNotifications: 'E-Mail-Benachrichtigungen', smsNotifications: 'SMS-Benachrichtigungen', paymentAlerts: 'Zahlungsbenachrichtigungen', overdueReminders: 'Mahnungen' },
    saveButton: 'Speichern', savedMessage: 'Plattform-Einstellungen gespeichert.',
  },

  HEADER: {
    roleLabels: { super_admin: 'Super Admin', school_admin: 'Schuladmin', parent: 'Elternteil' },
    childrenSummary: 'Kinderübersicht', recentReceipts: 'Letzte Quittungen', viewAll: 'Alle anzeigen', feeProgress: 'Gebührenfortschritt', daysOverdue: 'Tage überfällig',
    platformStats: 'Plattformweite Statistiken und Verwaltung.', welcomeBack: 'Willkommen zurück. Hier ist Ihre Schulübersicht.',
    studentInfo: 'Schülerinformationen', feeStatus: 'Gebührenstatus', totalFees: 'Gebühren gesamt', paid: 'Bezahlt', balanceLabel: 'Saldo', paymentProgress: 'Zahlungsfortschritt', paymentHistory: 'Zahlungsverlauf', noPaymentsYet: 'Noch keine Zahlungen.', studentNotFound: 'Schüler nicht gefunden',
    deleteConfirmGeneric: 'Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.', fillDetails: 'Füllen Sie die Details unten aus.', paymentDetails: 'Zahlungstransaktionsdetails.',
  },

  LANGUAGE: { label: 'Sprache', en: 'English', fr: 'Français', de: 'Deutsch', nl: 'Nederlands', sw: 'Kiswahili' },
};

export default de;
