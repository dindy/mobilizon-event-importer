class FormErrorHandler {

    fields = []
    
    reset() {
        this.fields = {}
    }

    hasErrors() {
        return Object.keys(this.fields).filter(key => this.fields[key].length > 0).length > 0
    }

    fieldHasErrors(fieldName) {
        return this.fields[fieldName]?.length > 0
    }

    addFieldError(fieldName, error) {
        if (!this.fields[fieldName]) {
            this.fields[fieldName] = [error]
        } else {
            this.fields[fieldName].push(error)
        }
    }

    getFieldErrors(fieldName) {
        return this.fields[fieldName] || []
    }
}

export default FormErrorHandler