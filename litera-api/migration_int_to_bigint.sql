USE litera;

-- ─── 1. REMOVE TODAS AS FK CONSTRAINTS ───────────────────────────────────────

ALTER TABLE assinaturas_usuarios  DROP FOREIGN KEY assinaturas_usuarios_ibfk_1;
ALTER TABLE assinaturas_usuarios  DROP FOREIGN KEY assinaturas_usuarios_ibfk_2;
ALTER TABLE avaliacoes            DROP FOREIGN KEY avaliacoes_ibfk_1;
ALTER TABLE avaliacoes            DROP FOREIGN KEY avaliacoes_ibfk_2;
ALTER TABLE carteira_pontos       DROP FOREIGN KEY carteira_pontos_ibfk_1;
ALTER TABLE emprestimos           DROP FOREIGN KEY emprestimos_ibfk_1;
ALTER TABLE emprestimos           DROP FOREIGN KEY emprestimos_ibfk_2;
ALTER TABLE eventos               DROP FOREIGN KEY eventos_ibfk_1;
ALTER TABLE favoritos             DROP FOREIGN KEY favoritos_ibfk_1;
ALTER TABLE favoritos             DROP FOREIGN KEY favoritos_ibfk_2;
ALTER TABLE historico_pontos      DROP FOREIGN KEY historico_pontos_ibfk_1;
ALTER TABLE indicacoes            DROP FOREIGN KEY indicacoes_ibfk_1;
ALTER TABLE indicacoes            DROP FOREIGN KEY indicacoes_ibfk_2;
ALTER TABLE ingressos             DROP FOREIGN KEY ingressos_ibfk_1;
ALTER TABLE ingressos             DROP FOREIGN KEY ingressos_ibfk_2;
ALTER TABLE multas                DROP FOREIGN KEY multas_ibfk_1;
ALTER TABLE progresso_desafios    DROP FOREIGN KEY progresso_desafios_ibfk_1;
ALTER TABLE progresso_desafios    DROP FOREIGN KEY progresso_desafios_ibfk_2;
ALTER TABLE resgates_pontos       DROP FOREIGN KEY resgates_pontos_ibfk_1;

-- ─── 2. ALTERA TODAS AS PKs E FKs DE INT PARA BIGINT ─────────────────────────

ALTER TABLE planos
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE usuarios
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE livros
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE desafios
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE assinaturas_usuarios
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT,
    MODIFY COLUMN plano_id   BIGINT;

ALTER TABLE emprestimos
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT,
    MODIFY COLUMN livro_id   BIGINT;

ALTER TABLE multas
    MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN emprestimo_id BIGINT;

ALTER TABLE carteira_pontos
    MODIFY COLUMN usuario_id BIGINT NOT NULL;

ALTER TABLE historico_pontos
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT;

ALTER TABLE resgates_pontos
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT;

ALTER TABLE progresso_desafios
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT,
    MODIFY COLUMN desafio_id BIGINT;

ALTER TABLE avaliacoes
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT,
    MODIFY COLUMN livro_id   BIGINT;

ALTER TABLE favoritos
    MODIFY COLUMN usuario_id BIGINT NOT NULL,
    MODIFY COLUMN livro_id   BIGINT NOT NULL;

ALTER TABLE indicacoes
    MODIFY COLUMN id                 BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_indicador_id BIGINT,
    MODIFY COLUMN usuario_indicado_id  BIGINT;

ALTER TABLE eventos
    MODIFY COLUMN id             BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN organizador_id BIGINT;

ALTER TABLE ingressos
    MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY COLUMN usuario_id BIGINT,
    MODIFY COLUMN evento_id  BIGINT;

-- ─── 3. RECRIA TODAS AS FK CONSTRAINTS ───────────────────────────────────────

ALTER TABLE assinaturas_usuarios
    ADD CONSTRAINT assinaturas_usuarios_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    ADD CONSTRAINT assinaturas_usuarios_ibfk_2 FOREIGN KEY (plano_id)   REFERENCES planos(id);

ALTER TABLE avaliacoes
    ADD CONSTRAINT avaliacoes_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    ADD CONSTRAINT avaliacoes_ibfk_2 FOREIGN KEY (livro_id)   REFERENCES livros(id);

ALTER TABLE carteira_pontos
    ADD CONSTRAINT carteira_pontos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

ALTER TABLE emprestimos
    ADD CONSTRAINT emprestimos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    ADD CONSTRAINT emprestimos_ibfk_2 FOREIGN KEY (livro_id)   REFERENCES livros(id);

ALTER TABLE eventos
    ADD CONSTRAINT eventos_ibfk_1 FOREIGN KEY (organizador_id) REFERENCES usuarios(id);

ALTER TABLE favoritos
    ADD CONSTRAINT favoritos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    ADD CONSTRAINT favoritos_ibfk_2 FOREIGN KEY (livro_id)   REFERENCES livros(id);

ALTER TABLE historico_pontos
    ADD CONSTRAINT historico_pontos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

ALTER TABLE indicacoes
    ADD CONSTRAINT indicacoes_ibfk_1 FOREIGN KEY (usuario_indicador_id) REFERENCES usuarios(id),
    ADD CONSTRAINT indicacoes_ibfk_2 FOREIGN KEY (usuario_indicado_id)  REFERENCES usuarios(id);

ALTER TABLE ingressos
    ADD CONSTRAINT ingressos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    ADD CONSTRAINT ingressos_ibfk_2 FOREIGN KEY (evento_id)  REFERENCES eventos(id);

ALTER TABLE multas
    ADD CONSTRAINT multas_ibfk_1 FOREIGN KEY (emprestimo_id) REFERENCES emprestimos(id);

ALTER TABLE progresso_desafios
    ADD CONSTRAINT progresso_desafios_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    ADD CONSTRAINT progresso_desafios_ibfk_2 FOREIGN KEY (desafio_id) REFERENCES desafios(id);

ALTER TABLE resgates_pontos
    ADD CONSTRAINT resgates_pontos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- ─── VERIFICAÇÃO ──────────────────────────────────────────────────────────────

SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'litera'
  AND COLUMN_NAME IN ('id', 'usuario_id', 'plano_id', 'livro_id',
                      'emprestimo_id', 'desafio_id', 'evento_id',
                      'organizador_id', 'usuario_indicador_id', 'usuario_indicado_id')
ORDER BY TABLE_NAME, COLUMN_NAME;
