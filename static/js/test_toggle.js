const EmailRecipient = {
    props: ['email', 'index'],
    emits: ['remove'],
    delimiters: ['[[', ']]'],
    template: `
        <li class="list-group-item d-inline-flex justify-content-between p-1">
            <h13>[[ email ]]</h13>
            <button
                type="button"
                class="btn btn-action btn-24"
                title="remove"
                @click.prevent="remove"
            >
                <i class="fa fa-times"></i>
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
    props: ['instance_name', 'section', 'selected_integration', 'is_selected'],
    emits: ['set_data', 'clear_data'],
    data() {
        return this.initialState()
    },
    computed: {
        hasErrors() {
            return this.errors.length + this.warnings.length > 0
        },
        // container_id() {
        //     return `selector_${this.integration_name}`
        // },

    },
    // watch: {
    //     selected_integration(newState, oldState) {
    //         console.log('watching selected_integration: ', oldState, '->', newState)
    //         console.log('watching selected_integration: ', this.integration_data)
    //         this.set_data(this.integration_data.settings)
    //     }
    // },
    methods: {
        get_data() {
            // if ($('#integration_checkbox_reporter_email').prop('checked')) {
            if (this.is_selected) {
                const {selected_integration: id, recipients} = this
                return {id, recipients}
            }
        },
        set_data(data) {
            const {id, recipients} = data

            // this.id = id
            this.recipients = recipients
            this.$emit('set_data', {id})
        },
        clear_data() {
            // // const selector = $('#selector_reporter_email .selectpicker')
            // // selector[0]?.options.forEach(item =>
            // //     $(item).attr('data-is_default') && $(selector[0]).val($(item).val()).selectpicker('refresh')
            // // )
            // $('#integration_checkbox_reporter_email').prop('checked', false)
            // $(this.$el).collapse('hide')
            // // $('#selector_reporter_email').collapse('hide')
            // // vueVm.registered_components.reporter_email.clear()
            Object.assign(this.$data, this.initialState())
            this.$emit('clear_data')
        },
        // clear() {
        //     Object.assign(this.$data, {
        //         ...this.$data,
        //         ...this.initialState(),
        //     })
        //     this.selected_integration = this.default_integration?.id
        // },
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
    // mounted() {
    //     console.log('slotPropsslotPropsslotProps', this.$props)
    // //     // console.log('project_integrations', this.project_integrations)
    // //     // console.log('default_integration', this.default_integration)
    // //     // console.log(JSON.parse(this.project_integrations))
    // //     this.selected_integration = this.default_integration?.id
    // //     // window['reporters_reporter_email'] = {
    // //     //
    // //     // }
    // },
    template: `


    <div class="mt-3">
        <h9>Recipients</h9>
        <div class="input-group">
            <input type="email" class="form-control" placeholder="Recipients' emails comma-separated"
                   v-model="email"
                   :class="{ 'is-invalid': hasErrors }"
            >
            <div class="input-group-append">
                <button class="btn btn-secondary btn-37" type="button"
                        style="max-width: unset"
                        @click="handleAdd"
                        :disabled="email === ''"
                        :class="{ 'btn-danger': hasErrors }"
                >
                    Add
                </button>
            </div>

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
        <ul class="list-group mt-1 list-group-flush">
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