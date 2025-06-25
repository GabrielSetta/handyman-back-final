import request from 'supertest';
import { app } from '../app';

describe('Ranking API', () => {
    let id_usuario = 'usuario-teste-123';
    let id_servico = 'servico-teste-456';

    it('Deve retornar configuração de aspectos', async () => {
        const res = await request(app).get('/ranking/configuracao-aspectos');
        expect(res.status).toBe(200);
        expect(res.body.positivos).toBeDefined();
        expect(res.body.negativos).toBeDefined();
    });

    it('Deve permitir avaliar um usuário', async () => {
        const res = await request(app)
            .post('/ranking/avaliar-usuario')
            .send({
                id_usuario,
                id_servico,
                aspectos_positivos: ['ajudou_no_processo'],
                aspectos_negativos: ['pagamento_atrasado'],
                comentario: 'Teste automatizado'
            });
        expect([200, 400]).toContain(res.status); // 400 se já avaliado
    });

    it('Deve retornar estatísticas do usuário', async () => {
        const res = await request(app).get(`/ranking/estatisticas/${id_usuario}`);
        expect(res.status).toBe(200);
        expect(res.body.nivel_atual).toBeDefined();
        expect(res.body.score_atual).toBeDefined();
    });
}); 