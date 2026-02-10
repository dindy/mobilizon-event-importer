export default {
    messages: {
        auth_error: "Authentication error. Please reconnect.",
        server_communication_error: "A communication error with the server occurred. Please try again.",
        scrap_event_error: "An error occurred while reading the event. Try another URL.",
        scrap_group_error: "An error occurred while reading the group. Try another URL.",
        register_app_error: "Unable to connect to the instance: {error}",
        feed_already_exists_group: "This feed is already registered for this group.",
        feed_already_exists_user: "This feed is already registered for this user.",
        create_automation_error: "Error creating the automation: {error}. Please try again.",
        fetch_automations_error: "Error fetching automations: {error}. Please try again.",
        fetch_automation_history_error: "Error fetching automation history: {error}. Please try again.",
        mobilizon_request_error: "Mobilizon request error.",
        field_error: "Field {field} : {message}",
        unknown_error: "Unknown error"
    },
    components: {
        AutomationHistory: {
            title: "Automation details",
            execute: "Execute",
            logsAndEvents: "Logs and imported events",
            noHistory: "This automation has not been executed yet.",
            events: "Imported events",
            logs: "Logs",
            created: "Created",
            updated: "Updated",
            delete_automation: "Delete",
            automation_deleted: "Automation deleted",            
        },
        Automations: {
            title: "Automations",
            subtitle: "Registered automations",
            noAutomations: "No automations",
            add_automation: "New automation",
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
            titleTooLong: "The title cannot have more than 200 characters.",
            noDataText: "No matching results",
            url: "Event link",
            organized_by: "Organized by",
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
            invalidFederatedName: "Only lowercase alphanumeric characters and underscores are accepted.",
            nameSection: "Name",
            noLogo: "No logo",
            noLogoText: "No logo was found. You can upload one yourself.",
            noCoverImage: "No cover image",
            noCoverImageText: "No cover image was found. You can upload one yourself.",     
            checkInfo: "Please check the info!",
            checkInfoText: "We do our best to retrieve information but some data may be missing or incorrect.",            
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
        IdentitySelect: {
            label: "Select an identity"
        },
        GroupSelect: {
            label: "Select a group",
            add: "Import a group"
        },
        
        RegisterFeed: {
            title: "Feed URL",
            placeholder: "https://example.com/feed.ics",
            label: "Enter the URL of an ics or ical file",
            button: "Register"
        },
        Share: {
            title: "Share the event",
            invalid_url_title: "Sharing impossible",
            invalid_url_text: "Sorry, no valid URL detected.",
            confirm: "Confirm",
            indicate_url: "Provide a URL",
            loading_event: "Loading event...",
            login_to_share: "Please log in to share the event."
        },
        Welcome: {
            login: "Login",
            title: "Import events",
            text1: "This application lets you import events from Facebook, Instagram or other networks into your Mobilizon instance.",
            text2: "To get started, log in to your Mobilizon account"
        },
        QuillEditor: {
            too_big_error: "The file is too big (max {max} MB)",
        },
        ImageSelect: {
            too_big_error: "The image is too big (max {max} MB)",
            uploadButton: "Upload",
            conversion_error: "Error converting image to base64"
        },
        LocateFromMapOverlay: {
            geolocateButton: "Geolocate me",
            mapCaption: "Click on the map or drag and drop the marker to change the position.",
            cancel: "Cancel",
            validate: "Validate"
        },
        SearchAddressFromCoordsOverlay: {
            nearbyAddresses: "Addresses near the position",
            searching: "Searching...",
            noResults: "No results",
            close: "Close"
        },
        SearchAddressFromStringOverlay: {
            useGroupAddress: "Use group address",
            placeName: "Place name",
            street: "Street number and name",
            city: "City",
            postalCode: "Postal code",
            results: "Results",
            noAddressFound: "No address found",
            incompleteCriteria: "Specify a city or postal code to improve the search."
        },
        LocationSelect: {
            addressLabel: "Address",
            noAddressText: "No address has been specified for this event!",
            noAddress: "No address",
            editAddress: "Edit address",
            noLocationText: "No GPS location has been specified for this event!",
            noLocation: "No location",
            editPosition: "Edit position",
            updateAddressQuestion: "Do you also want to update the event address with an address near the location?",
            updateAddress: "Update address",
            yes: "Yes",
            no: "No"
        },
        UrlForm: {
            emptyField: "The field is empty.",
            invalidUrl: "The URL is not valid."
        },
        SelectInstance: {
            title: "Mobilizon Instance",
            alertTitle: "What is your Mobilizon instance URL?",
            alertText: "This is the web address of the home page of the site you want to log in to. For example https://mobilizon.fr or https://keskonfait.fr.",
            label: "Mobilizon instance URL",
            placeholder: "mobilizon.fr",
            emptyField: "The field is empty.",
            invalidUrl: "The URL is not valid.",
            loginButton: "Log in"
        },
        SearchAddressFromStringOverlay: {
            useGroupAddress: "Use group address",
            placeName: "Place name",
            street: "Street number and name",
            city: "City",
            postalCode: "Postal code",
            results: "Results",
            noAddressFound: "No address found",
            incompleteCriteria: "Specify a city or postal code to improve the search.",
            noResultTitle: "No results",
            createPlaceTitle: "Create the place",
            createPlaceQuestion: "Can't find your place?",
            createPlaceDescription: "Create it on ",
            createPlaceDescriptionEnd: "to make it visible here and for millions of users!",
            cancel: "Cancel",
            validate: "Validate"
        }        
    }
}