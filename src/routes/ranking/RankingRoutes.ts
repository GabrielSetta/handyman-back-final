import express from 'express';
import { RankingController } from '../../controllers/ranking/RankingController';

export const rankingRouter = express.Router();

const rankingController = new RankingController();

// Rotas para fornecedores
rankingRouter.post('/avaliar-usuario', 
    rankingController.avaliarUsuario.bind(rankingController)
);

rankingRouter.get('/usuario/:id_usuario', 
    rankingController.buscarRankingUsuario.bind(rankingController)
);

// Rotas para usuários
rankingRouter.get('/estatisticas/:id_usuario', 
    rankingController.buscarEstatisticasUsuario.bind(rankingController)
);

// Rota pública para configuração de aspectos
rankingRouter.get('/configuracao-aspectos', 
    rankingController.obterConfiguracaoAspectos.bind(rankingController)
); 