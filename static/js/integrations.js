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
    }
}

const emailInitialState = () => ({
    host: '',
    port: null,
    user: '',
    password: '',
    sender: '',
    description: '',
    is_default: false,
    is_fetching: false,
    error: {},
    test_connection_status: 0,
    id: null,
    template: '',
    fileName: ''
})

const emailApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    // props: [
    //     'host', 'port', 'user',
    //     'password', 'sender', 'description',
    //     'is_default', 'is_fetching', 'error',
    //     'test_connection_status', 'id'
    // ],
    data() {
        return {
            pluginName: 'reporter_email',
            modal: $('#reporter_email_integration'),
            ...emailInitialState()
        }
    },
    mounted() {
        console.log('mounted', this.$el)
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
            const {host, port, user, password: passwd, sender, description, is_default, project_id, template} = this
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
        base64DisplayValue() {
            console.log('TTTTT', this.template)
            if (this.template === '') return ''
            const data = this.template.split('data:text/html;base64,')[1]
            try {
                return atob(data)
            } catch (e) {
                console.error(e)
                this.error.template = 'Only files of data:text/html;base64 are supported'
                this.template = ''
                this.fileName = ''
                return ''
            }

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
        handleFileUpload(event) {
            const input = event.target
            if (input.files && input.files[0]) {
                let reader = new FileReader()
                reader.onload = (e) => {
                    delete this.error.template
                    this.template = e.target.result
                    this.fileName = input.files[0].name
                    // input.setAttribute("data-title", fileName)
                    // console.log(e.target.result)
                }
                reader.onerror = (e) => {
                    this.error.template = 'error reading file'
                    this.template = ''
                    this.fileName = ''
                }
                reader.readAsDataURL(input.files[0])
            }

        },
        test_connection() {
            console.log('TEST CONN', this.$data)
            this.is_fetching = true
            $('#qualys_test_connection').removeClass('btn-success').addClass('btn-secondary')
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
                ...emailInitialState(),
            })
        },
        load(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData,
                pluginName: 'reporter_email',
                modal: $('#reporter_email_integration'),
            })
        },
        create() {
            this.is_fetching = true
            fetch(this.apiPath, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                console.log(response)
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
            console.log('update')
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                console.log(response)
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
            console.log('deleteIntegration')
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'DELETE',
            }).then(response => {
                console.log(response)
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
        }
    }

})
emailApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13'].includes(tag)

const emailVm = emailApp.mount('#reporter_email_integration')

$(document).ready(() => {
    $('#reporter_email_integration').on('dragover', (e) => {
        e.preventDefault()
        $('#reporter_email_integration input[type=file]').css({'height': '300px'})
    })
    $('#reporter_email_integration').on('drop', (e) => {
        !(e.target.tagName.toLowerCase() === 'input' && e.target.type === 'file') && e.preventDefault()
        $('#reporter_email_integration input[type=file]').css({'height': '100px'})
    })
})