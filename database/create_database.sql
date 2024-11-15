-- Habilitar a extensão pgcrypto para usar gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tipos Enumerados
CREATE TYPE user_type_enum AS ENUM ('patient', 'professional', 'company');
CREATE TYPE company_type_enum AS ENUM ('hospital', 'market', 'pharmacy', 'sports_store', 'gym');
CREATE TYPE profession_enum AS ENUM ('medic', 'psycologist', 'nutritionist', 'personal_trainer');
CREATE TYPE plan_type_enum AS ENUM ('nutrition', 'exercise', 'therapy', 'medication');
CREATE TYPE notification_type_enum AS ENUM ('exam_ready', 'order_status');
CREATE TYPE status_enum AS ENUM ('scheduled', 'completed', 'canceled', 'pending', 'paid', 'shipped', 'delivered');
CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'pix');
CREATE TYPE category_enum AS ENUM ('medication', 'food', 'exam', 'sports_item', 'membership');

-- Tabela users
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_type user_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela addresses
CREATE TABLE addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street VARCHAR(255) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

-- Tabela companies
CREATE TABLE companies (
    company_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    company_type company_type_enum NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    products_endpoint VARCHAR(255) NOT NULL,
    orders_endpoint VARCHAR(255) NOT NULL,
    address_id UUID REFERENCES addresses(address_id) ON DELETE CASCADE
);

-- Tabela products
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category category_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela patients
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    birthday DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    food_restrictions TEXT,
    address_id UUID REFERENCES addresses(address_id) ON DELETE CASCADE
);

-- Tabela professionals
CREATE TABLE professionals (
    professional_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    profession profession_enum NOT NULL,
    credentials VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    specialties TEXT[]
);

-- Tabela availabilities
CREATE TABLE availabilities (
    availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES professionals(professional_id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabela slots
CREATE TABLE slots (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES professionals(professional_id) ON DELETE CASCADE,
    slot_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_reserved BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela appointments
CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES slots(slot_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(patient_id) ON DELETE CASCADE,
    status status_enum NOT NULL CHECK (status IN ('scheduled', 'completed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela assessments
CREATE TABLE assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(patient_id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(professional_id) ON DELETE CASCADE,
    is_simplified BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela plans
CREATE TABLE plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(patient_id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(professional_id) ON DELETE CASCADE,
    plan_type plan_type_enum NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela plan_items
CREATE TABLE plan_items (
    plan_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(plan_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    instructions TEXT
);

-- Tabela order_options
CREATE TABLE order_options (
    order_option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(plan_id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela item_options
CREATE TABLE item_options (
    item_option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_option_id UUID REFERENCES order_options(order_option_id) ON DELETE CASCADE,
    plan_item_id UUID REFERENCES plan_items(plan_item_id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
    supplier_product_id VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL
);

-- Tabela orders
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(patient_id) ON DELETE CASCADE,
    order_option_id UUID REFERENCES order_options(order_option_id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    order_status status_enum NOT NULL CHECK (order_status IN ('pending', 'paid', 'completed', 'canceled', 'shipped', 'delivered')),
    payment_method payment_method_enum,
    transaction_id VARCHAR(255),
    shipping_address_id UUID REFERENCES addresses(address_id) ON DELETE CASCADE
);

-- Tabela order_items
CREATE TABLE order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    supplier_product_id VARCHAR(255),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Tabela notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type notification_type_enum NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela documents
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(patient_id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(professional_id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    s3_object_key VARCHAR(255) NOT NULL
);