import { RankingUsuarioModel, IRankingUsuario } from '../../models/ranking/Ranking';
import { AvaliacaoUsuarioModel, IAvaliacaoUsuario } from '../../models/ranking/AvaliacaoUsuario';
import { NivelRanking, AspectoPositivo, AspectoNegativo, EstatisticasRanking } from '../../types/rankingType';

export class RankingRepository {
    
    // Criar ou buscar ranking do usuário
    async criarOuBuscarRanking(id_usuario: string): Promise<IRankingUsuario> {
        let ranking = await RankingUsuarioModel.findOne({ id_usuario });
        
        if (!ranking) {
            ranking = new RankingUsuarioModel({
                id_usuario,
                score: 0, // Score inicial zerado para novos usuários
                nivel: NivelRanking.BRONZE,
                total_avaliacoes: 0
            });
            await ranking.save();
        }
        
        return ranking;
    }

    // Atualizar score e nível do usuário (sem incrementar total_avaliacoes)
    async atualizarScore(id_usuario: string, novoScore: number): Promise<IRankingUsuario> {
        const nivel = this.calcularNivel(novoScore);
        
        const ranking = await RankingUsuarioModel.findOneAndUpdate(
            { id_usuario },
            { 
                score: Math.max(0, Math.min(100, novoScore)), // Garante que score fique entre 0-100
                nivel
            },
            { new: true, upsert: true }
        );
        
        return ranking!;
    }

    // Atualizar score após avaliação (incrementa total_avaliacoes)
    async atualizarScoreAposAvaliacao(id_usuario: string, novoScore: number): Promise<IRankingUsuario> {
        const nivel = this.calcularNivel(novoScore);
        
        const ranking = await RankingUsuarioModel.findOneAndUpdate(
            { id_usuario },
            { 
                score: Math.max(0, Math.min(100, novoScore)), // Garante que score fique entre 0-100
                nivel,
                $inc: { total_avaliacoes: 1 }
            },
            { new: true, upsert: true }
        );
        
        return ranking!;
    }

    // Buscar ranking do usuário
    async buscarRanking(id_usuario: string): Promise<IRankingUsuario | null> {
        return await RankingUsuarioModel.findOne({ id_usuario });
    }

    // Salvar avaliação
    async salvarAvaliacao(avaliacao: {
        id_usuario: string;
        id_fornecedor: string;
        id_servico: string;
        aspectos_positivos: AspectoPositivo[];
        aspectos_negativos: AspectoNegativo[];
        comentario?: string;
    }): Promise<IAvaliacaoUsuario> {
        const novaAvaliacao = new AvaliacaoUsuarioModel(avaliacao);
        return await novaAvaliacao.save();
    }

    // Buscar avaliações do usuário
    async buscarAvaliacoesUsuario(id_usuario: string): Promise<IAvaliacaoUsuario[]> {
        return await AvaliacaoUsuarioModel.find({ id_usuario }).sort({ data_avaliacao: -1 });
    }

    // Calcular estatísticas do usuário
    async calcularEstatisticas(id_usuario: string): Promise<EstatisticasRanking> {
        const ranking = await this.buscarRanking(id_usuario);
        const avaliacoes = await this.buscarAvaliacoesUsuario(id_usuario);
        
        if (!ranking) {
            throw new Error('Ranking não encontrado');
        }

        const totalAvaliacoes = avaliacoes.length;
        
        // Contar aspectos positivos
        const contagemPositivos = new Map<AspectoPositivo, number>();
        const contagemNegativos = new Map<AspectoNegativo, number>();

        avaliacoes.forEach(avaliacao => {
            avaliacao.aspectos_positivos.forEach(aspecto => {
                contagemPositivos.set(aspecto, (contagemPositivos.get(aspecto) || 0) + 1);
            });
            
            avaliacao.aspectos_negativos.forEach(aspecto => {
                contagemNegativos.set(aspecto, (contagemNegativos.get(aspecto) || 0) + 1);
            });
        });

        // Calcular percentuais
        const aspectosPositivos = Array.from(contagemPositivos.entries()).map(([aspecto, quantidade]) => ({
            aspecto,
            quantidade,
            percentual: totalAvaliacoes > 0 ? Math.round((quantidade / totalAvaliacoes) * 100) : 0
        }));

        const aspectosNegativos = Array.from(contagemNegativos.entries()).map(([aspecto, quantidade]) => ({
            aspecto,
            quantidade,
            percentual: totalAvaliacoes > 0 ? Math.round((quantidade / totalAvaliacoes) * 100) : 0
        }));

        return {
            nivel_atual: ranking.nivel,
            score_atual: ranking.score,
            total_avaliacoes: totalAvaliacoes,
            aspectos_positivos: aspectosPositivos,
            aspectos_negativos: aspectosNegativos
        };
    }

    // Verificar se já existe avaliação para um serviço
    async verificarAvaliacaoExistente(id_servico: string): Promise<boolean> {
        const avaliacao = await AvaliacaoUsuarioModel.findOne({ id_servico });
        return !!avaliacao;
    }

    // Calcular nível baseado no score
    private calcularNivel(score: number): NivelRanking {
        if (score >= 90) return NivelRanking.DIAMANTE;
        if (score >= 80) return NivelRanking.PLATINA;
        if (score >= 70) return NivelRanking.OURO;
        if (score >= 50) return NivelRanking.PRATA;
        return NivelRanking.BRONZE;
    }
} 