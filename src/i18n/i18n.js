import { createI18n } from 'vue-i18n'
import fr from './fr.js'
import en from './en.js'

const defaultLanguage = 'en'
const languages = navigator.languages
const supportedLanguages = ["en", "fr"]
const selectedLanguage = languages.find(lang => 
    supportedLanguages.includes(lang)
)

const i18n = createI18n({
    locale: 'en',//selectedLanguage || defaultLanguage,
    fallbackLocale: defaultLanguage,
    messages: {
        fr,
        en
    }
})

export default i18n