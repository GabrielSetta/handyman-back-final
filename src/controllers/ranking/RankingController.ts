import { Request, Response } from 'express';
import { RankingService } from '../../service/ranking/RankingService';
import { CustomError } from '../../service/CustomError';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export class RankingController {
    private rankingService: RankingService;

    constructor() {
        this.rankingService = new RankingService();
    }

    // Avaliar usuário após conclusão do serviço
    async avaliarUsuario(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id_usuario, id_servico, aspectos_positivos, aspectos_negativos, comentario } = req.body;
            
            // Para teste, usar ID fixo se não houver autenticação
            const id_fornecedor = req.user?.id || 'fornecedor_teste_123';

            if (!id_usuario || !id_servico) {
                throw new CustomError('Dados obrigatórios não fornecidos', 400);
            }

            await this.rankingService.avaliarUsuario({
                id_usuario,
                id_fornecedor,
                id_servico,
                aspectos_positivos: aspectos_positivos || [],
                aspectos_negativos: aspectos_negativos || [],
                comentario
            });

            res.status(200).json({ 
                message: 'Usuário avaliado com sucesso' 
            });

        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    error: 'Erro interno do servidor' 
                });
            }
        }
    }

    // Buscar estatísticas do usuário (para o próprio usuário ver)
    async buscarEstatisticasUsuario(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id_usuario } = req.params;
            
            // Para teste, permitir acesso sem autenticação
            const id_usuario_autenticado = req.user?.id || id_usuario;

            const estatisticas = await this.rankingService.buscarEstatisticasUsuario(id_usuario);

            res.status(200).json(estatisticas);

        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    error: 'Erro interno do servidor' 
                });
            }
        }
    }

    // Buscar ranking do usuário (para fornecedores verem antes de aceitar pedido)
    async buscarRankingUsuario(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id_usuario } = req.params;
            
            // Para teste, usar ID fixo se não houver autenticação
            const id_fornecedor = req.user?.id || 'fornecedor_teste_123';

            if (!id_usuario) {
                throw new CustomError('ID do usuário não fornecido', 400);
            }

            const ranking = await this.rankingService.buscarRankingUsuario(id_usuario);

            res.status(200).json(ranking);

        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    error: 'Erro interno do servidor' 
                });
            }
        }
    }

    // Obter configuração de aspectos (para o frontend)
    async obterConfiguracaoAspectos(req: Request, res: Response): Promise<void> {
        try {
            const configuracao = this.rankingService.obterConfiguracaoAspectos();

            res.status(200).json(configuracao);

        } catch (error) {
            res.status(500).json({ 
                error: 'Erro interno do servidor' 
            });
        }
    }

    // Buscar estatísticas resumidas do usuário (para fornecedores verem ao clicar no ícone do nível)
    async buscarEstatisticasResumidas(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id_usuario } = req.params;

            if (!id_usuario) {
                throw new CustomError('ID do usuário não fornecido', 400);
            }

            const estatisticas = await this.rankingService.buscarEstatisticasResumidas(id_usuario);

            res.status(200).json(estatisticas);

        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    error: 'Erro interno do servidor' 
                });
            }
        }
    }
} 