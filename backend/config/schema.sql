-- FastHireMela PostgreSQL Database Schema
-- This file contains the complete database schema for the job listing platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('IT & Software', 'it-software', 'Information Technology and Software jobs', '💻', '#3B82F6'),
('Marketing', 'marketing', 'Marketing and Digital Marketing jobs', '📈', '#10B981'),
('Sales', 'sales', 'Sales and Business Development jobs', '💼', '#F59E0B'),
('Design', 'design', 'UI/UX, Graphic Design and Creative jobs', '🎨', '#EF4444'),
('Finance', 'finance', 'Accounting, Finance and Banking jobs', '💰', '#8B5CF6'),
('HR', 'hr', 'Human Resources and Recruitment jobs', '👥', '#06B6D4'),
('Engineering', 'engineering', 'Engineering and Technical jobs', '⚙️', '#6B7280'),
('Education', 'education', 'Education and Training jobs', '📚', '#84CC16'),
('Healthcare', 'healthcare', 'Healthcare and Medical jobs', '🏥', '#EC4899'),
('Customer Service', 'customer-service', 'Customer Support and Service jobs', '🎧', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    headquarters VARCHAR(200),
    founded_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PREMIUM PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS premium_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_days INTEGER NOT NULL,
    features JSONB, -- Store features as JSON
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default premium plans only if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM premium_plans LIMIT 1) THEN
        INSERT INTO premium_plans (name, description, price, duration_days, features, is_popular) VALUES
        ('Basic', 'Access to basic premium features', 299.00, 30, '{"unlimited_applications": true, "resume_builder": false, "priority_support": false}', false),
        ('Professional', 'Most popular plan for job seekers', 599.00, 30, '{"unlimited_applications": true, "resume_builder": true, "priority_support": true, "ai_job_matching": false}', true),
        ('Premium', 'Complete package with all features', 999.00, 30, '{"unlimited_applications": true, "resume_builder": true, "priority_support": true, "ai_job_matching": true, "career_coaching": true}', false);
    END IF;
END $$;

-- =============================================
-- ADMIN USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- APP USERS TABLE (Job Seekers)
-- =============================================
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Profile Information
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    address TEXT,
    bio TEXT,
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    experience_years INTEGER,
    current_job_title VARCHAR(200),
    current_company VARCHAR(200),
    industry VARCHAR(100),
    education_level VARCHAR(100),
    skills TEXT[],
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    profile_picture VARCHAR(500),
    preferred_job_types TEXT[],
    preferred_locations TEXT[],
    preferred_salary_min DECIMAL(10,2),
    preferred_salary_max DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'INR',
    is_open_to_work BOOLEAN DEFAULT false,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'contacts_only', 'hidden')),
    is_profile_complete BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    location VARCHAR(200) NOT NULL,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'INR',
    salary_type VARCHAR(20) DEFAULT 'annual',
    experience_min INTEGER,
    experience_max INTEGER,
    experience_level VARCHAR(20) CHECK (experience_level IN ('fresher', 'entry', 'mid', 'senior', 'lead', 'executive')),
    job_type VARCHAR(20) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid')),
    skills_required TEXT[],
    responsibilities TEXT[],
    eligibility TEXT,
    education_required VARCHAR(100),
    apply_link VARCHAR(500) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_premium_only BOOLEAN DEFAULT false,
    application_deadline DATE,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SAVED JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- =============================================
-- JOB APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cover_letter TEXT,
    resume_url VARCHAR(500),
    application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'viewed', 'shortlisted', 'rejected', 'hired')),
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

-- =============================================
-- JOB ALERTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS job_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    keywords TEXT[],
    location VARCHAR(200),
    job_type VARCHAR(20),
    experience_level VARCHAR(20),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PREMIUM SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS premium_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES premium_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PAYMENT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES premium_subscriptions(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(500),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- ANALYTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'job_view', 'job_apply', 'user_register', etc.
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB, -- Additional event data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CONTACT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- =============================================
-- PAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    meta_title VARCHAR(200),
    meta_description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_homepage BOOLEAN DEFAULT false,
    template VARCHAR(50) DEFAULT 'default',
    author_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    featured_image VARCHAR(500),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description, is_public) VALUES
('site_name', 'FastHireMela', 'Site name displayed in header', true),
('site_description', 'Find your dream job with FastHireMela - The best job listing platform', 'Site description for SEO', true),
('contact_email', 'contact@fasthiremela.com', 'Contact email address', true),
('max_free_applications', '10', 'Maximum number of free applications per user per day', false),
('enable_job_alerts', 'true', 'Enable job alerts for users', true),
('maintenance_mode', 'false', 'Enable maintenance mode', true),
('featured_jobs_limit', '10', 'Maximum number of featured jobs to display', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING gin(skills_required);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);

CREATE INDEX IF NOT EXISTS idx_app_users_is_active ON app_users(is_active);
CREATE INDEX IF NOT EXISTS idx_app_users_email_active ON app_users(email, is_active);

-- Job applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at);

-- Job views indexes




-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_job_id ON analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Saved jobs indexes
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

-- Job alerts indexes
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_category_id ON job_alerts(category_id);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);



-- Pages indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_author_id ON pages(author_id);
CREATE INDEX IF NOT EXISTS idx_pages_is_homepage ON pages(is_homepage);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_title ON pages USING gin(to_tsvector('english', title));

-- Contacts indexes







-- Activity indexes






-- Sessions indexes






-- =============================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- =============================================

-- Function to update updated_at timestamp
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for tables with updated_at columns
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_plans_updated_at ON premium_plans;
CREATE TRIGGER update_premium_plans_updated_at BEFORE UPDATE ON premium_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_alerts_updated_at ON job_alerts;
CREATE TRIGGER update_job_alerts_updated_at BEFORE UPDATE ON job_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for active jobs with company and category details
DROP VIEW IF EXISTS active_jobs_view CASCADE;
CREATE OR REPLACE VIEW active_jobs_view AS
SELECT 
    j.id,
    j.title,
    j.slug,
    j.description,
    j.company_id,
    j.location,
    j.salary_min,
    j.salary_max,
    j.salary_currency,
    j.salary_type,
    j.experience_min,
    j.experience_max,
    j.experience_level,
    j.job_type,
    j.skills_required,
    j.responsibilities,
    j.eligibility,
    j.education_required,
    j.apply_link,
    j.category_id,
    j.is_active,
    j.is_featured,
    j.is_premium_only,
    j.application_deadline,
    j.posted_date,
    j.expires_at,
    j.view_count,
    j.click_count,
    j.created_at,
    j.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    co.name as company_name,
    co.logo_url as company_logo,
    co.website as company_website,
    co.description as company_description,
    co.industry as company_industry,
    co.company_size as company_size,
    co.headquarters as company_headquarters,
    co.founded_year as company_founded_year
FROM jobs j
LEFT JOIN categories c ON j.category_id = c.id
LEFT JOIN companies co ON j.company_id = co.id
WHERE j.is_active = true AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP);

-- View for user statistics
DROP VIEW IF EXISTS user_stats_view CASCADE;
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    COUNT(*) as total_users,
    (SELECT COUNT(*) FROM premium_subscriptions WHERE is_active = true AND expires_at > CURRENT_TIMESTAMP) as active_premium_users,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
FROM app_users 
WHERE is_active = true;

-- View for job statistics
DROP VIEW IF EXISTS job_stats_view CASCADE;
CREATE OR REPLACE VIEW job_stats_view AS
SELECT 
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_jobs,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_jobs,
    COUNT(CASE WHEN posted_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_jobs_last_30_days
FROM jobs;

-- =============================================
-- SAMPLE DATA (for development)
-- =============================================

-- Insert sample companies
INSERT INTO companies (name, slug, description, industry, company_size, headquarters, founded_year) VALUES
('TechCorp Solutions', 'techcorp-solutions', 'Leading technology company specializing in software development', 'IT & Software', '100-500', 'Bangalore, India', 2015),
('Marketing Pro', 'marketing-pro', 'Digital marketing agency helping brands grow online', 'Marketing', '50-100', 'Mumbai, India', 2018),
('FinanceHub', 'finance-hub', 'Financial services and consulting firm', 'Finance', '500-1000', 'Delhi, India', 2010),
('Design Studio', 'design-studio', 'Creative design agency for UI/UX and branding', 'Design', '10-50', 'Pune, India', 2020),
('HealthCare Plus', 'healthcare-plus', 'Healthcare services and medical equipment provider', 'Healthcare', '1000+', 'Chennai, India', 2005)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample admin user (password: admin123)
INSERT INTO admins (name, email, password_hash, role) VALUES
('Super Admin', 'admin@fasthiremela.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =============================================

-- Function to get job recommendations based on user profile
DROP FUNCTION IF EXISTS get_job_recommendations(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_job_recommendations(p_user_id INTEGER, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(job_id INTEGER, title VARCHAR, company_name VARCHAR, location VARCHAR, salary_min DECIMAL, salary_max DECIMAL, match_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH user_profile AS (
        SELECT 
            array_agg(DISTINCT ja.category_id) as preferred_categories,
            array_agg(DISTINCT ja.location) as preferred_locations
        FROM job_applications ja
        WHERE ja.user_id = p_user_id
    ),
    job_scores AS (
        SELECT 
            j.id,
            j.title,
            co.name as company_name,
            j.location,
            j.salary_min,
            j.salary_max,
            CASE 
                WHEN j.category_id = ANY(up.preferred_categories) THEN 0.5
                ELSE 0
            END +
            CASE 
                WHEN j.location = ANY(up.preferred_locations) THEN 0.3
                ELSE 0
            END +
            CASE 
                WHEN j.is_featured = true THEN 0.2
                ELSE 0
            END as score
        FROM jobs j
        LEFT JOIN companies co ON j.company_id = co.id
        CROSS JOIN user_profile up
        WHERE j.is_active = true 
        AND (j.expires_at IS NULL OR j.expires_at > CURRENT_TIMESTAMP)
        AND j.id NOT IN (
            SELECT job_id FROM saved_jobs WHERE user_id = p_user_id
        )
    )
    SELECT 
        js.id,
        js.title,
        js.company_name,
        js.location,
        js.salary_min,
        js.salary_max,
        js.score
    FROM job_scores js
    WHERE js.score > 0
    ORDER BY js.score DESC, js.posted_date DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old analytics data (older than 90 days)
DROP FUNCTION IF EXISTS cleanup_old_analytics() CASCADE;
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update job view counts
DROP FUNCTION IF EXISTS update_job_view_count(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION update_job_view_count(p_job_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE jobs 
    SET view_count = view_count + 1 
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has reached daily application limit
DROP FUNCTION IF EXISTS check_daily_application_limit(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION check_daily_application_limit(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    today_applications INTEGER;
    max_applications INTEGER;
BEGIN
    -- Get today's application count
    SELECT COUNT(*) INTO today_applications
    FROM job_applications 
    WHERE user_id = p_user_id 
    AND DATE(applied_at) = CURRENT_DATE;
    
    -- Get max applications from settings
    SELECT value::INTEGER INTO max_applications
    FROM settings 
    WHERE key = 'max_free_applications';
    
    -- Default to 10 if setting not found
    IF max_applications IS NULL THEN
        max_applications := 10;
    END IF;
    
    -- Check if user has an active premium subscription
    PERFORM 1
    FROM premium_subscriptions
    WHERE user_id = p_user_id AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    LIMIT 1;
    
    IF FOUND THEN
        RETURN TRUE; -- Premium users have unlimited applications
    END IF;
    
    RETURN today_applications < max_applications;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CONSTRAINTS AND VALIDATIONS
-- =============================================

-- Add check constraints for data integrity
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS chk_salary_range;
ALTER TABLE jobs ADD CONSTRAINT chk_salary_range CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS chk_experience_range;
ALTER TABLE jobs ADD CONSTRAINT chk_experience_range CHECK (experience_min IS NULL OR experience_max IS NULL OR experience_min <= experience_max);

ALTER TABLE premium_plans DROP CONSTRAINT IF EXISTS chk_positive_price;
ALTER TABLE premium_plans ADD CONSTRAINT chk_positive_price CHECK (price > 0);

ALTER TABLE premium_plans DROP CONSTRAINT IF EXISTS chk_positive_duration;
ALTER TABLE premium_plans ADD CONSTRAINT chk_positive_duration CHECK (duration_days > 0);

ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS chk_positive_amount;
ALTER TABLE payment_transactions ADD CONSTRAINT chk_positive_amount CHECK (amount > 0);

-- =============================================
-- SEO MANAGEMENT TABLES
-- =============================================

-- SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
    id SERIAL PRIMARY KEY,
    setting_type VARCHAR(50) NOT NULL, -- 'global', 'homepage', 'jobs', 'companies', 'blog'
    page_type VARCHAR(50), -- 'job_listing', 'job_detail', 'company_listing', 'company_detail', 'blog_listing', 'blog_detail'
    meta_title VARCHAR(300),
    meta_description TEXT,
    meta_keywords TEXT,
    og_title VARCHAR(300),
    og_description TEXT,
    og_image VARCHAR(500),
    twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
    twitter_title VARCHAR(300),
    twitter_description TEXT,
    twitter_image VARCHAR(500),
    canonical_url VARCHAR(500),
    robots_meta VARCHAR(200) DEFAULT 'index, follow',
    json_ld_schema JSONB, -- Store structured data
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sitemap Config Table
CREATE TABLE IF NOT EXISTS sitemap_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    url_pattern VARCHAR(500) NOT NULL, -- URL pattern for the sitemap
    priority DECIMAL(2,1) DEFAULT 0.8, -- Priority for URLs (0.0 to 1.0)
    change_frequency VARCHAR(20) DEFAULT 'weekly', -- always, hourly, daily, weekly, monthly, yearly, never
    include_last_mod BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redirects Table (301/302 redirects)
CREATE TABLE IF NOT EXISTS redirects (
    id SERIAL PRIMARY KEY,
    source_url VARCHAR(500) NOT NULL UNIQUE, -- Old URL
    destination_url VARCHAR(500) NOT NULL, -- New URL
    redirect_type INTEGER DEFAULT 301 CHECK (redirect_type IN (301, 302, 303, 307, 308)),
    is_active BOOLEAN DEFAULT true,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Analytics Table (for tracking SEO performance)
CREATE TABLE IF NOT EXISTS seo_analytics (
    id SERIAL PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(300),
    meta_description TEXT,
    h1_tag VARCHAR(300),
    word_count INTEGER,
    image_count INTEGER,
    internal_links INTEGER,
    external_links INTEGER,
    load_time DECIMAL(8,3), -- Page load time in seconds
    mobile_friendly BOOLEAN,
    seo_score INTEGER, -- SEO score (0-100)
    issues JSONB, -- Array of SEO issues found
    recommendations JSONB, -- Array of SEO recommendations
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default SEO settings only if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM seo_settings LIMIT 1) THEN
        INSERT INTO seo_settings (setting_type, page_type, meta_title, meta_description, is_active) VALUES
        ('global', NULL, 'FastHireMela - Find Your Dream Job in India', 'FastHireMela is India''s leading job portal. Find thousands of jobs in IT, Marketing, Sales, Design, Finance and more. Apply now and get hired!', true),
        ('homepage', NULL, 'FastHireMela - Latest Jobs in India | Apply Now', 'Discover the latest job opportunities in India on FastHireMela. Browse jobs by category, location, and company. Your dream job is just a click away!', true),
        ('jobs', 'job_listing', 'Latest Jobs in {category} | FastHireMela', 'Find the latest {category} jobs in India. Browse through {count} job openings from top companies. Apply now on FastHireMela!', true),
        ('jobs', 'job_detail', '{job_title} at {company} - {location} | FastHireMela', 'Apply for {job_title} position at {company} in {location}. {experience_level} role with {salary_range}. Posted {posted_date}. Apply now!', true),
        ('companies', 'company_listing', 'Top Companies Hiring in India | FastHireMela', 'Browse and apply to jobs from top companies in India. Find your dream job at leading companies across various industries.', true),
        ('companies', 'company_detail', 'Jobs at {company} | Careers & Opportunities', 'Explore career opportunities at {company}. View current job openings, company culture, benefits, and apply for positions that match your skills.', true);
    END IF;
END $$;

-- Insert default sitemap configurations
INSERT INTO sitemap_config (name, url_pattern, priority, change_frequency) VALUES
('Homepage', '/', 1.0, 'daily'),
('Jobs Listing', '/jobs', 0.9, 'daily'),
('Categories', '/categories', 0.8, 'weekly'),
('Companies', '/companies', 0.8, 'weekly'),
('Blog', '/blog', 0.7, 'weekly'),
('About', '/about', 0.6, 'monthly'),
('Contact', '/contact', 0.5, 'monthly')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEO TABLE INDEXES
-- =============================================

-- SEO Settings indexes
CREATE INDEX IF NOT EXISTS idx_seo_settings_type ON seo_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_seo_settings_page_type ON seo_settings(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_settings_is_active ON seo_settings(is_active);

-- Sitemap Config indexes
CREATE INDEX IF NOT EXISTS idx_sitemap_config_name ON sitemap_config(name);
CREATE INDEX IF NOT EXISTS idx_sitemap_config_is_active ON sitemap_config(is_active);

-- Redirects indexes
CREATE INDEX IF NOT EXISTS idx_redirects_source_url ON redirects(source_url);
CREATE INDEX IF NOT EXISTS idx_redirects_is_active ON redirects(is_active);

-- SEO Analytics indexes
CREATE INDEX IF NOT EXISTS idx_seo_analytics_page_url ON seo_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_analyzed_at ON seo_analytics(analyzed_at);

-- =============================================
-- SEO TRIGGERS
-- =============================================

-- Trigger for updating seo_settings.updated_at
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON seo_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating sitemap_config.updated_at
CREATE TRIGGER update_sitemap_config_updated_at BEFORE UPDATE ON sitemap_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updating redirects.updated_at
CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON redirects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEO FUNCTIONS
-- =============================================

-- Function to generate sitemap XML
CREATE OR REPLACE FUNCTION generate_sitemap_xml(p_base_url VARCHAR DEFAULT 'https://fasthiremela.com')
RETURNS TEXT AS $$
DECLARE
    v_xml TEXT := '<?xml version="1.0" encoding="UTF-8"?>' || CHR(10) || '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' || CHR(10);
    v_url_record RECORD;
    v_last_mod TIMESTAMP;
BEGIN
    -- Add static pages from sitemap_config
    FOR v_url_record IN 
        SELECT url_pattern, priority, change_frequency 
        FROM sitemap_config 
        WHERE is_active = true
        ORDER BY priority DESC
    LOOP
        v_xml := v_xml || '  <url>' || CHR(10);
        v_xml := v_xml || '    <loc>' || p_base_url || v_url_record.url_pattern || '</loc>' || CHR(10);
        
        IF v_url_record.change_frequency IS NOT NULL THEN
            v_xml := v_xml || '    <changefreq>' || v_url_record.change_frequency || '</changefreq>' || CHR(10);
        END IF;
        
        IF v_url_record.priority IS NOT NULL THEN
            v_xml := v_xml || '    <priority>' || v_url_record.priority || '</priority>' || CHR(10);
        END IF;
        
        v_xml := v_xml || '  </url>' || CHR(10);
    END LOOP;
    
    -- Add active jobs
    FOR v_url_record IN 
        SELECT slug, updated_at::timestamp as last_mod
        FROM jobs 
        WHERE is_active = true 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY updated_at DESC
    LOOP
        v_xml := v_xml || '  <url>' || CHR(10);
        v_xml := v_xml || '    <loc>' || p_base_url || '/jobs/' || v_url_record.slug || '</loc>' || CHR(10);
        v_xml := v_xml || '    <lastmod>' || TO_CHAR(v_url_record.last_mod, 'YYYY-MM-DD') || '</lastmod>' || CHR(10);
        v_xml := v_xml || '    <changefreq>weekly</changefreq>' || CHR(10);
        v_xml := v_xml || '    <priority>0.8</priority>' || CHR(10);
        v_xml := v_xml || '  </url>' || CHR(10);
    END LOOP;
    
    -- Add active companies
    FOR v_url_record IN 
        SELECT slug, updated_at::timestamp as last_mod
        FROM companies 
        WHERE is_active = true
        ORDER BY updated_at DESC
    LOOP
        v_xml := v_xml || '  <url>' || CHR(10);
        v_xml := v_xml || '    <loc>' || p_base_url || '/companies/' || v_url_record.slug || '</loc>' || CHR(10);
        v_xml := v_xml || '    <lastmod>' || TO_CHAR(v_url_record.last_mod, 'YYYY-MM-DD') || '</lastmod>' || CHR(10);
        v_xml := v_xml || '    <changefreq>monthly</changefreq>' || CHR(10);
        v_xml := v_xml || '    <priority>0.7</priority>' || CHR(10);
        v_xml := v_xml || '  </url>' || CHR(10);
    END LOOP;
    
    v_xml := v_xml || '</urlset>';
    RETURN v_xml;
END;
$$ LANGUAGE plpgsql;

-- Function to track redirect hits
CREATE OR REPLACE FUNCTION track_redirect_hit(p_redirect_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE redirects 
    SET hit_count = hit_count + 1 
    WHERE id = p_redirect_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get SEO settings for a specific page type
CREATE OR REPLACE FUNCTION get_seo_settings(p_page_type VARCHAR, p_setting_type VARCHAR DEFAULT NULL)
RETURNS TABLE(id INTEGER, meta_title VARCHAR, meta_description TEXT, meta_keywords TEXT, og_title VARCHAR, og_description TEXT, og_image VARCHAR, json_ld_schema JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.id,
        ss.meta_title,
        ss.meta_description,
        ss.meta_keywords,
        ss.og_title,
        ss.og_description,
        ss.og_image,
        ss.json_ld_schema
    FROM seo_settings ss
    WHERE ss.is_active = true
    AND (
        (p_setting_type IS NOT NULL AND ss.setting_type = p_setting_type AND ss.page_type = p_page_type)
        OR (p_setting_type IS NULL AND ss.page_type = p_page_type)
        OR (p_setting_type IS NULL AND ss.setting_type = 'global' AND ss.page_type IS NULL)
    )
    ORDER BY 
        CASE 
            WHEN ss.setting_type = 'global' THEN 3
            WHEN ss.page_type = p_page_type THEN 2
            ELSE 1
        END DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FINAL NOTES
-- =============================================

/*
This schema provides:

1. Complete table structure for FastHireMela job listing platform
2. Proper relationships with foreign keys and cascading deletes
3. Indexes for optimal query performance
4. Triggers for automatic timestamp updates
5. Views for common reporting needs
6. Functions for business logic operations
7. Sample data for development
8. Data validation constraints
9. SEO management capabilities for better search engine optimization

Key Features:
- Full-text search capabilities on job titles and locations
- Analytics tracking for job views and applications
- Premium subscription management
- Job alert system
- Comprehensive user management
- Payment processing integration
- Settings management
- Contact message handling
- SEO settings and meta tag management
- Sitemap generation
- URL redirect management
- SEO analytics and performance tracking

The schema is designed to scale with the application growth and provides
a solid foundation for the FastHireMela platform with comprehensive SEO features.
*/
