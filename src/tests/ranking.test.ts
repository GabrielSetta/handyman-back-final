import request from 'supertest';
import { app } from '../app';
import { AspectoPositivo, AspectoNegativo } from '../types/rankingType';

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

describe('Ranking - Estatísticas Resumidas', () => {
    test('deve retornar estatísticas resumidas do usuário', async () => {
        const userId = 'usuario_teste_123';
        
        // Primeiro, criar algumas avaliações para o usuário via API
        const avaliacoes = [
            {
                id_usuario: userId,
                id_servico: 'servico_1',
                aspectos_positivos: ['foi_educado', 'pagamento_pontual'],
                aspectos_negativos: []
            },
            {
                id_usuario: userId,
                id_servico: 'servico_2',
                aspectos_positivos: ['foi_educado', 'comunicacao_clara'],
                aspectos_negativos: ['pedido_urgente']
            },
            {
                id_usuario: userId,
                id_servico: 'servico_3',
                aspectos_positivos: ['pagamento_pontual'],
                aspectos_negativos: ['pedido_urgente', 'comunicacao_ruim']
            }
        ];

        // Salvar as avaliações via API
        for (const avaliacao of avaliacoes) {
            await request(app)
                .post('/ranking/avaliar-usuario')
                .send(avaliacao);
        }

        // Buscar estatísticas resumidas via API
        const res = await request(app).get(`/ranking/usuario/${userId}/resumo`);
        
        expect(res.status).toBe(200);
        const estatisticas = res.body;

        // Verificações
        expect(estatisticas).toBeDefined();
        expect(estatisticas.nivel).toBeDefined();
        expect(estatisticas.score).toBeGreaterThan(0);
        expect(estatisticas.total_avaliacoes).toBe(3);
        
        // Verificar se retorna apenas top 3 aspectos positivos
        expect(estatisticas.top_aspectos_positivos.length).toBeLessThanOrEqual(3);
        
        // Verificar se retorna apenas top 3 aspectos negativos
        expect(estatisticas.top_aspectos_negativos.length).toBeLessThanOrEqual(3);
        
        // Verificar se os aspectos estão ordenados por percentual (maior primeiro)
        if (estatisticas.top_aspectos_positivos.length > 1) {
            expect(estatisticas.top_aspectos_positivos[0].percentual).toBeGreaterThanOrEqual(
                estatisticas.top_aspectos_positivos[1].percentual
            );
        }
        
        if (estatisticas.top_aspectos_negativos.length > 1) {
            expect(estatisticas.top_aspectos_negativos[0].percentual).toBeGreaterThanOrEqual(
                estatisticas.top_aspectos_negativos[1].percentual
            );
        }

        console.log('✅ Estatísticas resumidas:', estatisticas);
    });
}); 