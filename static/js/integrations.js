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
    initialState: () => ({
        modal_style: {'height': '100px', 'border': ''},
        host: '',
        port: null,
        user: '',
        passwd: '',
        sender: '',
        description: '',
        is_default: false,
        is_fetching: false,
        error: {},
        id: null,
        template: '',
        fileName: '',
        pluginName: 'reporter_email',
    })
}

const TestConnectionButton = {
    delimiters: ['[[', ']]'],
    props: ['error', 'apiPath', 'is_fetching', 'body_data'],
    emits: ['update:is_fetching', 'handleError'],
    data() {
        return {
            status: 0,
        }
    },
    computed: {
        test_connection_class() {
            if (200 <= this.status && this.status < 300) {
                return 'btn-success'
            } else if (this.status > 0) {
                return 'btn-warning'
            } else {
                return 'btn-secondary'
            }
        },
    },
    template: `
        <button type="button" class="btn btn-sm mt-3"
                @click="test_connection"
                :class="[{disabled: is_fetching, updating: is_fetching, 'is-invalid': error}, test_connection_class]"
        >
            Test connection
        </button>
        <div class="invalid-feedback">[[ error ]]</div>
    `,
    watch: {
        is_fetching(newState, oldState) {
            console.log('watch is_fetching', newState)
            if (newState) {
                this.status = 0
            }
        }
    },
    methods: {
        test_connection() {
            this.$emit('update:is_fetching', true)
            fetch(this.apiPath, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                console.log(response)
                // this.is_fetching = false
                this.$emit('update:is_fetching', false)
                this.status = response.status
                if (!response.ok) {
                    this.$emit('handleError', response)
                }
            })
        },
    }
}

const EmailIntegration = {
    delimiters: ['[[', ']]'],
    // props: {
    //     modelValue: ,
    //     modal_id: String,
    //     display_name: String,
    //     show_test_connection: Boolean
    // },
    props: ['instance_name', 'display_name', 'default_template', 'modal_id', 'show_test_connection'],
    // props: ['modelValue'],
    // emits: ['register'],
    components: {
        TestConnectionButton
    },
    template: `
        <div 
            :id="modal_id"
            class="modal modal-small fixed-left fade shadow-sm" tabindex="-1" role="dialog"
            @dragover.prevent="modal_style = {'height': '300px', 'border': '2px dashed var(--basic)'}"
            @drop.prevent="modal_style = {'height': '100px', 'border': ''}"
            >
            <div class="modal-dialog modal-dialog-aside" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="row w-100">
                            <div class="col">
                                <h2>[[ display_name ]] integration</h2>
                                <p v-if="id">
                                    <h13>id: [[ id ]]</h13>
                                </p>
                            </div>
                            <div class="col-xs">
                                <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal" aria-label="Close">
                                    Cancel
                                </button>
                                <button type="button" class="btn btn-sm btn-secondary"
                                        :class="{disabled: is_fetching, updating: is_fetching}"
                                        @click.prevent="id ? update() : create()"
                                >
                                    [[ id ? 'Update' : 'Save' ]]
                                </button>
                            </div>
                        </div>
                    </div>
        
        
                    <div class="modal-body">
                        <div class="form-group">
                            <h9>Host</h9>
                            <input type="text" v-model="host" class="form-control form-control-alternative"
                                   placeholder="SMTP host"
                                   :class="{ 'is-invalid': error.host }">
                            <div class="invalid-feedback">[[ error.host ]]</div>
        
                            <h9>Port</h9>
                            <input type="number" class="form-control form-control-alternative" placeholder="SMTP port"
                                   v-model="port"
                                   :class="{ 'is-invalid': error.port }"
                            >
                            <div class="invalid-feedback">[[ error.port ]]</div>
                            <div class="form-group form-row">
                                <div class="col-6">
                                    <h9>User</h9>
                                    <input type="text"  class="form-control form-control-alternative"
                                        v-model="user"
                                        placeholder="SMTP user"
                                        :class="{ 'is-invalid': error.user }">
                                    <div class="invalid-feedback">[[ error.user ]]</div>
                                </div>
                                <div class="col-6">
                                    <h9>Password</h9>
                                    <input type="password" class="form-control form-control-alternative"
                                           placeholder="SMTP password"
                                           v-model="passwd"
                                           :class="{ 'is-invalid': error.passwd }">
                                    <div class="invalid-feedback">[[ error.passwd ]]</div>
                                </div>
                            </div>
                            <h9>Sender</h9>
                            <p>
                                <h13>Optional. By default emails are sent from SMTP user</h13>
                            </p>
                            <input type="text"  class="form-control form-control-alternative"
                                v-model="sender"
                                placeholder="Email sender"
                                :class="{ 'is-invalid': error.sender }">
                            <div class="invalid-feedback">[[ error.sender ]]</div>
                            <h9>Email template</h9>
                            <p>
                                <h13>You may edit template or upload new one instead</h13>
                            </p>
                            <div class="form-group">
        
                                <p v-if="fileName">
                                    <h13>[[ fileName ]] preview:</h13>
                                </p>
                                <textarea class="form-control" rows="3"
                                          v-model="template"
                                          @drop.prevent="handleDrop"
                                          :style="modal_style"
                                ></textarea>
                                <label>
                                    <span class="btn btn-secondary">Upload template</span>
                                    <h13>Or drag and drop .html file in the template area</h13>
                                    <input type="file" accept="text/html" class="form-control form-control-alternative"
                                           style="display: none"
                                           @change="handleInputFile"
                                           :class="{ 'is-invalid': error.template }"
                                    >
                                </label>
                                
                                <div class="invalid-feedback">[[ error.template ]]</div>
                            </div>
                        </div>
        
        
                        <div class="form-group">
                            <label class="w-100">
                                <h9>Description</h9>
                                <textarea class="form-control" rows="1" placeholder="Optional"
                                          v-model="description">
                                    </textarea>
        
                            </label>
                        </div>
                        <div class="form-check">
                            <label>
                                <input class="form-check-input" type="checkbox"
                                       v-model="is_default">
                                <h9>
                                    Set as default
                                </h9>
                            </label>
                        </div>
                        
                        
                        
                        
                        
                        
                        <TestConnectionButton
                            :apiPath="apiPath + 'check_settings'"
                            :error="error.check_connection"
                            :body_data="body_data"
                            v-model:is_fetching="is_fetching"
                            @handleError="handleError"
                            v-if="show_test_connection"
                        >
                        
</TestConnectionButton>
                        
                        
                        
                        
                        
                        
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return Email.initialState()
    },
    mounted() {
        // this.modal.on('hidden.bs.modal', e => {
        //     this.clear()
        // })
        // this.$emit('update:modelValue', this.$data)
        // this.$emit('register', this.instance_name, this)
        console.log('EmailIntegration mounted', this)
        console.log('EmailIntegration mounted', this.$el)
        console.log('EmailIntegration mounted', this.$attrs)
        console.log('EmailIntegration mounted', this.$props)
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

        base64Template() {
            return btoa(this.template)
        },
        modal() {
            return $(this.$el)
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

}
// vueApp.component('email-integration', EmailIntegration)
register_component('email-integration', EmailIntegration)


// emailApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13'].includes(tag)

// const emailVm = emailApp.mount('#reporter_email_integration')

// $(document).ready(() => {
//     $('#reporter_email_integration').on('dragover', (e) => {
//         e.preventDefault()
//         $('#reporter_email_template_area').css({'height': '300px', 'border': '2px dashed var(--basic)'})
//     })
//     $('#reporter_email_integration').on('drop', (e) => {
//         e.preventDefault()
//         $('#reporter_email_template_area').css({'height': '100px', 'border': ''})
//     })
// })