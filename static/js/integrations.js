const Email = {
    edit: data => {
        console.log('editIntegration', data)
        const {description, is_default, id, settings} = data
        emailVm.load({...settings, description, is_default, id})
        emailVm.modal.modal('show')
    },
    delete: id => {
        emailVm.load({id})
        emailVm.delete()
    },
    defaultTemplate: '',
    initialState: () => ({
        host: '',
        port: null,
        user: '',
        passwd: '',
        sender: '',
        description: '',
        is_default: false,
        is_fetching: false,
        error: {},
        test_connection_status: 0,
        id: null,
        template: Email.defaultTemplate,
        fileName: ''
    })
}


const emailApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    data() {
        return {
            pluginName: 'reporter_email',
            modal: $('#reporter_email_integration'),
            ...Email.initialState()
        }
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        apiPath() {
            return `/api/v1/integrations/${this.pluginName}/`
        },
        project_id() {
            return getSelectedProjectId()
        },
        body_data() {
            const {
                host,
                port,
                user,
                passwd,
                sender,
                description,
                is_default,
                project_id,
                base64Template: template
            } = this
            return {host, port, user, passwd, sender, description, is_default, project_id, template}
        },
        test_connection_class() {
            if (200 <= this.test_connection_status && this.test_connection_status < 300) {
                return 'btn-success'
            } else if (this.test_connection_status > 0) {
                return 'btn-warning'
            } else {
                return 'btn-secondary'
            }
        },
        base64Template() {
            return btoa(this.template)
        }
    },
    watch: {
        is_fetching(newState, oldState) {
            if (newState) {
                this.test_connection_status = 0
            }
        }
    },
    methods: {
        loadBase64(b64text) {
            if (b64text === '') return ''
            try {
                return atob(b64text)
            } catch (e) {
                console.error(e)
                this.error.template = 'Only files of data:text/html;base64 are supported'
                this.template = ''
                this.fileName = ''
                return ''
            }
        },
        test_connection() {
            this.is_fetching = true
            fetch(this.apiPath + 'check_settings', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                console.log(response)
                this.is_fetching = false
                this.test_connection_status = response.status
                if (!response.ok) {
                    this.handleError(response)
                }
            })
        },
        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...Email.initialState(),
            })
        },
        load(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData,
                pluginName: 'reporter_email',
                modal: $('#reporter_email_integration'),
                template: this.loadBase64(stateData.template)
            })
        },
        create() {
            this.is_fetching = true
            fetch(this.apiPath, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    location.reload()
                    // alertMain.add('Email reporter created!', 'success-overlay')
                    // setTimeout(() => location.reload(), 1500)
                } else {
                    this.handleError(response)
                }
            })
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        console.log(errorData)
                        errorData.forEach(item => {
                            console.log('item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    location.reload()
                    // alertMain.add('Email reporter updated!', 'success-overlay')
                    // setTimeout(() => location.reload(), 1500)
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    location.reload()
                    // alertMain.add('Email integration deleted')
                    // setTimeout(() => location.reload(), 1000)
                } else {
                    this.handleError(response)
                    alertMain.add(`Deletion error. <button class="btn btn-primary" @click="modal.modal('show')">Open modal<button>`)
                }
            })
        },
        handleFileUpload(file) {
            let reader = new FileReader()
            reader.onload = (evt) => {
                this.template = this.loadBase64(evt.target.result.split('data:text/html;base64,')[1])
            }
            reader.onerror = (e) => {
                this.error.template = 'error reading file'
                this.template = ''
                this.fileName = ''
            }
            delete this.error.template
            this.fileName = file.name
            reader.readAsDataURL(file)
        },
        handleDrop(e) {
            const file = e.dataTransfer.files[0]
            file && this.handleFileUpload(file)
        },
        handleInputFile(event) {
            const input = event.target
            if (input.files && input.files[0]) {
                this.handleFileUpload(input.files[0])
            }
        },
    }

})

emailApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13'].includes(tag)

const emailVm = emailApp.mount('#reporter_email_integration')

$(document).ready(() => {
    $('#reporter_email_integration').on('dragover', (e) => {
        e.preventDefault()
        $('#reporter_email_template_area').css({'height': '300px', 'border': '2px dashed var(--basic)'})
    })
    $('#reporter_email_integration').on('drop', (e) => {
        e.preventDefault()
        $('#reporter_email_template_area').css({'height': '100px', 'border': ''})
    })
})