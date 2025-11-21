-- Таблица для анонимных вопросов
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered BOOLEAN DEFAULT FALSE,
    answer_text TEXT,
    answered_at TIMESTAMP
);

-- Индекс для быстрой выборки неотвеченных вопросов
CREATE INDEX idx_questions_answered ON questions(answered);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);