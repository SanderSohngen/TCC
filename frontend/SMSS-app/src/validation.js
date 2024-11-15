const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
};

const validatePasswordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

const validateEnumValue = (value, allowedValues) => {
    return allowedValues.includes(value);
};

const validateuser_type = (user_type) => {
    const alloweduser_types = ['patient', 'professional', 'company'];
    return validateEnumValue(user_type, alloweduser_types);
};

const validateCompanyType = (company_type) => {
    const allowedCompanyTypes = ['hospital', 'market', 'pharmacy', 'sports_store', 'gym'];
    return validateEnumValue(company_type, allowedCompanyTypes);
};

const validateProfession = (profession) => {
    const allowedProfessions = ['medic', 'psycologist', 'nutritionist', 'personal_trainer'];
    return validateEnumValue(profession, allowedProfessions);
};

const validateAddress = (additionalData, errors) => {
    const requiredAddressFields = ['street', 'house_number', 'neighborhood', 'city', 'state'];
    requiredAddressFields.forEach(field => {
        if (!additionalData.address[field]) {
            errors[field] = `Campo ${field} é obrigatório.`;
        }
    });
};

export const validateSignupForm = (formData, additionalData) => {
    let errors = {};

    if (!validateEmail(formData.email)) {
        errors.email = "Inserir e-mail válido.";
    }

    if (!validatePasswordsMatch(formData.password, formData.confirmPassword)) {
        errors.confirmPassword = "Senhas não são iguais.";
    }

    if (!validateuser_type(formData.user_type)) {
        errors.user_type = "Tipo de usuário inválido.";
    }

    switch (formData.user_type) {
        case 'company':
            if (!additionalData.company_data?.cnpj) {
                errors.cnpj = "CNPJ é obrigatório.";
            }
            if (!validateCompanyType(additionalData.company_data?.company_type)) {
                errors.company_type = "Tipo de empresa inválido.";
            }
            validateAddress(additionalData, errors);
            break;

        case 'patient':
            if (!additionalData.patient_data?.birthday) {
                errors.birthday = "Data de nascimento é obrigatória.";
            }
            if (!validateEnumValue(additionalData.patient_data?.gender, ['male', 'female', 'other'])) {
                errors.gender = "Gênero inválido.";
            }
            if (
                isNaN(parseFloat(additionalData.patient_data?.weight))
                || parseFloat(additionalData.patient_data?.weight) <= 0
            ) {
                errors.weight = "Peso deve ser um número positivo";
            }
            validateAddress(additionalData, errors);
            break;

        case 'professional':
            if (!validateProfession(additionalData.professional_data?.profession)) {
                errors.profession = "Profissão inválida.";
            }
            if (!additionalData.professional_data?.credentials) {
                errors.credentials = "Credenciais são obrigatórias.";
            }
            if (!additionalData.professional_data?.price) {
                errors.price = "Preço por consulta é obrigatório.";
            } else if (
                isNaN(parseFloat(additionalData.professional_data?.price))
                || parseFloat(additionalData.professional_data?.price) <= 0
            ) {
                errors.price = "Preço por consulta deve ser um número positivo.";
            }
            break;

        default:
            errors.user_type = "Tipo de usuário inválido.";
            break;
    }

    return errors;
};

export const validateLoginForm = (form) => {
    let errors = {};
    if (!validateEmail(form.email)) {
        errors.email = "Inserir e-mail válido.";
    }
    return errors;
};