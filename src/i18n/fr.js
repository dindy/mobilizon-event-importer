export default {
    components: {
        AutomationHistory: {
            title: "Détails de l'automatisation",
            execute: "Exécuter",
            logsAndEvents: "Logs et événements importés",
            noHistory: "Cette automatisation n'a pas encore été exécutée.",
            events: "Événements",
            logs: "Logs",
            created: "Création",
            updated: "Modification"
        },
        Automations: {
            title: "Automatisations",
            subtitle: "Automatisations enregistrées",
            noAutomations: "Aucune automatisation"
        },
        Home: {
            title: "Accueil",
            occasional_import: {
                title: 'Imports ponctuels',
                subtitle: 'Importez un événement depuis son URL',
                text: "Importez un événement depuis son adresse Facebook, Instagram, HelloAsso, Dice, Shotgun, Eventbrite ou toute autre plateforme qui utilise des metadonnées standards.",
                btn: "Importer un événement"
            },
            automation: {
                title: 'Imports automatiques',
                subtitle: "Importez automatiquement les événements d'un flux",
                text: {
                    0: "L'application enregistre l'URL d'une source d'événements et importera automatiquement les nouveaux événements à interval régulier.",
                    1: "Seuls les flux ICS (iCalendar) sont actuellement supportés."
                },
                btn: "Gérer les automatisations"
            },
        },
        AppBar: {
            logout: "Me déconnecter",
        },
        Root: {
            title: "Instance Mobilizon"
        },
        NotFound: {
            title: "404 - Page non trouvée",
            message: "La page demandée n'existe pas."
        },
        Event: {
            title: "Détails de l'événement",
            checkInfo: "Vérifiez les infos SVP !",
            checkInfoText: "Nous faisons de notre mieux pour récupérer les informations mais certaines données peuvent être manquantes ou erronées.",
            dateAndTime: "Date et heure",
            startDate: "Date de début",
            startTime: "Heure de début",
            hasEndDate: "L'événement a une date de fin",
            endDate: "Date de fin",
            endTime: "Heure de fin",
            headerImage: "Image d'en-tête",
            noCoverImage: "Pas de d'image de couverture",
            noCoverImageText: "Aucune image de couverture n'a été trouvée. Vous pouvez en téléverser une vous-même.",
            uploadButton: "Téléverser",
            title_label: "Titre",
            description: "Description",
            location: "Localisation",
            category: "Catégorie",
            ticketsUrl: "Lien vers les tickets",
            submit: "Enregistrer",
            submitDraft: "Enregistrer comme brouillon",
            cancel: "Annuler",
            formErrors: "Le formulaire comporte des erreurs. Merci de vérifier les données.",
            startDateSuperior: "La date de début est supérieure à la date de fin.",
            startTimeSuperior: "L'heure de début est supérieure à l'heure de fin.",
            emptyField: "Le champ ne doit pas être vide.",
            titleTooLong: "Le titre ne peut pas comporter plus de 200 caractères."
        },
        Group: {
            title: "Détails du groupe",
            name_label: "Nom du groupe",
            federatedName_label: "Nom fédéré du groupe",
            nameLength: "Le titre ne peut pas comporter plus de 200 caractères.",
            description: "Description",
            location: "Localisation",
            logo: "Logo du groupe",
            banner: "Image de couverture",
            uploadButton: "Téléverser",
            submit: "Enregistrer",
            cancel: "Annuler",
            emptyField: "Le champ ne doit pas être vide.",
            invalidFederatedName: "Seuls les caractères alphanumériques minuscules et les tirets bas sont acceptés."
        },
        Done: {
            title: "Evenement importé",
            success: "Evénement enregistré",
            successText: "Votre événement a été enregistré avec succès !",
            seeEvent: "Page de l'événement",
            seeEventDraft: "Page de l'événement (brouillon)",
            importAnother: "Importer un autre événement"
        },
        EventScrapper: {
            title: "URL de l'événement",
            label: "Entrez une adresse web (facebook, instagram ou autre)",
            placeholder: "https://www.facebook.com/events/123456789",
            button: "Importer"
        },
        GroupScrapper: {
            title: "URL du groupe",
            label: "Entrez une adresse web (groupe facebook de préférence)",
            placeholder: "https://www.facebook.com/nom_du_group",
            button: "Importer"
        },
        SelectIdentity: {
            selectIdentity: "Sélectionnez une identité",
            selectGroup: "Sélectionnez un groupe"
        },
        IdentitySelect: {
            label: "Sélectionnez une identité"
        },
        GroupSelect: {
            label: "Sélectionnez un groupe"
        },
        Share: {
            title: "Partager l'événement"
        },
        Welcome: {
            login: "Me connecter"
        }
    },
}