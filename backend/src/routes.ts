import { Router } from 'express'
import rateLimit from 'express-rate-limit';
import { CreateUserController } from './controllers/user/CreateUserController';
import { CreateCategoryController } from './controllers/category/CreateCategoryController';
import { ListCategoryController } from './controllers/category/ListCategoryController';
import { UpdateCategoryController } from './controllers/category/UpdateCategoryController';
import { ListUserByIdController } from './controllers/user/ListUserByIdController';
import { AuthUserController } from './controllers/user/AuthUserController';
import { AuthGoogleUserController } from './controllers/user/AuthGoogleUserController';
import { isAuthenticated } from './middlewares/isAuthenticated';
import { isAdmin } from './middlewares/isAdmin';
import { upload, uploadCategoryIcon } from './middlewares/upload';
import { uploadComprovante  } from './middlewares/multerConfig'; 
import { CreateProductController } from './controllers/product/CreateProductController';
import { ListProductController } from './controllers/product/ListProductController';
import { DeleteProductController } from './controllers/product/DeleteProductController';
import { CreateOrderController } from './controllers/order/CreateOrderController';
import { UpdateOrderController } from './controllers/order/UpdateOrderController';
import { DeleteOrderController } from './controllers/order/DeletOrderController';
import { GetOrCreateCartController } from './controllers/order/GetOrCreateCartController';
import { CheckoutController } from './controllers/order/CheckoutController';
import { EnviarComprovanteController } from './controllers/order/EnviarComprovanteController';


import { ListMeusPedidosController } from './controllers/order/ListMeusPedidosController';
import { UpdateProductController } from './controllers/product/UpdateProductController';
import { SalesReportController } from './controllers/order/SalesReportController';
import { ListPedidosPendentesController } from './controllers/order/ListPedidosPendentesController';
import { AprovarPagamentoController } from './controllers/order/AprovarPagamentoController';
import { RejeitarPagamentoController } from './controllers/order/RejeitarPagamentoController';
import { VerComprovanteController } from './controllers/order/VerComprovanteController';
import { gerarQrCode } from './modulos/pix/PixController';
import { EnderecoController } from './controllers/user/EnderecoController';
import { getFreteEntrega } from './services/order/CheckoutService';
import { RequestPasswordResetController } from './controllers/user/RequestPasswordResetController';
import { ResetPasswordController } from './controllers/user/ResetPasswordController';
const router = Router();

router.get('/config/checkout', (_req, res) => {
    res.json({ freteEntrega: getFreteEntrega() });
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
});
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
});

//edpoints para usuario
router.post('/novousuario', authLimiter, new CreateUserController().handle );
router.get('/listusuario',isAuthenticated, new ListUserByIdController().handle);
router.post('/sessao', authLimiter, new AuthUserController().handle);
router.post('/sessao/google', authLimiter, new AuthGoogleUserController().handle);
router.post('/senha/recuperar', passwordResetLimiter, new RequestPasswordResetController().handle);
router.post('/senha/redefinir', passwordResetLimiter, new ResetPasswordController().handle);

// Endereço do cliente e consulta pública de CEP
const enderecoController = new EnderecoController();
router.get('/endereco/usuario/:userId', isAuthenticated, enderecoController.buscarDoUsuario.bind(enderecoController));
router.post('/endereco', isAuthenticated, enderecoController.salvar.bind(enderecoController));
router.get('/endereco/:cep', enderecoController.buscarCep.bind(enderecoController));

//edpoints para categoria
router.post('/novacategoria', isAuthenticated, isAdmin, uploadCategoryIcon.single('icon'), new CreateCategoryController().handle);
router.put('/atualizacategoria', isAuthenticated, isAdmin, uploadCategoryIcon.single('icon'), new UpdateCategoryController().handle);
router.get('/listcategoria', isAuthenticated, new ListCategoryController().handle);

//edpoints para produto
router.post('/novoproduto', isAuthenticated, isAdmin, upload.single('banner'), new CreateProductController().handle);
router.get('/listproduto', isAuthenticated, new ListProductController().handle);
router.delete('/deletaproduto', isAuthenticated, isAdmin, new DeleteProductController().handle);
router.put('/atualizaproduto', isAuthenticated, isAdmin, upload.single('banner'), new UpdateProductController().handle);

//endpoints para pedido / carrinho
router.get('/carrinho', isAuthenticated, new GetOrCreateCartController().handle);
router.post('/novopedido', isAuthenticated, new CreateOrderController().handle);
router.put('/atualizapedido', isAuthenticated, new UpdateOrderController().handle);
router.delete('/deletapedido', isAuthenticated, new DeleteOrderController().handle);
router.get('/meuspedidos', isAuthenticated, new ListMeusPedidosController().handle);

//endpoints para pagamento
router.post('/checkout', isAuthenticated, new CheckoutController().handle);
router.get('/checkout/:compraId/qrcode', isAuthenticated, gerarQrCode);
router.post('/checkout/:id_compra/comprovante', isAuthenticated, uploadComprovante.single('comprovante'), new EnviarComprovanteController().handle);
router.get('/checkout/:id_compra/comprovante', isAuthenticated, new VerComprovanteController().handle);

//endpoints para aprovacao/recusa de pagamento (admin)
router.get('/pedidospendentes', isAuthenticated, isAdmin, new ListPedidosPendentesController().handle);
router.patch('/aprovarpagamento/:id', isAuthenticated, isAdmin, new AprovarPagamentoController().handle);
router.patch('/rejeitarpagamento/:id', isAuthenticated, isAdmin, new RejeitarPagamentoController().handle);

//endpoint para relatorio administrativo
router.get('/relatoriovendas', isAuthenticated, isAdmin, new SalesReportController().handle);
export{router};
