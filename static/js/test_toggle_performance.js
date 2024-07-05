const EmailRecipient = {
    props: ['email', 'index'],
    emits: ['remove'],
    delimiters: ['[[', ']]'],
    template: `
        <li class="list-group-item d-inline-flex justify-content-between py-2 pr-2 pl-3 border-0">
            <p class="font-h5 font-weight-400">[[ email ]]</p>
            <button
                type="button"
                class="btn btn-default btn-xs btn-icon__xs mr-2"
                title="remove"
                @click.prevent="remove"
            >
                <i class="icon__16x16 icon-close__16"></i>
            </button>
        </li>
    `,
    methods: {
        remove() {
            this.$emit('remove', this.index)
        }
    }
}

const EmailIntegration = {
    delimiters: ['[[', ']]'],
    components: {
        EmailRecipient
    },
    props: ['instance_name', 'section', 'selected_integration', 'is_selected', 'integration_data'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    computed: {
        hasErrors() {
            return this.errors.length + this.warnings.length > 0
        },
        is_local() {
            return !!(this.integration_data.project_id)
        },
    },
    methods: {
        get_data() {
            if (this.is_selected) {
                const {selected_integration: id, is_local, recipients} = this
                return {id, is_local, project_id: this.integration_data.project_id, recipients}
            }
        },
        set_data(data) {
            const {id, is_local, recipients} = data
            this.recipients = recipients
            this.$emit('set_data', {id, is_local})
        },
        clear_data() {
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        add(email) {
            if (email === '') return;
            if (!this.validateEmail(email)) {
                this.errors.push(`Email ${email} is invalid`)
                return;
            }
            if (!this.validateUniqueness(email)) {
                this.warnings.push(`Email ${email} is already added`)
                return;
            }
            this.recipients.push(email);
        },
        handleAdd() {
            this.errors = []
            this.warnings = []
            this.email.split(',').forEach(i => {
                this.add(i.trim().toLowerCase())
            })
            if (!this.hasErrors) {
                this.email = ''
            }
            this.errors.length > 0 && alertCreateTest.add(`${this.errors.length} errors occurred while adding emails`, 'danger-overlay')
            this.warnings.length > 0 && alertCreateTest.add(`${this.warnings.length} warnings while adding emails`, 'warning-overlay')
        },
        validateUniqueness(email) {
            return this.recipients.find(e => e.toLowerCase() === email.toLowerCase()) === undefined
        },
        validateEmail(email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        },
        removeIndex(index) {
            this.recipients.splice(index, 1)
        },

        initialState: () => ({
            email: '',
            recipients: [],
            errors: [],
            warnings: [],
        })
    },
    template: `
        <div class="mt-3">
            <p class="font-h5 font-semibold">Recipients</p>
            <div class="input-group d-flex mt-1">
                <div class="custom-input flex-grow-1">
                    <input type="email" placeholder="Recipients' emails comma-separated"
                       v-model="email"
                       :class="{ 'is-invalid': hasErrors }"
                >
                </div>
                <button class="btn btn-lg btn-secondary ml-2" type="button"
                    @click="handleAdd"
                    :disabled="email === ''"
                    :class="{ 'btn-danger': hasErrors }"
                >
                    Add
                </button>
            </div>
            <div class="invalid-feedback"
                 style="display: block"
                 v-if="hasErrors"
            >
                <div v-for="error in errors">
                    [[ error ]]
                </div>
                <div v-for="warning in warnings" class="text-warning">
                    [[ warning ]]
                </div>
            </div>
            <ul class="list-group list-group-flush border rounded mt-2" v-if="recipients.length > 0" style="max-height: 170px; overflow-y: auto">
                <EmailRecipient
                        v-for="(item, index) in recipients"
                        :key="index"
                        :index="index"
                        :email="item"
                        @remove="removeIndex"
                ></EmailRecipient>
            </ul>
        </div>
    `
}

register_component('reporter-email', EmailIntegration)
