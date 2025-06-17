
-- Создание таблицы для RPA задач
CREATE TABLE public.rpa_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending',
    task_data jsonb NOT NULL,
    result_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Создание индексов
CREATE INDEX idx_rpa_tasks_task_id ON public.rpa_tasks(task_id);
CREATE INDEX idx_rpa_tasks_status ON public.rpa_tasks(status);
CREATE INDEX idx_rpa_tasks_created_at ON public.rpa_tasks(created_at);

-- Добавление комментариев
COMMENT ON TABLE public.rpa_tasks IS 'Таблица для хранения RPA задач и их результатов';
COMMENT ON COLUMN public.rpa_tasks.task_id IS 'Уникальный идентификатор задачи';
COMMENT ON COLUMN public.rpa_tasks.status IS 'Статус задачи: pending, processing, completed, failed, timeout';
COMMENT ON COLUMN public.rpa_tasks.task_data IS 'Данные задачи в формате JSON';
COMMENT ON COLUMN public.rpa_tasks.result_data IS 'Результат выполнения задачи в формате JSON';
