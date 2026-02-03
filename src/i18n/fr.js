import ImageSelect from "../components/ImageSelect.vue";

export default {
    messages: {
        auth_error: "Erreur d'authentification. Veuillez vous reconnecter.",
        server_communication_error: "Une erreur de communication avec le serveur est survenue. Veuillez réessayer.",
        scrap_event_error: "Une erreur s'est produite lors de la lecture de l'événement. Essayez une autre adresse web.",
        scrap_group_error: "Une erreur s'est produite lors de la lecture du groupe. Essayez une autre adresse web.",
        register_app_error: "Impossible de se connecter à l'instance : {error}",
        feed_already_exists_group: "Ce flux est déjà enregistré pour ce groupe.",
        feed_already_exists_user: "Ce flux est déjà enregistré pour cet utilisateur.",
        create_automation_error: "Erreur lors de la création de l'automatisation : {error}. Veuillez réessayer.",
        fetch_automations_error: "Erreur lors de la récupération des automatisations : {error}. Veuillez réessayer.",
        fetch_automation_history_error: "Erreur lors de la récupération de l'historique de l'automatisation : {error}. Veuillez réessayer.",
        mobilizon_request_error: "Erreur de requête Mobilizon.",
        field_error: "Champ {field} : {message}",
        unknown_error: "Erreur inconnue"
    },
    components: {
        AutomationHistory: {
            title: "Détails de l'automatisation",
            execute: "Exécuter",
            logsAndEvents: "Logs et événements importés",
            noHistory: "Cette automatisation n'a pas encore été exécutée.",
            events: "Événements",
            logs: "Logs",
            created: "Création",
            updated: "Modification",
            delete_automation: "Supprimer",
            automation_deleted: "Automatisation supprimée",
        },
        Automations: {
            title: "Automatisations",
            subtitle: "Automatisations enregistrées",
            noAutomations: "Aucune automatisation",
            add_automation: "Nouvelle automatisation"
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
            titleTooLong: "Le titre ne peut pas comporter plus de 200 caractères.",
            noDataText: "Aucun résultat correspondant",
            url: "Lien vers l'événement",
            organized_by: "Organisé par",
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
            invalidFederatedName: "Seuls les caractères alphanumériques minuscules et les tirets bas sont acceptés.",
            nameSection: "Nom",
            noLogo: "Pas de logo",
            noLogoText: "Aucun logo n'a été trouvé. Vous pouvez en téléverser un vous-même."
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
        IdentitySelect: {
            label: "Sélectionnez une identité"
        },
        GroupSelect: {
            label: "Sélectionnez un groupe",
            add: "Importer un groupe"
        },
        
        RegisterFeed: {
            title: "URL du flux",
            placeholder: "https://example.com/feed.ics",
            label: "Entrez l'URL d'un fichier ics ou ical",
            button: "Enregistrer"
        },
        Share: {
            title: "Partager l'événement",
            invalid_url_title: "Partage impossible",
            invalid_url_text: "Nous sommes désolés mais aucune URL valide n'a été détectée.",
            confirm: "Confirmer",
            indicate_url: "Indiquer une URL",
            loading_event: "Chargement de l'événement en cours",
            login_to_share: "Veuillez vous connecter pour partager l'événement."
        },
        Welcome: {
            login: "Me connecter",
            title: "Importer des événements",
            text1: "Cette application vous permet d'importer des événements depuis Facebook, Instagram ou d'autres réseaux dans votre instance Mobilizon.",
            text2: "Pour commencer, connectez-vous à votre compte Mobilizon"
        },
        QuillEditor: {
            too_big_error: "The file is too big (max {max} MB)",
        },        
        ImageSelect: {
            too_big_error: "L'image est trop lourde (max {max} Mo)",
            uploadButton: "Téléverser",
            conversion_error: "Erreur lors de la conversion de l'image en base64"
        },
        LocateFromMapOverlay: {
            geolocateButton: "Me géolocaliser",
            mapCaption: "Cliquez sur la carte ou glissez-déposez le marqueur pour modifier la position.",
            cancel: "Annuler",
            validate: "Valider"
        },
        SearchAddressFromCoordsOverlay: {
            nearbyAddresses: "Addresses à proximité de la position",
            searching: "Recherche en cours",
            noResults: "Aucun résultat",
            close: "Fermer"
        },
        SearchAddressFromStringOverlay: {
            useGroupAddress: "Utiliser l'adresse du groupe",
            placeName: "Nom du lieu",
            street: "N° et voie",
            city: "Ville",
            postalCode: "Code postal",
            results: "Résultats",
            noAddressFound: "Aucune adresse trouvée",
            incompleteCriteria: "Indiquez une ville ou un code postal pour améliorer la recherche."
        },
        LocationSelect: {
            addressLabel: "Adresse",
            noAddressText: "Il n'y a pas d'adresse renseignée pour cet événement !",
            noAddress: "Pas d'adresse",
            editAddress: "Modifier l'adresse",
            noLocationText: "Il n'y a pas de localisation GPS renseignée pour cet événement !",
            noLocation: "Pas de localisation",
            editPosition: "Modifier la position",
            updateAddressQuestion: "Voulez-vous également mettre à jour l'adresse de l'événement avec une adresse à proximité de la localisation ?",
            updateAddress: "Mettre à jour l'adresse",
            yes: "Oui",
            no: "Non"
        },
        UrlForm: {
            emptyField: "Le champ est vide.",
            invalidUrl: "L'URL n'est pas valide."
        },
        SelectInstance: {
            title: "Instance Mobilizon",
            alertTitle: "Quelle est l'URL de votre instance Mobilizon ?",
            alertText: "C'est l'adresse web de la page d'accueil du site auquel vous souhaitez vous connecter. Par exemple https://mobilizon.fr ou https://keskonfait.fr.",
            label: "URL de l'instance Mobilizon",
            placeholder: "mobilizon.fr",
            emptyField: "Le champ est vide.",
            invalidUrl: "L'URL n'est pas valide.",
            loginButton: "Se connecter"
        },
        SearchAddressFromStringOverlay: {
            useGroupAddress: "Utiliser l'adresse du groupe",
            placeName: "Nom du lieu",
            street: "N° et voie",
            city: "Ville",
            postalCode: "Code postal",
            results: "Résultats",
            noAddressFound: "Aucune adresse trouvée",
            incompleteCriteria: "Indiquez une ville ou un code postal pour améliorer la recherche.",
            noResultTitle: "Pas de résultat",
            createPlaceTitle: "Créez le lieu",
            createPlaceQuestion: "Vous ne trouvez pas votre lieu ?",
            createPlaceDescription: "Créez le sur ",
            createPlaceDescriptionEnd: "pour le rendre visible ici et pour des millions d'utilisateurs !",
            cancel: "Annuler",
            validate: "Valider"
        }
    },
}