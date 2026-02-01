export default {
    components: {
        AutomationHistory: {
            title: "Automation details",
            execute: "Execute",
            logsAndEvents: "Logs and imported events",
            noHistory: "This automation has not been executed yet.",
            events: "Events",
            logs: "Logs",
            created: "Created",
            updated: "Updated"
        },
        Automations: {
            title: "Automations",
            subtitle: "Registered automations",
            noAutomations: "No automations"
        },
        Home: {
            title: "Home",
            occasional_import: {
                title: "One-time imports",
                subtitle: "Import an event from its URL",
                text: "Import an event from its Facebook, Instagram, HelloAsso, Dice, Shotgun, Eventbrite address or any other platform that uses standard metadata.",
                btn: "Import an event"
            },
            automation: {
                title: "Automatic imports",
                subtitle: "Automatically import events from a feed",
                text: {
                    0: "The application records the URL of an event source and will automatically import new events at regular intervals.",
                    1: "Only ICS (iCalendar) feeds are currently supported."
                },
                btn: "Manage automations"
            }
        },
        AppBar: {
            logout: "Logout"
        },
        Root: {
            title: "Mobilizon Instance"
        },
        NotFound: {
            title: "404 - Page not found",
            message: "The requested page does not exist."
        },
        Event: {
            title: "Event details",
            checkInfo: "Please check the info!",
            checkInfoText: "We do our best to retrieve information but some data may be missing or incorrect.",
            dateAndTime: "Date and time",
            startDate: "Start date",
            startTime: "Start time",
            hasEndDate: "Event has an end date",
            endDate: "End date",
            endTime: "End time",
            headerImage: "Header image",
            noCoverImage: "No cover image",
            noCoverImageText: "No cover image was found. You can upload one yourself.",
            uploadButton: "Upload",
            title_label: "Title",
            description: "Description",
            location: "Location",
            category: "Category",
            ticketsUrl: "Tickets link",
            submit: "Save",
            submitDraft: "Save as draft",
            cancel: "Cancel",
            formErrors: "The form has errors. Please check the data.",
            startDateSuperior: "The start date is greater than the end date.",
            startTimeSuperior: "The start time is greater than the end time.",
            emptyField: "The field must not be empty.",
            titleTooLong: "The title cannot have more than 200 characters."
        },
        Group: {
            title: "Group details",
            name_label: "Group name",
            federatedName_label: "Group federated name",
            nameLength: "The title cannot have more than 200 characters.",
            description: "Description",
            location: "Location",
            logo: "Group logo",
            banner: "Cover image",
            uploadButton: "Upload",
            submit: "Save",
            cancel: "Cancel",
            emptyField: "The field must not be empty.",
            invalidFederatedName: "Only lowercase alphanumeric characters and underscores are accepted."
        },
        Done: {
            title: "Event imported",
            success: "Event saved",
            successText: "Your event has been successfully saved!",
            seeEvent: "Event page",
            seeEventDraft: "Event page (draft)",
            importAnother: "Import another event"
        },
        EventScrapper: {
            title: "Event URL",
            label: "Enter a web address (facebook, instagram or other)",
            placeholder: "https://www.facebook.com/events/123456789",
            button: "Import"
        },
        GroupScrapper: {
            title: "Group URL",
            label: "Enter a web address (preferably facebook group)",
            placeholder: "https://www.facebook.com/group_name",
            button: "Import"
        },
        SelectIdentity: {
            selectIdentity: "Select an identity",
            selectGroup: "Select a group"
        },
        IdentitySelect: {
            label: "Select an identity"
        },
        GroupSelect: {
            label: "Select a group"
        },
        Share: {
            title: "Share the event"
        },
        Welcome: {
            login: "Login"
        }
    }
}