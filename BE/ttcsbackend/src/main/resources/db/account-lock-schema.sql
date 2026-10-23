ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS lock_reason VARCHAR(1000);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS account_status_changes (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    actor_account_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS training_classes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    instructor_account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS ix_training_classes_instructor_account_id
    ON training_classes(instructor_account_id);
