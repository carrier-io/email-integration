window['reporters_reporter_email'] = {
    get_data: () => {
        if ($('#integration_checkbox_reporter_email').prop('checked')) {
            const id = $('#selector_reporter_email .selectpicker').val()
            const recipients = emailVm.recipients
            return {id, recipients}
        }
    },
    set_data: data => {
        console.log('settings data for reporter_email', data)
        const {id, recipients} = data
        $('#integration_checkbox_reporter_email').prop('checked', true)
        $('#selector_reporter_email .selectpicker').val(id).selectpicker('refresh')
        $('#selector_reporter_email').collapse('show')
        emailVm.recipients = recipients
    },
    clear_data: () => {
        const selector = $('#selector_reporter_email .selectpicker')
        selector[0]?.options.forEach(item =>
            $(item).attr('data-is_default') && $(selector[0]).val($(item).val()).selectpicker('refresh')
        )
        $('#integration_checkbox_reporter_email').prop('checked', false)
        $('#selector_reporter_email').collapse('hide')
        emailVm.clear()
    }
}

const emailInitialState = () => ({
    email: '',
    recipients: [],
    errors: [],
    warnings: [],
    selected_integration: undefined,
})

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
            console.log('Emitting removal', this.index)
            this.$emit('remove', this.index)
        }
    }

}

const EmailIntegration = {
    delimiters: ['[[', ']]'],
    components: {
        EmailRecipient
    },
    props: ['instance_name', 'project_integrations', 'integration_name'],
    data() {
        return emailInitialState()
    },
    computed: {
        hasErrors() {
            return this.errors.length + this.warnings.length > 0
        },
        container_id() {
            return `selector_${this.integration_name}`
        }
    },
    methods: {
        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...emailInitialState(),
            })
        },
        add(email) {
            console.log('Adding email', email)
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
        }
    },
    mounted() {
        console.log('project_integrations', this.project_integrations)
        // console.log(JSON.parse(this.project_integrations))
    },
// <select className="selectpicker" data-style="btn-secondary">
//     {% for i in config['project_integrations'] %}
//     <option
//         value="{{ i.id }}"
//         {% if i.is_default %} selected data-is_default="true"{% endif %}
//         title="{{ i.description }} {% if i.is_default %} - default {% endif %}"
//     >
//         {{i.description}} {% if i.is_default %} - default {% endif %}
//     </option>
//     {% endfor %}
// </select>
    template: `

<div class="collapse col-12 mb-3 pl-0" :id="container_id">
    Here goes the selectpicker with:
    [[ project_integrations ]]
    <select class="selectpicker" data-style="btn-secondary"
    v-model="selected_integration">
        <option
            v-for="integration in project_integrations"
            
        >
            [[ integration.description ]]
        </option>
    </select>
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
</div>
    `
}
// <!--            class="btn btn-outline-danger btn-fab btn-icon btn-round btn-sm"-->

// emailApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13'].includes(tag)
// const emailVm = emailApp.mount('#reporter_email')

register_component('reporter-email', EmailIntegration)